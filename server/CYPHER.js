const crypto = require('crypto');
const fs = require("fs");

const password = 'Fidelio99';
const algorithm = 'aes-256-cbc';

function encrypt(password, text) {
    const key = Buffer.concat([Buffer.from(password), Buffer.alloc(32)], 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + encrypted.toString('hex');
}

function decrypt(password, text) {
    const key = Buffer.concat([Buffer.from(password), Buffer.alloc(32)], 32);
    const iv = Buffer.from(text.substring(0, 32), 'hex');
    const encryptedText = Buffer.from(text.substring(32), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}



let mode = process.argv[2];
let fileName = process.argv[3];

if(mode!=undefined && fileName!=undefined){

    if(mode=="encrypt"){
        let encryptedConfig = encrypt(password,
            fs.readFileSync(fileName)
        )
        fs.writeFileSync(fileName,encryptedConfig);
        console.log("Encryption done.");
    }else if(mode=="decrypt"){
        let encryptedConfig = decrypt(password,
            fs.readFileSync(fileName).toString()
        )
        fs.writeFileSync(fileName, encryptedConfig);
        console.log("Decryption done.");
    }
}else{
    console.log("1(modalita): encrypt / decrypt");
    console.log("2(file.json): DBconfig.json");
}

module.exports = {
    decrypt: decrypt
}