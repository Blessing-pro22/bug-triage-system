from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt

from ..database import get_db
from .. import auth_models, auth_schemas

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = "your-secret-key-change-this-in-production"  # TODO: Move to environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(auth_models.User).filter(auth_models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(current_user: auth_models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@router.post("/register", response_model=auth_schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user: auth_schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if username exists
    existing_user = db.query(auth_models.User).filter(auth_models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    existing_email = db.query(auth_models.User).filter(auth_models.User.email == user.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = auth_models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        created_at=datetime.utcnow()
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=auth_schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login with username and password."""
    user = db.query(auth_models.User).filter(auth_models.User.username == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=auth_schemas.UserOut)
def read_users_me(current_user: auth_models.User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user


@router.get("/users", response_model=list[auth_schemas.UserOut])
def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: auth_models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all users (admin only)."""
    if current_user.role != auth_models.UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to list users"
        )
    
    users = db.query(auth_models.User).offset(skip).limit(limit).all()
    return users


@router.post("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    current_user: auth_models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Activate a user (admin only)."""
    if current_user.role != auth_models.UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to activate users"
        )
    
    user = db.query(auth_models.User).filter(auth_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    db.commit()
    
    return {"message": f"User {user.username} activated"}


@router.post("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    current_user: auth_models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deactivate a user (admin only)."""
    if current_user.role != auth_models.UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to deactivate users"
        )
    
    user = db.query(auth_models.User).filter(auth_models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": f"User {user.username} deactivated"}
