// wrapper for tedious modules (MSSQL) 

var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var fs = require('fs');
const Cypher = require("./CYPHER.js")

////////////////////////////////////////////////////
// @return  {[JSON]}  [dizonario js di configurazione]
function loadConfig(path="./DBconfig.json") {
    let tmpFile = fs.readFileSync(path, 'utf-8');
    try {
        let config = JSON.parse(tmpFile);
        return config;
    } catch (error) { //NOT A JSON --> DECODE
        let config = Cypher.decrypt("Fidelio99", fs.readFileSync(path, 'utf-8'))
        return JSON.parse(config);
    }
}

/**
 * 
 * @param {string} tabella tabella su cui effettuare la select 
 * @param {string} profile profilo della configurazione
 * @param {string} chiave quale riga prendere (where)
 * @returns {JSON} configurazione
 */
function loadConfigFromDB(tabella, profile, chiave="DBCONFIG"){
    return new Promise((res,rej)=>{
        selectQuery(loadConfig(), "SELECT KEY_VALUE FROM "+tabella+" WHERE PROFILE='"+profile+"' AND KEY_DEF='"+chiave+"'").then(resQuery=>{
            resQuery.length == 0 ? res(null) : res(JSON.parse((resQuery[0].KEY_VALUE).replace(/\s/g, '')));
        }).catch(err=>{
            rej(err)
        })
    });
}

/**
* Crea una connessione al database
* @param   {[Object/Dictionary]}  config la configurazione ritornata da loadConfig()
* @return  {[Object]} ritorna l'oggetto connessione del database
*/
function createConnection(config) {
    return new Promise((resolve, reject) => {
        var connection = new Connection(config);
        connection.connect(); //start che connection

        // Setup event handler when the connection is established.
        connection.on('connect', function (err) {
            if (err) { //Errore nella creazione della connessione
                console.log('Error: ', err)
                reject(err)
            }
            resolve(connection); //ritorniamo la connessione
        });
    });
}

/**
* Esegue la query e quindi ne elabora il risultato
*
* @param   {[Object]}  connection la connessione creata da createConnection(config)
* @param   {[String]}  query: la query che vogliamo eseguire (stessa sintassi che si usa su MSSQL Server Management Studio)
*
* @return  {[array]}   array delle righe interessate dalla query (se la query è di inserimento,  ritornerà un array vuoto).. gli elementi sono dei dizionari ("{nomeColonna:valore}")
*/
function executeQuery(connection, query) {
    return new Promise((resolve, reject) => {
        //Creiamo la richiesta di query
        request = new Request(query, function (err, rowCount) {
            if (err) {
                console.log(err);
                reject(err)
            } else {
                //tutto OK, abbiamo le righe
                //   console.log(rowCount + ' rows');
            }
        });

        let righe = [];
        request.on('row', (columns) => {
            tmpCol = {};
            columns.forEach(col => {
                tmpCol[col.metadata.colName] = col.value;
            });
            righe.push(tmpCol);
        });

        //quando finisce l'elaborazione, ritorniamo tutte le righe
        request.on('requestCompleted', () => {
            resolve(righe);
            //CI SONO ALTRI EVENTI: 'done' (che non funziona), è 'doneProc'+'doneInProc' (per storedProcedure).
            //credo che requestedCompleted copra questi casi
        });
        connection.execSql(request); //eseguiamo la query
    });
}


/**
 * Modulo per le query di INSERT/UPDATE
 * @param  {[String]} query               [La query come per tabella/vista, come la eseguiamo su MSSQL, non vi sono alterazioni, quindi deve essere corretta]
 * @return {[Promise]}       [Esito della query, Object]
 */
function insertQuery(dbConfig, query) {
    return new Promise((resolve, reject)=>{
        createConnection(dbConfig).then(conn => {
            conn.beginTransaction((err) => {
                if (err) {
                    conn.rollbackTransaction((err) => {
                        console.log(err);
                        if (err) reject(err);
                        conn.close();
                        reject(err);
                    });
                } else {
                    executeQuery(conn, query).then(rows => {
                        conn.commitTransaction((err) => {
                            if (err) reject(err);
                            // /console.log("commit effettuato");
                            conn.close();
                            resolve(rows)
                        });
                    }).catch(err => {
                        conn.rollbackTransaction((err) => {
                            if (err) reject(err);
                            conn.close();
                            reject(err);
                        });
                    });
                }
            });

        }).catch(err => {
            console.log(err);
            reject(err);
        })
    });
}

/**
 * Modulo per le query di SELECT
 * @param  {[String]} query               [La query come per tabella/vista, come la eseguiamo su MSSQL, non vi sono alterazioni, quindi deve essere corretta]
 * @return {[Promise]}       [Esito della query, Object]
 */
function selectQuery(dbConfig, query) {
    return new Promise((resolve, reject)=>{
        createConnection(dbConfig).then(conn => {
            executeQuery(conn, query).then(rows => {
                //console.log(rows.length);
                conn.close();
                resolve(rows);
            }).catch(err => {
                conn.close();
                console.log(err);
                reject(err);
            });

        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}


/**
 * Esportiamo i metodi che desideriamo
 */
module.exports = {
    loadConfig: loadConfig,
    loadConfigFromDB: loadConfigFromDB,
    insertQuery: insertQuery,
    selectQuery: selectQuery
}
