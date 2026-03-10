// associate to each sotred procedure/query a function, thus to better encapsulate and isolate the functionality

const SQL_MANAGER = require("./SQL_MANAGER");
////////////////////////////////////////////

/**
 * 
 * @param {string} path must match with procedure name
 * @param {JSON/OBJECT} body to serialize and pass to the function as `@JSON` parameter
 * @returns 
 */
function generic_query(path, body) {
    let dummy = JSON.stringify(body).replaceAll("'", "''")
    console.log(
        "EXEC " + path.replaceAll("/", "") + " @JSON='" + dummy + "'"
    );
    
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC " + path.replaceAll("/","") + " @JSON='" + dummy + "'")
}

/////////////////////////////////////////////


function merge_post(post_content) {
    let dummy = JSON.stringify(post_content).replaceAll("'", "''");
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC post.POST_MERGE @POST_CONTENT='" + dummy + "'")
}


function hpmedia_link(data){
    
}

function newPost(author, postcontent) {
    let dummy_pc = JSON.stringify(postcontent).replaceAll("'", '')
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC NEWPOST @AUTHOR='" + author + "', @POSTCONTENT='" + dummy_pc + "'")
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
    newPost,
    getPosts,
    deletePost,
    getMediaPost
}