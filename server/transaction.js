const db = require('./db');
const jwt = require('jsonwebtoken');
const jwt_token = process.env.JWTOKEN;

const transaction = async (req , res) => {
    let con;
    try {
        const { item_id, uid } = req.body;
        if (!uid || !item_id) {
            return res.status(400).send("Missing uid or item_id");
        }
        
        con = await db.getConnection();
        // Fetch price and sellerID from items table
        const [item] = await con.query(
            "SELECT price, uid FROM items WHERE item_id = ?",
            [item_id]
        );

        if (!item) {
            return res.status(404).send("Item not found");
        }

        const amount = item.price;
        const sellerID = item.uid;

        if (sellerID === uid) {
            return res.status(400).send("Seller cannot buy their own item");
        }
        // Insert transaction into Transactions table
        await con.query(
            "INSERT INTO Transactions (sellerID, buyerID, itemID, Amount) VALUES (?, ?, ?, ?)",
            [sellerID, uid, item_id, amount]
        );
        
        //Unlist the item once its added to Transactions
        const query = "UPDATE items SET instock = ?  WHERE item_id = ?";
        const result = await con.query(query, [0,item_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(201).send("Transaction recorded successfully");

    } catch (error) {
        console.error("Transaction error:", error);
        res.status(500).send("Internal server error");
    }
    finally{
        con.release();
    }

};

module.exports = {
 transaction
}
