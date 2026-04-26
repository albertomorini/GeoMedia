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
PORT = 9911

app = FastAPI(title="Geomedia API")

# ("Access-Control-Allow-Origin": "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST","GET","DELETE"],
    allow_headers=["*"],
)

############################################################################################################################################

def check_auth(authorization: str = None):
    if not authorization or authorization not in SHARED_KEYS:
        raise HTTPException(
            status_code=401,
            detail={
                "auth": 0,
                "msg": "Invalid API key",
            }
        )
    return True

def send_response(content, status_code: int = 200):
    return JSONResponse(content=content, status_code=status_code)

async def dispatch_req(path: str, body: dict):
    try:
        if path in ("/auth_psw_forgotten", "/auth_signin"):
            query_results = await geomedia_helper.auth_signin(path, body)
            print("QRSR",query_results,query_results.get("AUTH"))
            if query_results.get("AUTH") == 2:
                if "OTP" in query_results:
                    del query_results["OTP"]  # Do not send OTP over HTTP
                return send_response(query_results, 200)
            else:
                geomedia_helper.writeLog("AUTH failed for: " + json.dumps(body), "SIGNIN")
                return send_response(query_results, 401)

        # Generic query
        generic_routes = {
            "/auth_login", "/auth_psw_reset",
            "/auth_check_otp", "/interactions_likepost", "/hpmedia_remove",
            "/users_list","/report_new", "/auth_check_username", "/collection_posts_get",
            "/post_get_authorid"
        }

        if path in generic_routes:
            return await geomedia_helper.generic_query(path, body)

        elif path == "/post_get_map":
            return await geomedia_helper.post_get_map(
                body.get("uid"),
                body.get("current_position"),
                body.get("collection_chosen")
            )

        else:
            raise HTTPException(status_code=404, detail={"msg": f"Unknown path: {path}"})

    except Exception as error:
        geomedia_helper.writeLog(str(error), "ERROR")
        raise HTTPException(
            status_code=500,
            detail={"Internal_Server_Error": str(error)}
        )

# PROFILE
@app.get("/profile/pfp")
async def profile_getpfp(username:str,
 authorization: str = Header(None)
):
    check_auth(authorization)
    print(username)
    return await geomedia_helper.generic_query("profile_getpfp",{"USERNAME":username})

@app.get("/profile")
@app.get("/profile/{profile_id}")
@app.get("/profile/{username}")
async def profile_getinfo(
    username: str | None = None,
    uid: int | None = None,
    authorization: str = Header(None)
):
    check_auth(authorization)
    print("HERE",username,uid)
    return await geomedia_helper.generic_query("profile_getinfo",{"uid":uid,"username":username})

@app.get("/stats/profile")
async def profile_get_stats(
    username: str ,
    mode: str,
    authorization: str = Header(None)
):
    print("THERE",mode,username)
    check_auth(authorization)
    if(mode=="categories"):
        return await geomedia_helper.generic_query("profile_getstats_categories",{"username":username})
    elif(mode=="timemonths"):
        return await geomedia_helper.generic_query("profile_getstats_timemonths",{"username":username})
        

@app.post("/profile")
async def profile_editinfo(
    body:dict,
    authorization: str = Header(None)
):
    check_auth(authorization)
    return await geomedia_helper.generic_query("profile_editinfo",body)


## COLLECTIONS

# CREATE / UPDATE POST
@app.post("/collection")
async def collection_merge(body: dict, request: Request, authorization: str = Header(None)):
    check_auth(authorization)

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


@app.get("/collection/hashtags")
async def collections_get_hashtags():
    return await geomedia_helper.collections_get_hashtags()
    
@app.get("/collection")
@app.get("/collection/{collection_id}")
async def collections_get_fullcollection(
    collection_id: int | None = None,
    uid: int | None = None,
    mode: str | None = None,
    authorization: str = Header(None),
):
    check_auth(authorization)
    if(collection_id is None):
        return await geomedia_helper.generic_query("collections_get",{"uid":uid, "mode": mode})
    else:
        return await geomedia_helper.generic_query("collections_get_fullcollection", {"collectionid":collection_id,"uid":uid})


    
#---------------------------------------------------------------------------------------------------------------------------------


## POSTS

# CREATE / UPDATE POST
@app.post("/post")
async def create_post(body: dict, request: Request, authorization: str = Header(None)):
    check_auth(authorization)
    print("HERE",body)

    body["IP"] = request.client.host
    body["HEADERS"] = dict(request.headers)

    postdata = body.get("postdata", {})
    files = json.loads(json.dumps(postdata.get("attachments", [])))

    postdata.pop("attachments", None)

    query_results = await geomedia_helper.post_merge(postdata)
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

    return {"post_id": post_id, "OK": True}

@app.get("/post/{post_id}")
async def get_post(
    post_id: int,
    uid: int | None = None,
    authorization: str = Header(None),
):
    check_auth(authorization)
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
@app.delete("/post/{post_id}")
async def delete_post(post_id: int, password: str, authorization: str = Header(None)):
    try:
        check_auth(authorization)
        print("HERE",post_id,password)
        result = await geomedia_helper.post_delete(post_id, password)
        return result
    except Exception as e:
        raise HTTPException(status_code=501, detail="Something went wrong: "+str(e))

############################################################################################################################################
############################################################################################################################################
@app.post("/{full_path:path}")
async def handle_request(request: Request, full_path: str):
    # Reconstruct path like "/something"
    path = f"/{full_path}" if full_path else "/"

    # Authorization check
    auth_header = request.headers.get("authorization")
    check_auth(auth_header)

    try:
        body = await request.json()
    except Exception:
        body = {}

    body["IP"] = request.client.host if request.client else None
    body["HEADERS"] = dict(request.headers)

    # Dispatch ROUTE
    result = await dispatch_req(path, body)

    # If dispatch already returned a Response object (e.g. special cases), return it
    if isinstance(result, Response):
        return result

    # Otherwise return the data (200 OK)
    return result


if __name__ == "__main__":
    print(f"Server started on port: {PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)