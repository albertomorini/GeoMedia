import json
from fastapi import FastAPI, Request, Response, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

import geomedia_helper 

# Load config
with open("./config.json") as f:
    config = json.load(f)

SHARED_KEYS = config["SHARED_KEYS"]
PORT = config["PORT"]

from body_schemas import *

############################################################################################################################################


def verify_auth(authorization: str = Header(None)):
    if authorization is None:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    if authorization not in SHARED_KEYS:
        raise HTTPException(status_code=403, detail="Invalid authorization key")

    return authorization

app = FastAPI(title="Geomedia API",
    dependencies=[Depends(verify_auth)]
    )

# ("Access-Control-Allow-Origin": "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST","GET","DELETE"],
    allow_headers=["*"],
)

############################################################################################################################################


def send_response(content, status_code: int = 200):
    return JSONResponse(content=content, status_code=status_code)
############################################################################################################################################

# AUTH

@app.post("/auth/login",tags=["AUTH"])
async def auth_login(body: auth_login, request:Request):
    ip = request.client.host if request.client else None
    headers = dict(request.headers)

    return await geomedia_helper.generic_query("auth_login",{
        "EMAIL" : body.email,
        "PASSWORD" : body.password,
        "IP" : ip,
        "HEADERS": headers
    })

@app.post("/auth/psw_reset",tags=["AUTH"])
async def auth_psw_reset(body: auth_psw_reset, request:Request):
    ip = request.client.host if request.client else None
    headers = dict(request.headers)

    return await geomedia_helper.generic_query("auth_psw_reset",{
        "USERNAMEMAIL" : body.usernamemail,
        "NEWPASSWORD" : body.newpassword,
        "OTP" : int(body.otp),
        "IP" : ip,
        "HEADERS": headers
    })

@app.post("/auth/check_otp",tags=["AUTH"])
async def auth_check_otp(body: auth_check_otp, request:Request):
    ip = request.client.host if request.client else None
    headers = dict(request.headers)
    print(body)
    return await geomedia_helper.generic_query("auth_check_otp",{
        "USERNAME" : body.username, #.get("USERNAME"),
        "OTP" : body.otp #.get("OTP"),
    })

@app.get("/auth/check_username",tags=["AUTH"])
async def auth_check_username(username:str):
    return await geomedia_helper.generic_query("auth_check_username",{"USERNAME":username})


@app.get("/auth/psw_forgotten",tags=["AUTH"])
async def auth_psw_forgotten(usernamemail:str):
    query_results = await geomedia_helper.auth_signin("auth_psw_forgotten", {"USERNAMEMAIL":usernamemail})
    return await proceed_otp(query_results,{usernamemail:usernamemail})

@app.post("/auth/signin",tags=["AUTH"])
async def auth_signin(body:auth_signin):
    query_results = await geomedia_helper.auth_signin("auth_signin", {
        "EMAIL":body.email,
        "PASSWORD":body.password,
        "USERNAME": body.username
    })
    return await proceed_otp(query_results,{"body":{
        "EMAIL":body.email,
        "PASSWORD":body.password,
        "USERNAME": body.username
    }})


async def proceed_otp(query_results:dict,body:dict):
    if query_results.get("AUTH") == 2:
        if "OTP" in query_results:
            del query_results["OTP"]  # Do not send OTP over HTTP
        return send_response(query_results, 200)
    else:
        geomedia_helper.writeLog("AUTH failed for: " + json.dumps(body), "SIGNIN")
        return send_response(query_results, 401)


#---------------------------------------------------------------------------------------------------------------------------------
# PROFILE
@app.get("/profile/pfp", tags=["USERS"])
async def profile_getpfp(
    username:str
):
    return await geomedia_helper.generic_query("profile_getpfp",{"USERNAME":username})

@app.get("/profile/info/{profile_id}", tags=["USERS"])
async def profile_getinfo(
    profile_id: int
):
    return await geomedia_helper.generic_query("profile_getinfo",{"uid":profile_id})

@app.get("/profile/stats", tags=["USERS"])
async def profile_get_stats(
    username: str ,
    mode: str
):
    print("THERE",mode,username)
    
    if(mode=="categories"):
        return await geomedia_helper.generic_query("profile_getstats_categories",{"username":username})
    elif(mode=="timemonths"):
        return await geomedia_helper.generic_query("profile_getstats_timemonths",{"username":username})
        

@app.post("/profile", tags=["USERS"])
async def profile_editinfo(
    body:profile_editinfo
):
    return await geomedia_helper.generic_query(
        "profile_editinfo",
        {
            "UID": body.uid,
            "NAME": body.name,
            "SURNAME": body.surname,
            "USERNAME": body.username,
            "PROFILE_PICTURE": body.profile_picture
        },
    )

@app.get("/users",tags=["USERS"])
async def users_list(uid:int):
    return await geomedia_helper.generic_query("users_list",{"uid":uid})

@app.post("/profile/interests",tags=["USERS"]) ## for you section merge
async def profile_interest_merge(body:profile_interest_merge):
    return await geomedia_helper.profile_interest_merge(body.uid, body.interests)

@app.get("/profile/interests",tags=["USERS"]) ## to get for you section
async def profile_interest_get(uid:int):
    return await geomedia_helper.profile_interest_get(uid)

#---------------------------------------------------------------------------------------------------------------------------------
## COLLECTIONS

# CREATE / UPDATE POST
@app.post("/collection", tags=["COLLECTION"])
async def collection_merge(body: dict, request: Request):
    body["IP"] = request.client.host
    body["HEADERS"] = dict(request.headers)
    query_results = await geomedia_helper.collection_merge(body)
    print("QR",query_results)

    if not query_results[0].get("OK"):
        raise HTTPException(
            status_code=500,
            detail={"OK": False, "MSG": query_results[1].get("MSG")},
        )

    return query_results


@app.get("/collection/hashtags",  tags=["COLLECTION"])
async def hashtag_get():
    return await geomedia_helper.hashtag_get()
    
@app.get("/collections", tags=["COLLECTION"])
@app.get("/collection/id/{collection_id}", tags=["COLLECTION"])
async def collections_get_fullcollection(
    collection_id: int | None = None,
    uid: int | None = None,
    mode: str | None = None
):
    
    if(collection_id is None):
        return await geomedia_helper.generic_query("collections_get",{"uid":uid, "mode": mode})
    else:
        return await geomedia_helper.generic_query("collections_get_fullcollection", {"collectionid":collection_id,"uid":uid})


@app.get("/collection/posts", tags=["COLLECTION"])
async def collection_posts_get(collectionid: int):
    return await geomedia_helper.generic_query("collection_posts_get",{"collectionid":collectionid})

@app.get("/collection/groupByTag",tags=["COLLECTION"])
async def collections_by_tag(uid:int):
    return await geomedia_helper.collections_by_tag(uid)

#---------------------------------------------------------------------------------------------------------------------------------

## POSTS

# CREATE / UPDATE POST
@app.post("/post",  tags=["POST"])
async def post_merge(body: post_merge, request: Request):
    

    files = body.attachments or {}
    query_results = await geomedia_helper.post_merge({
        "ID": body.id,
        "AUTHOR_ID": body.author_id,
        "TITLE": body.title,
        "COMMENT": body.comment,
        "LATITUDE": body.latitude,
        "LONGITUDE": body.longitude,
        "ALTITUDE": body.altitude,
        "VISIBILITY_AREA_KM": body.visibility_area_km,
        "COLLECTION_ID": body.collection_id,
        "EXCLUSIVITY": body.exclusivity
    })
    print(query_results)

    if not query_results[0].get("OK"):
        raise HTTPException(
            status_code=500,
            detail={"OK": False, "MSG": query_results[1].get("MSG")},
        )

    post_id = query_results[0]["ID"]
    if(len(files)>0): ## only if I have file
        ok = await geomedia_helper.hpmedia_merge_folder(post_id, files)
        if not ok:
            raise HTTPException(
                status_code=500,
                detail={"post_id": post_id, "OK": False},
            )

    ip = request.client.host
    geomedia_helper.writeLog(f"Saved post: {query_results[0].get("ID")} from IP {ip}","INFO")

    return {"post_id": post_id, "OK": True}

@app.get("/post/id/{post_id}",  tags=["POST"])
async def get_post(
    post_id: int,
    uid: int | None = None
):
    try:
        query_results = await geomedia_helper.generic_query(
            "post_get_fullpost",
            {
                "postid": post_id,
                "uid": uid,  
            }
        )
        if not query_results:
            raise HTTPException(status_code=404, detail="Post not found")

        attachments = await geomedia_helper.hpmedia_read_folder(post_id)
        if not attachments:
            attachments = []

        if query_results:
            query_results[0]["attachments"] = attachments

        return query_results
    except Exception:
        raise HTTPException(status_code=404, detail="Post not found")

# DELETE POST
@app.delete("/post/{post_id}",  tags=["POST"])
async def delete_post(post_id: int, password: str):
    try:
        return await geomedia_helper.post_delete(post_id, password)
    except Exception as e:
        raise HTTPException(status_code=501, detail="Something went wrong: "+str(e))


@app.get("/post/by_author",tags=["POST"])
async def post_by_author(uid: str,authorid: str):
    print("received", uid, authorid)
    return await geomedia_helper.generic_query("post_by_author",{
        "uid":uid,"authorid":authorid
    })

@app.post("/post/map",tags=["POST"])
async def post_get_map(body:post_get_map):
    return await geomedia_helper.post_get_map(body.uid,body.current_position,body.collection_chosen)

@app.post("/post/report_new",tags=["POST"])
async def report_new(body:report_new):
    return await geomedia_helper.generic_query("report_new",{
        "postid": body.postid,
        "uid": body.uid,
        "motive": body.motive,
        "kind": body.kind
    })

@app.delete("/post/hpmedia_remove",tags=["POST"])
async def hpmedia_remove(postid:int,filename:str):
    return await geomedia_helper.hpmedia_remove(postid,filename)

@app.get("/post/interactions_likepost",tags=["POST"])
async def interactions_likepost(postid:int,uid:int):
    return await geomedia_helper.generic_query("interactions_likepost",{postid:postid,uid:uid})

############################################################################################################################################
############################################################################################################################################
@app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], tags=["NOT HANDLED"])
async def handle_request(request: Request, full_path: str):

    path = f"/{full_path}" if full_path else "/"

    ip = request.client.host if request.client else None
    headers = dict(request.headers)
    geomedia_helper.writeLog(f"Request on path{path}, from ip {ip} and headers{headers}","404")
    
    raise HTTPException(
        status_code=404,
        detail={"msg": f"Unknown path: {path}"}
    )

# ------------------------------------------------
# HTTP
if __name__ == "__main__":
    print(f"Server started on port: {PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT
       
    )
# ------------------------------------------------
# HTTPS
# if __name__ == "__main__":
#     print(f"Server started on port: {PORT}")
#     uvicorn.run(app, host="0.0.0.0", port=PORT,
#         ssl_keyfile="/etc/letsencrypt/live/geomediasrv.duckdns.org/privkey.pem",
#         ssl_certfile="/etc/letsencrypt/live/geomediasrv.duckdns.org/fullchain.pem",
#     )