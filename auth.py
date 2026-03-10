from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from config import settings
from db import db
from models import Role


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(seconds=settings.JWT_EXPIRE_SECONDS))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALG)
    return encoded_jwt


async def authenticate_user(email: str, password: str):
    user = await db.users.find_one({"email": email})
    if not user:
        return None
    if not verify_password(password, user.get("password_hash", "")):
        return None
    return user


class CurrentUser:
    def __init__(self, user_id: str, role: Role, patient_id: str | None = None, doctor_id: str | None = None):
        self.user_id = user_id
        self.role = role
        self.patient_id = patient_id
        self.doctor_id = doctor_id


async def get_current_user(token: str = Depends(oauth2_scheme)) -> CurrentUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        patient_id: str | None = payload.get("patient_id")
        doctor_id: str | None = payload.get("doctor_id")
        if user_id is None or role is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # lightweight fetch; assumes user still exists
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise credentials_exception

    return CurrentUser(user_id=user_id, role=Role(role), patient_id=patient_id, doctor_id=doctor_id)


async def require_role(required: Role, current: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if current.role != required:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
    return current

