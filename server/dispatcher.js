// associate to each sotred procedure/query a function, thus to better encapsulate and isolate the functionality
//TODO: to rename this class in helper?
const SQL_MANAGER = require("./SQL_MANAGER");
const fs = require("fs")
const config = JSON.parse(fs.readFileSync("./config.json"))
const path = require("path");

const mailer = require("./mailer")
const PATH_UPLOADS = config.FOLDERS.UPLOADS

///
/**
 * 
 * @param {string} message error message
 * @param {string} scope type of log
 */
function writeLog(message, scope = "ERROR") {
    fs.appendFileSync('./log.txt', scope + ' ,' + Date.now() + ',' + message + "/n")
}

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

/**
 * Create or Update the POST (as SQL defined, metdata)
 * @param {JSON} post_content the metadata of the post
 * @returns {Object} the post modified/created without attachments, just the metadata
 */
function merge_post(post_content) {
    let dummy = JSON.stringify(post_content).replaceAll("'", "''");
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC dbo.POST_MERGE @POST_CONTENT='" + dummy + "'")
}

/**
 * 
 * @param {int} postid  unique identifier of the post
 * @param {Array[Object]} attachments files (filename, mimetype,base64)
 * @returns  the filename encoded in database as register (so the table that store the binding)
 */
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

        return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC HPMEDIA_MERGEFILE @FILESNAME_ATTACHED='" + JSON.stringify(hypermedia_reference).replaceAll("'", "''") + "',@POSTID=" + postid)
    } catch (error) {
        writeLog("Error on merge_folder: " + error, "HPMEDIA")
        console.error(error);
        return new Promise.resolve([{ "OK": false, "MSG": error }])
    }
}

/**
 * returns the file attached into a post
 * @param {int} postid  unique identifier of the post
 * @returns {Array[Object]} the whole files attached, both filename/mimetype than base64 encoded
 */
async function hpmedia_read_folder(postid) {
    let files = await SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC HPMEDIA_GETFILES @POSTID=" + postid)
    return files.map(f => {
        f.BASE64 = fs.readFileSync(f?.FILEPATH, { encoding: "base64" })
        return f
    })
}

/**
 * Create a new user
 * @param {String} procedure of SQL to register the user
 * @param {Object} body the whole body passed included ip/headers
 * @returns 2 auth pending (GOOD) otherwise 0, if positive send the OTP via email
 */
async function auth_signin(procedure, body) {
    try {
        query_results = await generic_query(procedure, body)
        query_results = query_results[0]
        if (query_results.AUTH == 2) {
            let x = mailer.send_email_otp(body?.EMAIL, { "USERNAME": body?.USERNAME, "OTP": query_results.OTP })
            writeLog("OTP requested for: " + body?.EMAIL, "OTP")
            delete query_results.OTP
        }
        return query_results

    } catch (error) {
        return { "error": error, "AUTH": 0 }
    }
}

//TODO: to comment
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

/**
 * Get the post visible of the map (just the coordinate and the basic metadata)
 * @param {int} uid  of the user requesting
 * @param {Object} current_position current position of the user (latitude/longitude), used to compute the exclusivity
 * @param {Array[int]} collection_chosen the collection choosen by the users, in order to filtering just the type of post requested
 * @returns 
 */
async function post_get_map(uid, current_position, collection_chosen = []) {

    let posts = await SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC POST_GET_MAP @UID='" + uid + "', @COLLECTIONS_CHOSEN='" + JSON.stringify(collection_chosen) + "'")

    let results = []
    posts.forEach(pp => {
        // check if users' position is within the post availability
        if (checkAREA(pp.VISIBILITY_AREA_KM, pp.LATITUDE, pp.LONGITUDE, current_position.latitude, current_position.longitude)) {
            results.push(pp)
        }
    })
    return results
}

async function post_delete(postid,password) {
    writeLog("Requested deletion for: "+postid+" = with pas[10]"+password.substring(0,10)); // i do not like to log the whole password, since hashed, the first 5chars are quite enough to give us and idea if correct or not
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(),"EXEC POST_DELETE @POSTID="+postid+", @PASSWORD='"+password+"'")
}


module.exports = {
    writeLog
    , generic_query
    ////////////////
    ////////////////
    , auth_signin
    ////////////////
    , merge_post
    , post_get_map
    , post_delete
    ///////////////

    , hpmedia_merge_folder
    , hpmedia_read_folder
}