// associate to each sotred procedure/query a function, thus to better encapsulate and isolate the functionality

const SQL_MANAGER = require("./SQL_MANAGER");
////////////////////////////////////////////


function doLogin(username, password, newuser) {
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC DoLogin @USERNAME='" + username + "', @PASSWORD='" + password + "'" + ", @NEWUSER=" + newuser)
}

function newPost(author, postcontent) {
    let dummy_pc = JSON.stringify(postcontent)
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC NEWPOST @AUTHOR='" + author + "', @POSTCONTENT='" + dummy_pc + "'")
}

function checkAREA(areaKM, post_latitude, post_longitude, curr_latitude, curr_longitude) {


    // let coef = areaKM / 111320.0;
    // let new_lat = post_latitude + coef
    // let new_long = post_longitude + coef / Math.cos(post_latitude * 0.01745)

    // console.log(Math.abs(new_lat - curr_latitude) * -1000);

    // if (
    //     (Math.abs(new_lat - curr_latitude)  < areaKM) &&
    //     (Math.abs(new_long - curr_longitude)  < areaKM)
    // ) {
    //     return true
    // } else {
    //     return false
    // }


    var dLat = (post_latitude - curr_latitude) * Math.PI / 180;
    var dLon = (post_longitude - curr_longitude) * Math.PI / 180;
    var a = 0.5 - Math.cos(dLat) / 2 + Math.cos(curr_latitude * Math.PI / 180) * Math.cos(post_latitude * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;

    d = Math.round(6371000 * 2 * Math.asin(Math.sqrt(a))); // in meters
    console.log(d);
    if (d <= areaKM * 1000) { //transform areaKM to meters
        return true
    } else {
        return false
    }

}

async function getPosts(curr_latitude = null, curr_longitude = null, username = null) {
    let posts = await SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC GETPOSTS @LATITUDE= " + curr_latitude + ", @LONGITUDE=" + curr_longitude + ",@USERNAME='" + username + "'")

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
    doLogin,
    newPost,
    getPosts,
    deletePost,
    getMediaPost
}