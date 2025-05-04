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
    let con;
    try {
        const decoded = jwt.verify(token, jwt_token);
        const uid = decoded.uid;
        con = await db.getConnection().catch(err => {
        return null;
    });
        if (!con) {
            return res.status(500).json({ message: "Database connection failed" });
        }
        //get all relevant info linked to the user to be displayed to the user 
        const rows = await con.query(
            "SELECT uid, username, email, perm, pfpic, pfdesc FROM ulogin WHERE uid = ?", [uid]
        );
        if (!rows || rows.length === 0) { 
            return res.status(400).json({ message: "User not found" });
        }
        res.status(200).json(rows[0]); 
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }finally{
        con.release();
    }
};

//I'm assuming this grabs a users wishlist
const wishlist_uid = async (req, res) => {
    const token = req.cookies.tradelink
    if (!token) {
        return res.status(400).json({ message: "No token provided" });
    }
    let con;
    try {
        const decoded = jwt.verify(token, jwt_token);
        const uid = decoded.uid;
        con = await db.getConnection();
        //grabs all the item the user has wishlisted
        const wishlistItems = await con.query(`
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
      
        res.status(200).json(wishlistItems);
    } catch (err) {
        console.error('🔥 SQL ERROR:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
    finally{
        con.release();
    }
};

//This should add to the user's wishlist
const wishlist_add = async (req, res) => {
    const { uid, item_id } = req.body;
    if (!uid || !item_id) {
        return res.status(400).json({ message: 'Missing uid or item_id' });
    }
    let con;
    try {
        //this will add an item to the user wishlist db table
        con = await db.getConnection();
        await con.query('INSERT IGNORE INTO wishlist (uid, item_id) VALUES (?, ?)', [uid, item_id]);
        res.status(200).json({ message: 'Item added to wishlist (or already existed)' });
    } catch (err) {
        console.error('❌ Error inserting into wishlist:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    } finally {
        con.release();
    }
};              

//this should remove an item from the user wishlist
const wishlist_remove =  async (req, res) => {
    const { uid, item_id } = req.body;
    if (!uid || !item_id) {
        return res.status(400).send("Missing uid or item_id");
    }
    let con; 
    try {
        //this will remove an item to the user wishlist db table
        con = await db.getConnection();
        await con.query("DELETE FROM wishlist WHERE uid = ? AND item_id = ?", [uid, item_id]);
        res.send({ message: "Item removed from wishlist" });
    } catch (err) {
        console.error("❌ Error removing wishlist item:", err);
        res.status(500).send("Could not remove item");
    }finally{
        con.release();
    }
};
      
//This grabs the user's username
const info = async (req, res) => {
    const { uid } = req.params;
    let con;
    try {
        con = await db.getConnection();
        const [profile] = await con.query(`SELECT username FROM ulogin WHERE uid = ?`, [uid]);

        if (!profile) {
            con.release();
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(profile);
    } catch (err) {
        console.error('🔥 SQL ERROR:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
    finally {
        con.release();
    }
}

//Grabs user's avg rating 
const getUserRating = async (req, res) => {
    const { uid } = req.params;
    let con;
    try {
        con = await db.getConnection();
        const [result] = await con.query(
        `SELECT avg FROM userrating WHERE uid = ?`, 
        [uid]
        );

        if (!result || result.avg === null) {
            con.release();
            return res.status(200).json({ avg: 0 }); // default to 0 if no ratings
        }

        res.status(200).json(result);
    } catch (err) {
        console.error('SQL ERROR in getUserRating:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
    finally {
        con.release();
    }
};
  
//allow the rating of an user
const rateuser = async (req, res) => {
    const { rating, sellerId} = req.body; //grab the rating and the item that was purchase

    if (typeof rating !== 'number') {
        return res.status(400).json({ message: "Rating is not a number" });
    }

    let con;
    try {
        con = await db.getConnection();

        const [ratingResult] = await con.query("SELECT * FROM userrating WHERE uid = ?", [sellerId]);

        if (!ratingResult || ratingResult.length === 0) {
            await con.query(
                "INSERT INTO userrating (uid, avg, zero, one, two) VALUES (?, ?, ?, ?, ?)",
                [
                    sellerUid,
                    rating,
                    rating === 0 ? 1 : 0,
                    rating === 1 ? 1 : 0,
                    rating === 2 ? 1 : 0
                ]
            );
        } else {
            const current = ratingResult;
            const totalRatings = current.zero + current.one + current.two;
            //calculate the user new rating average
            const newAvg = (current.avg * totalRatings + rating) / (totalRatings + 1);
            //update user rating depending on what was the rating selected with the new average
            await con.query(
                "UPDATE userrating SET avg = ?, zero = zero + ?, one = one + ?, two = two + ? WHERE uid = ?",
                [
                    newAvg,
                    rating === 0 ? 1 : 0,
                    rating === 1 ? 1 : 0,
                    rating === 2 ? 1 : 0,
                    sellerId
                ]
            );
        }

        res.status(200).json({ message: "User profile rated successfully" });
    } catch (err) {
        console.error("Error when updating user rating:", err);
        res.status(500).json({ message: "Issue when rating user profile" });
    } finally {
        if (con) con.release();
    }
};

//saves a user profile pic to /pfp/
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

//save the user profilepic to the backend and the path to the db and upate other profile information
const updateProfileInfo = async (req, res) =>{
    //Handles the updating of user information pertaining to their profile photo, description and username
    const token = req.cookies.tradelink
    if (!token) {
        return res.status(400).json({ message: "No token provided" });
    }
    let retmessage = "";
    let con;
    try{
        const decoded = jwt.verify(token, jwt_token);
        const uid = decoded.uid;
        //the imgs should be send as form-data
        const img = req.files;
        con = await db.getConnection().catch(err => {
            console.error("DB Connection Error:", err);
            return null;
        });
        if (img.length > 0){
            //we will first delete the last profile img
            await deleteProfilePic(uid);
            //storing of the img
            const filepath = req.files.map(file => 'http://128.6.60.7:8080/pfp/' + file.filename);
            const query = `update ulogin set pfpic=(?) where uid=(?)`; 
            await con.execute(query, [filepath, uid], (err, results) => {
                if (err) {
                    console.log("error inserting filepath into user info");
                }
                else{
                    console.log("img uploaded successfully");
                }
            });
            retmessage += "profile pic updated\n";
        }
        const descrip = req.body.description;
        //update the decription of the user if they gave that as an update input
        if(descrip){
            const query = `update ulogin set pfdesc=? where uid = ?`;
            await con.execute(query, [descrip, uid]);
            retmessage += "description pic updated\n";
        }
        const name = req.body.username;
        //update the name of the user if they gave that as an update input
        if(name){
            const query = `update ulogin set username=? where uid = ?`;
            await con.execute(query, [name, uid], (err, results) => {
                if (err) {
                    console.log("error chaing username into user info");
                }
                else{
                    console.log("username uploaded successfully");
                }
            });
            retmessage += "username updated\n";
        }
        res.status(200).json({message: retmessage});
    } catch(err) {
        res.status(500).json({message: "issue updating profile"});
       }
    finally{
        con.release();
    }
};

//call this before deleteing the profile to help clear up residule img file in the backend
async function deleteProfilePic(uid){
    let con;
    try{
        con = await db.getConnection(); 
        //delete a user's profile pic
        const query = 'SELECT pfpic FROM ulogin where uid = (?)'; 
        const rows = await con.query(query, [uid]); 
        let result = JSON.parse(rows[0].pfpic)[0];
        const idex = result.indexOf("/pfp");
        result = "." + result.substring(idex);
        fs.unlink(result, (err) => {
            if (err)
                console.log("issue deleteing img");
            else
                console.log("delete success");
        });
    } catch(err){
        console.log("issue deleteing image");
    }finally{
        con.release();
    }

};

module.exports = {
    profile,
    wishlist_uid,
    wishlist_add,
    wishlist_remove,
    info,
    getUserRating,
    rateuser,
    uploadprofile,
    updateProfileInfo,
};
