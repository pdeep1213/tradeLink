const db = require('./db');



// get user info for user dashboard
const profile = async (req, res) => {
   const token = req.cookies.tradelink
   if (!token) {
         return res.status(400).json({ message: "No token provided" });
   }
    try {
      const decoded = jwt.verify(token, jwt_token);
   //      console.log("Decoded JWT:", decoded);

            const uid = decoded.uid;
    //        console.log("uid", uid);
            
            const con = await db.getConnection().catch(err => {
                console.error("DB Connection Error:", err);
                return null;
            });

            if (!con) {
                return res.status(500).json({ message: "Database connection failed" });
            }

            const rows = await con.query(
                "SELECT uid, username, email, perm FROM ulogin WHERE uid = ?", [uid]
            );
            con.release();

    //        console.log("DB Query Result:", rows[0].perm); 

            if (!rows || rows.length === 0) { 
                return res.status(400).json({ message: "User not found" });
            }

            res.status(200).json(rows[0]); 

        } catch (err) {
            console.error("Error:", err);
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }
};

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
      

module.exports = {
    profile,
    wishlist_uid,
    wishlist_add,
    wishlist_remove
};
