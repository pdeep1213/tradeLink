const db = require('./db');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const file_name = require('sanitize-filename');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const jwt_token = process.env.JWTOKEN;

// get user info for user dashboard
const profile = async (req, res) => {
   const token = req.cookies.tradelink
   if (!token) {
         return res.status(400).json({ message: "No token provided" });
   }
    try {
      const decoded = jwt.verify(token, jwt_token);
        //console.log("Decoded JWT:", decoded);
        const uid = decoded.uid;
        //console.log("uid", uid);
        const con = await db.getConnection().catch(err => {
        //console.error("DB Connection Error:", err);
        return null;
    });
        if (!con) {
            return res.status(500).json({ message: "Database connection failed" });
        }
        const rows = await con.query(
            "SELECT uid, username, email, perm, pfpic, pfdesc FROM ulogin WHERE uid = ?", [uid]
        );
        con.release();
        //console.log("DB Query Result:", rows[0].perm); 
        if (!rows || rows.length === 0) { 
            return res.status(400).json({ message: "User not found" });
        }
        res.status(200).json(rows[0]); 
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

//I'm assuming this grabs a users wishlist
const wishlist_uid = async (req, res) => {
    const { uid } = req.params;
      
    try {
        const [wishlistItems] = await db.query(`
            SELECT 
              i.item_id, 
              i.itemname AS title, 
              i.description, 
              i.price, 
              i.category, 
              MIN(img.imgpath) AS image
            FROM wishlist w
            JOIN items i ON w.item_id = i.item_id
            LEFT JOIN itemsImg img ON img.item_id = i.item_id
            WHERE w.uid = ?
            GROUP BY i.item_id
          `, [uid]);
      
        res.json(wishlistItems);
    } catch (err) {
        console.error('🔥 SQL ERROR:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

//This should add to the user's wishlist
const wishlist_add = async (req, res) => {
    const { uid, item_id } = req.body;
      
    if (!uid || !item_id) {
        return res.status(400).json({ message: 'Missing uid or item_id' });
    }
      
    try {
        await db.query('INSERT IGNORE INTO wishlist (uid, item_id) VALUES (?, ?)', [uid, item_id]);
        res.status(200).json({ message: 'Item added to wishlist (or already existed)' });
    } catch (err) {
        console.error('❌ Error inserting into wishlist:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
        }
};              

//this should remove an item from the user wishlist
const wishlist_remove =  async (req, res) => {
    const { uid, item_id } = req.body;
    if (!uid || !item_id) {
        return res.status(400).send("Missing uid or item_id");
    }
      
    try {
        const con = await db.getConnection();
        await con.query("DELETE FROM wishlist WHERE uid = ? AND item_id = ?", [uid, item_id]);
        con.release();
        res.send({ message: "Item removed from wishlist" });
    } catch (err) {
        console.error("❌ Error removing wishlist item:", err);
        res.status(500).send("Could not remove item");
    }
};
      
//This grabs the user's username
const info = async (req, res) => {
  const { uid } = req.params;

  try {
    const [profile] = await db.query(`SELECT username FROM ulogin WHERE uid = ?`, [uid]);

    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('🔥 SQL ERROR:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

//This will allow the a user to rate another user's profile after buying something from them
const rateuser = async (req, res) => {
    //The front end in the fetch request should provide both:
    //rating of 0, 1, or 2.
    //and the item_id of the product that was brought: we will be fetching the uid using the item_id
    //please name these two field: rating and itemid
    const rating = req.body.rating;

    if (typeof rating !== 'number'){
        throw new Error("rating is not a number");
    } //error catching if somehow rating is not a number

    var id = req.body.itemid;
    var query = "select uid from items where item_id = ?";
    try{
        const con = await db.getConnection();
        var result = await con.query(query, id);
        id = result[0].uid;//rewrite the item_id with the sellers uid since item_id is no longer needed
        query = "select avg from userrating where uid = ?";
        result = await con.query(query, id); //this query search is to determine if this is the first time the
        //user is being rated or not for avg calculation
        var avg = result[0].avg;
        if (avg === 0){
            avg = rating;
        }
        else{
            avg = (avg + rating)/2;
        }
        query = "update userrating set avg = ?"; //query to update avg
        await con.query(query, avg);
        if (rating === 0){
            query = "update userrating set zero = zero + 1";    
        }
        else if (rating === 1){
            query = "update userrating set one = one + 1";
        }
        else{
            query = "update userrating set two = two +1";
        }
        await con.query(query); //increment the column that has the respective number
        res.send(200).json({message: "user profile rated successfully"});
    }
    catch (err){
        console.log("error when updaing user rating: ", err);
        res.send(500).json({message: "issue when rating user profile"});
    }

};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './pfp/');
    },
    filename: (req, file, cb) => {
        const suffix = crypto.randomBytes(6).toString('hex');
        const sanitize = file_name(file.originalname);

        const ext = path.extname(sanitize);
        const name = `${suffix}${ext}`;

        cb(null, name);
    }
});

const uploadprofile = multer({storage: storage});

const updateProfileInfo = async (req, res) =>{//handles img upload from client
    const token = req.cookies.tradelink
    if (!token) {
        return res.status(400).json({ message: "No token provided" });
    }
    let con;
    try{
        const decoded = jwt.verify(token, jwt_token);
        //console.log("Decoded JWT:", decoded);
        const uid = decoded.uid;
        //the imgs should be send as form-data
        const img = req.files;
        con = await db.getConnection().catch(err => {
            console.error("DB Connection Error:", err);
            return null;
        });
        console.log("testing imgs");
        if (img){
            console.log("img: ", img);
            //storing of the img
            const filepath = req.files.map(file => 'http://128.6.60.7:8080/pfp/' + file.filename);
            console.log("img path: ", filepath);
            const query = `update ulogin set pfpic=(?) where uid=(?)`; 
            await con.execute(query, [img, uid], (err, results) => {
                if (err) {
                    console.log("error inserting filepath into user info");
                }
                else{
                    console.log("img uploaded successfully");
                }
            });
        }
        const descrip = req.body.description;
        if(descrip){
            console.log("testing desc: ", descrip);
            const query = `update ulogin set pfdesc=? where uid = ?`;
            await con.execute(query, [descrip, uid]);//, (err, results) => {
                /*if (err) {
                    console.log("error changing description into user info");
                }
                else{
                    console.log("description chagned successfully");
                }
            });*/
        }
        const name = req.body.username;
        console.log("testing names");
        if(name){
            console.log("testing username: ", name);
            const query = `update ulogin set username=? where uid = ?`;
            await con.execute(query, [name, uid], (err, results) => {
                if (err) {
                    console.log("error chaing username into user info");
                }
                else{
                    console.log("username uploaded successfully");
                }
            });
        }
    } catch(err) {
        res.status(500).json({message: "issue updating profile"});
       }
    finally{
        con.release();
    }
};

//call this before deleteing the profile to help clear up residule img file in the backend
const deleteProfileImage = async (req, res) => {
    const token = req.cookies.tradelink
    if (!token) {
        return res.status(400).json({ message: "No token provided" });
    }
    try{
        const decoded = jwt.verify(token, jwt_token);
        //console.log("Decoded JWT:", decoded);
        const uid = decoded.uid;
        const con = await db.getConnection(); 
        const query = 'SELECT pfpics FROM ulogin where uid = (?)'; 
        const [rows] = await con.query(query, [uid]); 
        var i = "./" + rows.pfpic;
        fs.unlink(i, (err) => {
            if(err)
                return res.status(500).json({message: "Issue deleting account profile pic"});
            else
                return res.status(200).json({message: "profile pic deleted"});
        });
    } catch(err){
        res.status(500).json({message: "error deleting accoutn profile pic"});
    }

};

module.exports = {
    profile,
    wishlist_uid,
    wishlist_add,
    wishlist_remove,
    info,
    rateuser,
    uploadprofile,
    updateProfileInfo,
    deleteProfileImage
};
