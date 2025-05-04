const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const file_name = require('sanitize-filename');
const db = require('./db');

//Handle the pathname and location to store the image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './img/');
    },
    filename: (req, file, cb) => {
        //Everything below is to sanitize a image pathname so it's both short and not potentially a string of
        //commands
        const suffix = crypto.randomBytes(6).toString('hex');
        const sanitize = file_name(file.originalname);

        //grab the img ext name and attach to the newly generated path name
        const ext = path.extname(sanitize);
        const name = `${suffix}${ext}`;

        cb(null, name);
    }
});

const upload = multer({storage: storage});

//fetching images given an item id
const imgFetch = async (req, res) => {
    //acquire itemid
    const id = req.query.item_id;
    //query database for all img path of that id
    let con;
    try {
        con = await db.getConnection().catch(err => {
            console.error("DB Connection Error:", err);
            return null;
        });
        //Given an item_id we will fetch all image linked with that item_id
        const query = `select imgpath from itemsImg where item_id = ?`;
        const result = await con.execute(query, [id]);
        res.send(result);
    }
    catch (err){
        console.log("error retreving imgs");
    }finally{
        con.release();
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

    //storing of the img: the http://128.6.60.7:8080/img/ is so the front end servers knwo where to fetch the img
    const filepath = req.files.map(file => 'http://128.6.60.7:8080/img/' + file.filename);
    console.log("img path: ", filepath);
    let con;
    try{
        con = await db.getConnection().catch(err => {
            console.error("DB Connection Error:", err);
            return null;
        });
        //we will loop over each img that was uploaded and insert them one at a time into the db
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
    }catch (err){
        return res.send("error during img upload");
    }finally{
        con.release();
    }
    return res.send("img upload successful");   
};


module.exports = {
    upload, 
    imgFetch,
    imgupload
};
