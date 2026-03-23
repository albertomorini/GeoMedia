// associate to each sotred procedure/query a function, thus to better encapsulate and isolate the functionality
//TODO: to rename this class in helper?
const SQL_MANAGER = require("./SQL_MANAGER");
const fs = require("fs")
const config = JSON.parse(fs.readFileSync("./config.json"))
const path = require("path");

const mailer = require("./mailer")
const PATH_UPLOADS = config.FOLDERS.UPLOADS

////////////////////////////////////////////

/**
 * 
 * @param {string} path must match with procedure name
 * @param {JSON/OBJECT} body to serialize and pass to the function as `@JSON` parameter
 * @returns 
 */
function generic_query(path, body) {
    let dummy = JSON.stringify(body).replaceAll("'", "''")

    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC " + path.replaceAll("/", "") + " @JSON='" + dummy + "'")
}

/////////////////////////////////////////////


function merge_post(post_content) {
    let dummy = JSON.stringify(post_content).replaceAll("'", "''");
    console.log("EXEC dbo.POST_MERGE @POST_CONTENT='" + dummy + "'")
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC dbo.POST_MERGE @POST_CONTENT='" + dummy + "'")
}

async function hpmedia_merge_folder(postid, attachments) {
    try {
        let post_folder = path.join(PATH_UPLOADS, String(postid))

        if (!fs.existsSync(post_folder)) {
            fs.mkdirSync(post_folder, { recursive: true })
        }

        let hypermedia_reference = []
        attachments.filter(f => f.updated).forEach(f => { //re-save/save only file updated
            var buffer = Buffer.from(f.base64, 'base64', f.base64.length) //REMOVE BASE64
            const filepath = path.join(post_folder, f.filename);
            console.log("Storing file: ", filepath);

            fs.writeFileSync(filepath, buffer, { encoding: 'utf8' });
            hypermedia_reference.push({
                "filename": f.filename,
                "filepath": filepath,
                "mimetype": f.mimetype,
                "post_id": postid
            })
            hypermedia_reference.push(filepath)
        })


        file_present = fs.readdirSync(post_folder)
        filename_attached = attachments.map(f => f.filename)
        file_to_remove = file_present.filter(f => !filename_attached.includes(f))
        file_to_remove.forEach(f => {
            fs.unlinkSync(f)
        })
        console.log("Storing in hypermedia table: ", hypermedia_reference);

        console.log(
            "EXEC HPMEDIA_MERGEFILE @FILESNAME_ATTACHED='" + JSON.stringify(hypermedia_reference).replaceAll("'", "''") + "',@POSTID=" + postid
        );
        

        return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC HPMEDIA_MERGEFILE @FILESNAME_ATTACHED='" + JSON.stringify(hypermedia_reference).replaceAll("'", "''") + "',@POSTID=" + postid)
    } catch (error) {
        //TODO: 2 logrr
        console.log(error);

        // return new Promise.resolve([{ "OK": false, "MSG": error }])
    }
}

async function auth_signin(procedure, body, ip, headers) {
    try {
        query_results = await generic_query(procedure, body)
        query_results = query_results[0]
        if (query_results.AUTH == 2) {
            let x = mailer.send_email_otp(body?.EMAIL, { "USERNAME": body?.USERNAME, "OTP": query_results.OTP })
            //TODO: logs on file/db
            delete query_results.OTP
        }
        return query_results

    } catch (error) {
        return { "error": error, "AUTH": 0 }
    }
}


function checkAREA(areaKM, post_latitude, post_longitude, curr_latitude, curr_longitude) {

    var dLat = (post_latitude - curr_latitude) * Math.PI / 180;
    var dLon = (post_longitude - curr_longitude) * Math.PI / 180;
    var a = 0.5 - Math.cos(dLat) / 2 + Math.cos(curr_latitude * Math.PI / 180) * Math.cos(post_latitude * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;

    d = Math.round(6371000 * 2 * Math.asin(Math.sqrt(a))); // in meters
    if (d <= areaKM * 1000) { //transform areaKM to meters
        return true
    } else {
        return false
    }

}

async function getPosts(curr_latitude = null, curr_longitude = null, username = null) {

    let posts = await SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC GETPOSTS @USERNAME='" + username + "'")

    let results = []
    posts.forEach(pp => {
        if (pp.AREA_KM != null) { // check if users' position is within the post availability
            if (checkAREA(pp.AREA_KM, pp.LATITUDE, pp.LONGITUDE, curr_latitude, curr_longitude)) {
                results.push(pp)
            }
        } else {
            results.push(pp)
        }
    })
    return results

}

function getMediaPost(postid) {
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC GETMEDIAPOST @POSTID=" + postid)
}

function deletePost(postid, username, password) { //TODO: to put in secure mode (not in this version/demo)
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC DELETEPOST @POSTID=" + postid + ", @USER='" + username + "', @PASSWORD='" + password + "'")
}

module.exports = {
    generic_query,
    ////////////////
    merge_post,
    ////////////////
    auth_signin,
    ////////////////
    getPosts,
    deletePost,
    getMediaPost
    ///////////////

    , hpmedia_merge_folder
}