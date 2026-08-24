from app.services.aws_service import AWSService


aws = AWSService()

print("\n================================")
print("TRUSTFIELD AWS EVENT PIPELINE")
print("================================")

saved = aws.save_events_to_database(
    max_results=5
)

print(f"New events saved to database: {saved}")