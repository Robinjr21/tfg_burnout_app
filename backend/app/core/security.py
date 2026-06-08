import base64
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from jose import JWTError, jwt
from app.core.config import settings



def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    plain_bytes = plain.encode("utf-8")[:72]
    return bcrypt.checkpw(plain_bytes, hashed.encode("utf-8"))


# --- JWT ---
def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {"sub": subject, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": subject, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


# --- Cifrado AES-256-GCM para texto de las entradas ---
def _get_aes_key() -> bytes:
    raw = settings.ENTRY_ENCRYPTION_KEY.encode()
    return raw[:32].ljust(32, b"\x00")


def encrypt_text(plaintext: str) -> str:
    """Cifra texto libre. Devuelve base64(nonce + ciphertext)."""
    key = _get_aes_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), None)
    return base64.b64encode(nonce + ciphertext).decode()


def decrypt_text(token: str) -> str:
    """Descifra texto. Lanza excepción si el token está corrupto."""
    key = _get_aes_key()
    aesgcm = AESGCM(key)
    raw = base64.b64decode(token.encode())
    nonce, ciphertext = raw[:12], raw[12:]
    return aesgcm.decrypt(nonce, ciphertext, None).decode()