const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const file_name = require('sanitize-filename');
const db = require('./db');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './img/');
    },
    filename: (req, file, cb) => {
        const suffix = crypto.randomBytes(6).toString('hex');
        const sanitize = file_name(file.originalname);

        const ext = path.extname(sanitize);
        const name = `${suffix}${ext}`;

        cb(null, name);
    }
});

const upload = multer({storage: storage});

const imgFetch = async (req, res) => {
    //acquire itemid
    const id = req.query.item_id;
    //console.log(id);
    //query database for all img path of that id
    try {
        const con = await db.getConnection().catch(err => {
            console.error("DB Connection Error:", err);
            return null;
        });
        const query = `select imgpath from itemsImg where item_id = ?`;
        const result = await con.execute(query, [id]);
        //console.log(result[0].imgpath);
        con.release();
        res.send(result);
    }
    catch (err){
        console.log("error retreving imgs");
    }

};

const imgupload = async (req, res) =>{//handles img upload from client, change 5 depending on max amount of picture allow
    if(!req.files || req.files.length == 0) {
        return res.status(400).send("no img send");
    }
    //the imgs should be send as form-data
    const itemId = req.body.item_id; 
    const img = req.files;
    console.log("itemid: ", itemId);
    console.log("img: ", img);
    if(!itemId)
        return res.status(400).send("please provide the item_id as well");
    //storing of the img
    const filepath = req.files.map(file => 'http://128.6.60.7:8080/img/' + file.filename);
    console.log("img path: ", filepath);
    try{
        const con = await db.getConnection().catch(err => {
            console.error("DB Connection Error:", err);
            return null;
        });
        const queries = filepath.map(path => {
            const query = `insert into itemsImg (item_id, imgpath) values (?, ?)`; 
            con.execute(query, [itemId, path], (err, results) => {
                if (err) {
                    console.log("error inserting filepath into imgPathdb");
                }
                else{
                    console.log("img uploaded successfully");
                }
            });
        });
        con.release();
    }catch (err){
        return res.send("error during img upload");
    }
    return res.send("img upload successful");   
};


module.exports = {
    upload, 
    imgFetch,
    imgupload
};
