from pydantic import BaseModel, Field, model_validator
from typing import Optional

class CaseInsensitiveModel(BaseModel):
    @model_validator(mode="before")
    @classmethod
    def normalize_keys(cls, data):
        if isinstance(data, dict):
            return {str(k).lower(): v for k, v in data.items()}
        return data

class auth_login(BaseModel):
    email: str  = Field(..., description="Email or username")
    password: str
  
class auth_signin(BaseModel):
    email: str
    username: str
    password: str

class auth_psw_forgotten(BaseModel):
    usernamemail: str

class auth_psw_reset(BaseModel):
    usernamemail: str = Field(..., description="Email or username")
    newpassword: str
    otp: str

class auth_check_otp(BaseModel):
    username: str
    otp: int

class report_new(BaseModel):
    postid: int
    uid: int
    motive: str
    kind: str

class Position(BaseModel):
    latitude: float
    longitude: float

class post_get_map(BaseModel):
    uid: int
    current_position: Position
    collection_chosen: list[int]

class profile_editinfo(BaseModel):
    auth: Optional[int] = None
    uid: int
    email: Optional[str] = None
    name: Optional[str] = None
    surname: Optional[str] = None
    username: Optional[str] = None
    profile_picture: Optional[str] = None

class collection_merge(BaseModel):
    id: int                
    title: str             
    ownerid: int           
    description: str       
    hashtags: list[str]    
    creators: list[int]     
    viewers: list[int]      
    excl_date_start: str   
    excl_date_end: str     
    recurrent: str         
    remote_posting: bool   
    sequentials: dict      
    icon: str              
    color: str             


class post_merge(BaseModel):
    id: Optional[int] = None
    collection_id: int
    title: str
    comment: Optional[str] = None
    author_id: int
    exclusivity: Optional[dict] = None
    visibility_area_km: int
    color: str
    icon: str
    collection_name: str
    remote_posting_enabled: bool
    latitude: float
    longitude: float
    altitude: float
    attachments: list

class Interest(BaseModel):
    value: str
    entity: str

class profile_interest_merge(BaseModel):
    uid: int
    interests: list[Interest]
    
