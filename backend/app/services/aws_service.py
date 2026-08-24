import json

import boto3
from datetime import datetime

from app.core.database import SessionLocal
from app.models.log import Log


class AWSService:
    """
    Service responsible for collecting and normalizing
    AWS CloudTrail events for TrustField.
    """

    def __init__(
        self,
        profile_name: str = "trustfield",
        region_name: str = "ap-south-1"
    ):
        self.session = boto3.Session(
            profile_name=profile_name,
            region_name=region_name
        )

        self.cloudtrail = self.session.client(
            "cloudtrail",
            region_name=region_name
        )

    def get_recent_events(
        self,
        max_results: int = 50
    ) -> list[dict]:
        """
        Retrieve recent AWS CloudTrail management events.
        """

        response = self.cloudtrail.lookup_events(
            MaxResults=max_results
        )

        return response.get("Events", [])

    def normalize_event(self, event: dict) -> dict:
        """
        Convert a raw AWS CloudTrail event into
        the format expected by TrustField.
        """

        cloudtrail_event = {}

        raw_event = event.get("CloudTrailEvent")

        if raw_event:
            try:
                cloudtrail_event = json.loads(raw_event)
            except json.JSONDecodeError:
                cloudtrail_event = {}

        user_identity = cloudtrail_event.get(
            "userIdentity",
            {}
        )

        username = (
            event.get("Username")
            or user_identity.get("userName")
            or user_identity.get("arn")
            or "unknown"
        )

        event_name = event.get(
            "EventName",
            "Unknown"
        )

        event_source = event.get(
            "EventSource",
            "unknown"
        )

        source_ip = cloudtrail_event.get(
            "sourceIPAddress"
        )

        event_time = event.get(
            "EventTime"
        )

        read_only = event.get(
            "ReadOnly",
            False
        )

        error_code = cloudtrail_event.get(
            "errorCode"
        )

        status = "failed" if error_code else "success"

        return {
            "username": username,
            "action": event_name,
            "resource_type": event_source,
            "resource_id": None,
            "status": status,
            "ip_address": source_ip,
            "timestamp": event_time,
            "details": json.dumps({
                "event_name": event_name,
                "event_source": event_source,
                "read_only": read_only,
                "aws_region": cloudtrail_event.get(
                    "awsRegion"
                ),
                "event_id": cloudtrail_event.get(
                    "eventID"
                ),
                "error_code": error_code,
                "error_message": cloudtrail_event.get(
                    "errorMessage"
                ),
            })
        }

    def get_normalized_events(
        self,
        max_results: int = 50
    ) -> list[dict]:
        """
        Retrieve CloudTrail events and convert them
        into TrustField-compatible event dictionaries.
        """

        events = self.get_recent_events(
            max_results=max_results
        )

        return [
            self.normalize_event(event)
            for event in events
        ]
        
    def save_events_to_database(self, max_results: int = 50) -> int:

        events = self.get_normalized_events(
               max_results=max_results
        )

        db = SessionLocal()

        saved_count = 0

        try:
            for event in events:

                # Avoid inserting the same event repeatedly.
                event_id = None

                try:
                    import json

                    details = json.loads(
                        event["details"]
                    )

                    event_id = details.get(
                        "event_id"
                    )

                except Exception:
                    pass

                if event_id:
                    existing = (
                        db.query(Log)
                        .filter(
                            Log.details.contains(
                                event_id
                            )
                        )
                        .first()
                    )

                    if existing:
                        continue

                timestamp = event["timestamp"]

                if isinstance(timestamp, str):
                    timestamp = datetime.fromisoformat(
                        timestamp.replace(
                            "Z",
                            "+00:00"
                        )
                    )

                log = Log(
                    user_id=None,
                    username=event["username"],
                    action=event["action"],
                    resource_type=event["resource_type"],
                    resource_id=event["resource_id"],
                    status=event["status"],
                    ip_address=event["ip_address"],
                    details=event["details"],
                    timestamp=timestamp
                )

                db.add(log)

                saved_count += 1

            db.commit()

            return saved_count

        except Exception:
            db.rollback()
            raise

        finally:
            db.close()