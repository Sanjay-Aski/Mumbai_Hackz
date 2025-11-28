from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.models.schemas import UserRegister, UserLogin, Token, UserProfile
from app.services.auth_service import auth_service, get_current_user
from app.core.database import get_db
from app.models.database import User, UserPermissions
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=Token)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Create user
        user = auth_service.create_user(
            db=db,
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name,
            age=user_data.age,
            profession=user_data.profession,
            location=user_data.location,
            income_monthly=user_data.income_monthly,
            savings_target=user_data.savings_target
        )
        
        # Create default permissions
        permissions = UserPermissions(
            user_id=user.id,
            biometric_data=True,
            browsing_behavior=True,
            intervention_analytics=True
        )
        db.add(permissions)
        db.commit()
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = auth_service.create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            user_id=user.id,
            email=user.email,
            full_name=user.full_name
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    user = auth_service.authenticate_user(
        db, user_credentials.email, user_credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = auth_service.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name
    )

@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.put("/profile", response_model=UserProfile)
async def update_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    # Update allowed fields
    allowed_fields = {
        'full_name', 'age', 'profession', 'location', 
        'income_monthly', 'savings_target'
    }
    
    for field, value in profile_data.items():
        if field in allowed_fields and hasattr(current_user, field):
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user