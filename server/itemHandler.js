const db = require('./db');
const jwt = require('jsonwebtoken');
const jwt_token = process.env.JWTOKEN;


   const uploaditem = async (req, res) => { //upload all the item info first, this will return the item_id which is needed for uploading item imgs
        //items table {uid, item_id, categories, description, price)
        //uid should be provided from the cookies [just include credentials during the post request]
        //categories should be a int from 1-... [check the categories table for which number indicate which category]
        //description should be txt [no more than 512 characters, can make longer if need to]
        //price should be a decimal [9,999,999,999.99 should be the max, any larger and data is lost]
        
        const token = req.cookies.tradelink;
        if(!token){
            console.log("no token");
            return res.status(401).json({message: "no token"})
        }
        try {
            const decoded = jwt.verify(token, jwt_token);
            const uid = decoded.uid; //uid for the table

            const data = req.body;
            console.log("Data: ", data); //test
            //might need to modify with the new column stuff
            const columns = Object.keys(data).join(', ');
            const value = [uid, ...Object.values(data)];
            const question = value.map(() => '?').join(', ');
            
            let query = `insert into items (uid, ${columns}) values (${question})`;
            let con = await db.getConnection();
            var result = await con.query(query, value);
            console.log("Itemlist result: ", result);
            
            const item_id = Number(result.insertId);
            
            console.log("item id: ", item_id);
            res.status(200).json({ message: 'Item Inserted Successfully', item_id});
            
        }
        catch (error){
            console.log(error);
            res.status(500).send("issue during item uploading");
        }


    };

    const removeItem =  async (req, res)=> {
        const {item_id} = req.body;
        console.log(item_id);

        try {
            const con = await db.getConnection();
            const query = "DELETE from items WHERE item_id = ?";
            const result = await con.query(query, item_id);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Item not found" });
            }

            res.status(200).json({ message: "Item removed successfully" });
            con.release();
        } catch (error) {
            console.error("Error removing item:", error);
            res.status(500).json({ message: "Internal server error" });
        }

    };

    const listItem =  async (req, res)=> {
        const {item_id, listed} = req.body;
        console.log("In Listing item");
        try {
            const con = await db.getConnection();
            let instock = (listed) ? 0 : 1;
            const query = "UPDATE items SET instock = ?  WHERE item_id = ?";
            const result = await con.query(query, [instock,item_id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Item not found" });
            }

            res.status(200).json({ message: "Item removed successfully" });
            con.release();
        } catch (error) {
            console.error("Error removing item:", error);
            res.status(500).json({ message: "Internal server error" });
        }

    };

//Sending listed items
const sendlist =  async (req, res) => {
    const token = req.cookies.tradelink;
    if (!token) {
        return res.status(401).json({ message: "no token" });
    }

    const { type } = req.query;

    try {
        const decoded = jwt.verify(token, jwt_token);
        const uid = decoded.uid;
        const con = await db.getConnection().catch(err => {
            console.error("DB Connection Error:", err);
            return null;
        });
        if (!con) {
            return res.status(500).json({ message: "Database connection failed" });
        }

        let query = '';
        let params = [];

        if (type === 'main') {
            query = `
                SELECT i.*, 
                       CASE WHEN w.item_id IS NOT NULL THEN 1 ELSE 0 END AS wished,
                       img.imgpath AS image
                FROM items i
                LEFT JOIN wishlist w ON i.item_id = w.item_id AND w.uid = ?
                LEFT JOIN itemsImg img ON img.item_id = i.item_id`;
            params = [uid];
        } else if (type === 'admin') {
            query = `
                SELECT i.*, 
                       CASE WHEN w.item_id IS NOT NULL THEN 1 ELSE 0 END AS wished,
                       img.imgpath AS image
                FROM items i
                LEFT JOIN wishlist w ON i.item_id = w.item_id AND w.uid = ?
                LEFT JOIN itemsImg img ON img.item_id = i.item_id
                WHERE i.report = 1`;
            params = [uid];
        } else {
            query = `
                SELECT i.*, 
                       CASE WHEN w.item_id IS NOT NULL THEN 1 ELSE 0 END AS wished,
                       img.imgpath AS image
                FROM items i
                LEFT JOIN wishlist w ON i.item_id = w.item_id AND w.uid = ?
                LEFT JOIN itemsImg img ON img.item_id = i.item_id
                WHERE i.uid = ?`;
            params = [uid, uid];
        }

        const rows = await con.query(query, params);
        con.release();

        con.release();
        if (!rows || rows.length === 0) {
            return res.status(400).json({ message: "No Items Found" });
        }
        console.log("Success sending items");
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

//todo redirect to itemreport table instead, requiring two paramter, item_id and reason [int, varchar(512)]
const reportitem = async (req, res)=> {
    const {item_id} = req.body;
    console.log(item_id);

    try {
       const con = await db.getConnection();
       const query = "UPDATE items SET report = 1  WHERE item_id = ?";
       const result = await con.query(query, item_id);

       if (result.affectedRows === 0) {
           return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({ message: "Item report successfully" });
        con.release();
    } catch (error) {
      console.error("Error reporting item:", error);
      res.status(500).json({ message: "Internal reporting error" });
      }
};


module.exports = {
    uploaditem,
    removeItem,
    listItem,
    sendlist,
    reportitem
};
