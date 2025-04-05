const db = require('./db');

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
            "SELECT uid, username, email, perm FROM ulogin WHERE uid = ?", [uid]
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

module.exports = {
    profile,
    wishlist_uid,
    wishlist_add,
    wishlist_remove,
    info,
    rateuser
};
