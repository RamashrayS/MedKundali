import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # Maps directly to Supabase User ID
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    profile = relationship("MedicalProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    chats = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")

class MedicalProfile(Base):
    __tablename__ = "medical_profiles"

    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    date_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    height = Column(String, nullable=True)
    weight = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="profile")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    storage_url = Column(String, nullable=False)
    report_type = Column(String, nullable=True, default="Medical Report")
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="reports")
    ai_summary = relationship("AiSummary", back_populates="report", uselist=False, cascade="all, delete-orphan")

class AiSummary(Base):
    __tablename__ = "ai_summaries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, unique=True)
    summary = Column(Text, nullable=False) # JSON or highly structured text string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    report = relationship("Report", back_populates="ai_summary")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="chats")
