import boto3
from botocore.client import Config

from config import settings


def s3_client():
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        endpoint_url=settings.S3_ENDPOINT_URL,
        config=Config(signature_version="s3v4"),
    )


def presign_get_url(key: str, expires: int | None = None) -> str:
    """Generate a time-limited signed URL to read an object."""

    client = s3_client()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET, "Key": key},
        ExpiresIn=expires or settings.SIGNED_URL_TTL_SECONDS,
    )


def upload_bytes(key: str, data: bytes, content_type: str) -> None:
    client = s3_client()
    client.put_object(
        Bucket=settings.S3_BUCKET,
        Key=key,
        Body=data,
        ContentType=content_type,
        ServerSideEncryption="aws:kms",
    )
