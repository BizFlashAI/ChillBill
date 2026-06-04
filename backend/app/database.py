import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Use /data for persistent volume in production (Fly.io), fallback to local for dev
_db_dir = "/data" if os.path.isdir("/data") else "."
SQLALCHEMY_DATABASE_URL = f"sqlite:///{_db_dir}/chillbill.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
