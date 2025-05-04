const db = require('./db');
const jwt = require('jsonwebtoken');
const jwt_token = process.env.JWTOKEN;
const fs = require('fs');


const uploaditem = async (req, res) => {
    //upload all the item info first, this will return the item_id which is needed for uploading item imgs
    //items table {uid, item_id, categories, description, price)
    //uid should be provided from the cookies [just include credentials during the post request]
    //categories should be a int from 1-... [check the categories table for which number indicate which category]
    //description should be txt [no more than 512 characters, can make longer if need to]
    //price should be a decimal [9,999,999,999.99 should be the max, any larger and data is lost   
    //country_code ISO country_code [should be 2 letters]
    //township the town of the seller
    const token = req.cookies.tradelink;
    if(!token){
        console.log("no token");
        return res.status(401).json({message: "no token"})
    }
    let con;
    try {
        const decoded = jwt.verify(token, jwt_token);
        const uid = decoded.uid; //uid for the table
        const data = req.body;
        //might need to modify with the new column stuff
        const columns = Object.keys(data).join(', ');
        const value = [uid, ...Object.values(data)];
        const question = value.map(() => '?').join(', ');            
        //insert the item into the items table
        let query = `insert into items (uid, ${columns}) values (${question})`;
        con = await db.getConnection();
        var result = await con.query(query, value);
        const item_id = Number(result.insertId);
        query = "insert into rating (item_id) values (?)";
        var result = await con.query(query, item_id);
        res.status(200).json({ message: 'Item Inserted Successfully', item_id});
    }
    catch (error){
        console.log(error);
        res.status(500).send("issue during item uploading");
    }finally{
        con.release();
    }
};

//This function will delete an item from the database. All references to the item img should be deleted.
//I do not think the img itself will be deleted from the computer, but that's more of an optimization issue and
//can be solved at a later date if it matters
const removeItem =  async (req, res)=> {
    const {item_id} = req.body;
    console.log(item_id);
    let con;
    try {
        con = await db.getConnection();
        const query = "DELETE from items WHERE item_id = ?";
        console.log("delete item img")
        //we will first delete the img that is linked with that item to free up space in teh backend
        await deleteItemPic(item_id);
        //we will now delete the item from the db table
        const result = await con.query(query, item_id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json({ message: "Item removed successfully" });
    } catch (error) {
        console.error("Error removing item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    finally{
        con.release();
    }
};

//this method handles deleteing of items pic
async function deleteItemPic(item_id){
    let con;
    try{
        con = await db.getConnection(); 
        const query = 'SELECT imgpath FROM itemsImg where item_id = (?)'; 
        const rows = await con.query(query, [item_id]); 
        if (rows.length > 0){
            for (const row of rows){
                let result = row.imgpath;
                //acquire only the part of the imgPath that starts with what folder it's located in
                const idex = result.indexOf("/img");
                result = "." +result.substring(idex);
                //check if the img is alow to be deleted if it is delete the img else don't
                fs.access(result, fs.constants.F_OK, (err) =>{
                    if (err)
                        console.log("img path doesn't exist");
                    else{
                        fs.unlink(result, (err) => {
                            if (err)
                                console.log("issue deleteing img");
                            else
                                console.log("delete success");
                        });
                    }
                });
            }
        }
    } catch(err){
        console.log("issue deleteing image");
    }finally{
        con.release();
    }
};

//This function acquires all the items that are in stock
const listItem =  async (req, res)=> {
    const {item_id, listed} = req.body;
    let con;
    try {
        con = await db.getConnection();
        let instock = (listed) ? 1 : 0;
        //this will query the db for all the items that are currently not unlisted
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
    finally{
        con.release();
    }
};
// This function gets all the item for guest
const sendlistGuest = async (req, res) => {
    let con;
    try {
        con = await db.getConnection(); 
        //this will query the db for all item that is not unlisted. this is for if a user is not login in
        //as this method won't need a token check
        const query = 'SELECT * FROM items WHERE instock = 1'; 
        const rows = await con.query(query); 
        con.release();

        if (!rows || rows.length === 0) {
            return res.status(400).json({ message: "Item not found" });
        }

        console.log("Success sending items");
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
    finally{
        con.release();
    }

};

//This function gets all the item the user has listed
const sendlist =  async (req, res) => {
    const token = req.cookies.tradelink;
    if (!token) {
        return res.status(401).json({ message: "no token" });
    }
    const { type } = req.query;
    let con;
    try {
        //decode teh cookie to acquire the UID of the user
        const decoded = jwt.verify(token, jwt_token);
        const uid = decoded.uid;
        con = await db.getConnection().catch(err => {
            console.error("DB Connection Error:", err);
            return null;
        });
        if (!con) {
            return res.status(500).json({ message: "Database connection failed" });
        }
        let query = '';
        let params = [];
        //we will now query for all items the user has listed
        if (type === 'main') {
            query = `
                SELECT i.*, 
                       CASE WHEN w.item_id IS NOT NULL THEN 1 ELSE 0 END AS wished,
                       img.imgpath AS image
                FROM items i
                LEFT JOIN wishlist w ON i.item_id = w.item_id AND w.uid = ?
                LEFT JOIN itemsImg img ON img.item_id = i.item_id
                WHERE i.instock = 1;
                `;
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
        if (!rows || rows.length === 0) {
            return res.status(400).json({ message: "No Items Found" });
        }
        console.log("Success sending items");
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
    finally{
        con.release();
    }

};

//Get uid of the seller 
const sellerID = async (req, res) => {
    const {item_id} = req.body;
    console.log("In sellerID");
    if (!item_id) {
        return res.status(400).json({ message: "Missing item_id" });
    }

    let con;
    try {
        con = await db.getConnection();
        const result = await con.query("SELECT uid FROM items WHERE item_id = ?", [item_id]);

        if (result.length === 0) {
            return res.status(404).json({ message: "Item not found" });
        }
        const user = Array.isArray(result) ? result[0] : result;
        res.status(200).json({ sellerID: user.uid });
        
    } catch (error) {
        console.error("Error fetching ID:", error);
        res.status(500).json({ message: "Internal reporting error" });
        }
    finally{
        con.release();
    }

};

//todo redirect to itemreport table instead, requiring two paramter, item_id and reason [int, varchar(512)]
const reportitem = async (req, res)=> {
    const {item_id} = req.body;
    let con;
    try {
       con = await db.getConnection();
       const query = "UPDATE items SET report = 1  WHERE item_id = ?";
       const result = await con.query(query, item_id);
       if (result.affectedRows === 0) {
           return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json({ message: "Item report successfully" });
    } catch (error) {
      console.error("Error reporting item:", error);
      res.status(500).json({ message: "Internal reporting error" });
      }
    finally{ 
        con.release();
    }
};

//This get all the category for category filtering
const getAllCategory = async (req, res) => {
    const query = "select info from categories";
    let con;
    try{
        con = await db.getConnection();
        const result = await con.query(query);
        res.send(result);
    } catch (error) {
      console.error("Error cat:", error);
      res.status(500).json({ message: "Internal cat error" });
      }
    finally{
        con.release();
    }
};


//This function will handle the rating of an item.
const updateitemrating = async (req, res) => {
    let con;
    try {
        const item_id = req.body.item_id //the body should contain the item_id
        const rate = req.body.rating; //the body should contain a number from 1-5
        //Step 1 grab the object current rating and rate_count
        const query1 = "select avg_rate from rating where item_id = ?";
        con = await db.getConnection();
        const result = await con.query(query, item_id);
        var tmp = result[0].avg_rate;
        var query3;
        switch(rate){ //updates how an items rating star count
            case 1:
                query3 = `update rating set \`1_start\` = \`1_start\` + 1, total = total+1 where item_id = ?`;
                break;
            case 2:
                query3 = `update rating set \`2_start\` = \`2_start\` + 1, total = total+1 where item_id = ?`;
                break;
            case 3:
                query3 = `update rating set \`3_start\` = \`3_start\` + 1, total = total+1 where item_id = ?`;
                break;
            case 4:
                query3 = `update rating set \`4_start\` = \`4_start\` + 1 total = total+1 where item_id = ?`;
                break;
            case 5:
                query3 = `update rating set \`5_start\` = \`5_start\` + 1 total = total+1 where item_id = ?`;
                break;
            default:
                throw new Error("Error");
                break;
        }
        await con.query(query3, item_id);

        if(tmp == 0){ //runs only once per item
            const query2 = `update rating set avg_rate = ? where item_id = ?`;
            await con.query(query2, [rate, item_id]);
        }
        else{ //all other situation
            query3 = `update rating set avg_rate = (avg_rate + ?)/2 where item_id = ?`;
            await con.query(query3, [rate, item_id]);
        }
        res.status(200).json({message: "Rating updated Successfully"});
    }
    catch (err){
        console.log("error in itemrating");
    }
    finally{
        con.release();
    }
};

const getMyPurchases = async (req, res) => {
    const { uid } = req.params;
    let con;

    try {
        con = await db.getConnection();

        // Step 1: Get all purchases for this user
        const purchaseQuery = `SELECT * FROM Transactions WHERE buyerID = ?`;
        let result = await con.query(purchaseQuery, [uid]);
        let purchases = Array.isArray(result) ? result : [];

        if (purchases.length === 0) {
            return res.status(200).json([]); // no purchases
        }

        // Step 2: Extract itemIDs and ensure they are unique
        const itemIds = [...new Set(purchases.map(p => parseInt(p.itemID)).filter(id => !isNaN(id)))];

        if (itemIds.length === 0) {
            return res.status(200).json(purchases); // no valid itemIDs to fetch
        }

        // Step 3: Fetch item details
        const itemQuery = `SELECT * FROM items WHERE item_id IN (${itemIds.map(() => '?').join(',')})`;
        const items = await con.query(itemQuery, itemIds);


        res.status(200).json(items);

    } catch (err) {
        console.error("Error in getMyPurchasesWithItems:", err);
        res.status(500).json({ error: "Failed to fetch purchases and item details" });
    } finally {
        if (con) con.release();
    }
};

const process_refund = async (req, res) => {
    const { item_id } = req.body;
    let con;
    console.log(item_id);
    try {
        con = await db.getConnection();
        //Delete from Transaction 
        const deleteQuery = `DELETE FROM Transactions WHERE itemID = ?`;
        let result = await con.query(deleteQuery, [item_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Transaction not found or already refunded." });
        }
        
        // Get item seller (uid from Item table)
        const sellerQuery = `SELECT uid FROM items WHERE item_id = ?`;
        const sellerRows = await con.query(sellerQuery, [item_id]);

        const seller = sellerRows[0].uid; 

        //Send a notification
        let message = `Your item with ID ${item_id} has been refunded.`;
        const messageQuery = `INSERT INTO Messages (sender_id, receiver_id, content, timestamp) VALUES (?, ?, ?, NOW())`;
        result = await con.query(messageQuery,['0',seller,message])

        res.status(200).json({ message: "Refund processed successfully." });

    } catch (err) {
        console.error("Error processing refund:", err);
        res.status(500).json({ error: "Failed to process refund." });
    } finally {
        if (con) con.release();
    }
};

const edit_item = async (req, res) => {
   const {item} = req.body;
   const con = await db.getConnection();
   try{
    //update the info on a item the user has listed 
    const result = await con.query(`UPDATE items 
       SET itemname = ?, description = ?, price = ?, category = ? 
       WHERE item_id = ?`,
      [item.itemname, item.description, item.price, item.category, item.item_id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Item not found." });
      }
  
      res.status(200).json({ message: "Item updated successfully." });
   } catch (err) {
    console.error("Error processing Edit:", err);
    res.status(500).json({ error: "Failed to process Edit." });
    } finally {
        if (con) con.release();
    }
}

module.exports = {
    uploaditem,
    removeItem,
    listItem,
    sendlistGuest,
    sendlist,
    reportitem,
    sellerID,
    getAllCategory,
    updateitemrating,
    getMyPurchases,
    process_refund,
    edit_item
};
