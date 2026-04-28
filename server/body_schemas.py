from pydantic import BaseModel, Field, model_validator

class CaseInsensitiveModel(BaseModel):
    @model_validator(mode="before")
    @classmethod
    def normalize_keys(cls, data):
        if isinstance(data, dict):
            return {k.lower(): v for k, v in data.items()}
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
    otp: int

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