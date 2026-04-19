import json
from fastapi import FastAPI, Request, Response, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

import geomedia_helper  

# Load config
with open("./config.json") as f:
    config = json.load(f)

SHARED_KEY = config["SHARED_KEY"]
PORT = 9911

app = FastAPI(title="Geomedia API")

# ("Access-Control-Allow-Origin": "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def check_auth(authorization: str = None):
    if not authorization or authorization != SHARED_KEY:
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
            if query_results.get("AUTH") == 2:
                if "OTP" in query_results:
                    del query_results["OTP"]  # Do not send OTP over HTTP
                return send_response(query_results, 200)
            else:
                geomedia_helper.writeLog("AUTH failed for: " + json.dumps(body), "SIGNIN")
                return send_response(query_results, 401)

        elif path == "/post_merge":
            postdata = body.get("postdata", {})
            files = json.loads(json.dumps(postdata.get("attachments", [])))  # deep copy

            # Remove attachments before passing to DB
            if "attachments" in postdata:
                del postdata["attachments"]

            query_results = await geomedia_helper.post_merge(postdata)

            if not query_results[0].get("OK"):
                return send_response({"OK": False, "MSG": query_results[1].get("MSG")}, 500)

            post_id = query_results[0]["ID"]
            x = geomedia_helper.hpmedia_merge_folder(post_id, files)

            if x:
                return send_response({"post_id": post_id, "OK": True}, 200)
            else:
                return send_response({"post_id": post_id, "OK": False}, 500)

        elif path == "/post_get_fullpost":
            query_results = await geomedia_helper.generic_query("post_get_fullpost", body)
            ff = await geomedia_helper.hpmedia_read_folder(body.get("postid"))
            if ff is None or len(ff) == 0:
                ff = []
            if query_results and len(query_results) > 0:
                query_results[0]["attachments"] = ff
            return send_response(query_results, 200)

        elif path == "/post_delete":
            result = await geomedia_helper.post_delete(body.get("postid"), body.get("password")) 
            return result 

        # Generic query
        generic_routes = {
            "/checkConnection",
            "/auth_login", "/auth_psw_reset", "/profile_editinfo", "/profile_getpfp",
            "/profile_getinfo", "/profile_getstats_categories", "/profile_getstats_timemonths",
            "/auth_check_otp", "/interactions_likepost", "/hpmedia_remove",
            "/collections_get", "/collections_get_fullcollection", "/users_list",
            "/report_new", "/auth_check_username", "/collection_posts_get",
            "/post_get_authorid", "/collection_merge", "/post_get_map",
        }

        if path in generic_routes:
            if path == "/checkConnection":
                return {"HELLO": "From server!"}
            return await geomedia_helper.generic_query(path, body)

        elif path == "/collection_merge":
            return await geomedia_helper.collection_merge(body.get("collectionData"))

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




# ------------------------
# POSTS

# CREATE / UPDATE POST
@app.post("/post")
async def create_post(body: dict, request: Request, authorization: str = Header(None)):
    check_auth(authorization)

    body["IP"] = request.client.host
    body["HEADERS"] = dict(request.headers)

    postdata = body.get("postdata", {})
    files = json.loads(json.dumps(postdata.get("attachments", [])))

    postdata.pop("attachments", None)

    query_results = await geomedia_helper.post_merge(postdata)

    if not query_results[0].get("OK"):
        raise HTTPException(
            status_code=500,
            detail={"OK": False, "MSG": query_results[1].get("MSG")},
        )

    post_id = query_results[0]["ID"]
    ok = geomedia_helper.hpmedia_merge_folder(post_id, files)

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

    query_results = await geomedia_helper.generic_query(
        "post_get_fullpost",
        {
            "postid": post_id,
            "uid": uid,  
        },
    )

    print("HERE", query_results)

    attachments = await geomedia_helper.hpmedia_read_folder(post_id)
    if not attachments:
        attachments = []

    if query_results:
        query_results[0]["attachments"] = attachments

    return query_results

# DELETE POST
@app.delete("/post/{post_id}")
async def delete_post(post_id: int, password: str, authorization: str = Header(None)):
    check_auth(authorization)

    result = await geomedia_helper.post_delete(post_id, password)
    return result


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