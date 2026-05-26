from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.models.models import User, MedicalProfile
from backend.schemas.schemas import MedicalProfileUpdate
from backend.routes.auth import get_current_user

router = APIRouter(tags=["User Profile"])

@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == current_user.id).first()
    if not profile:
        # Create profile dynamically if missing
        profile = MedicalProfile(
            user_id=current_user.id,
            date_of_birth="",
            gender="",
            blood_group="",
            height="",
            weight=""
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    return {
        "email": current_user.email,
        "name": current_user.name,
        "date_of_birth": profile.date_of_birth,
        "gender": profile.gender,
        "blood_group": profile.blood_group,
        "height": profile.height,
        "weight": profile.weight
    }

@router.put("/profile")
def update_profile(
    profile_data: MedicalProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == current_user.id).first()
    if not profile:
        profile = MedicalProfile(user_id=current_user.id)
        db.add(profile)
        
    # Update fields
    if profile_data.date_of_birth is not None:
        profile.date_of_birth = profile_data.date_of_birth
    if profile_data.gender is not None:
        profile.gender = profile_data.gender
    if profile_data.blood_group is not None:
        profile.blood_group = profile_data.blood_group
    if profile_data.height is not None:
        profile.height = profile_data.height
    if profile_data.weight is not None:
        profile.weight = profile_data.weight
        
    db.commit()
    db.refresh(profile)
    
    return {
        "email": current_user.email,
        "name": current_user.name,
        "date_of_birth": profile.date_of_birth,
        "gender": profile.gender,
        "blood_group": profile.blood_group,
        "height": profile.height,
        "weight": profile.weight
    }
