const db = require('./db');
const jwt = require('jsonwebtoken');
const jwt_token = process.env.JWTOKEN;


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
        console.log("Data: ", data); //test
        //might need to modify with the new column stuff
        const columns = Object.keys(data).join(', ');
        const value = [uid, ...Object.values(data)];
        const question = value.map(() => '?').join(', ');            
        let query = `insert into items (uid, ${columns}) values (${question})`;
        con = await db.getConnection();
        var result = await con.query(query, value);
        console.log("Itemlist result: ", result);
        const item_id = Number(result.insertId);
        console.log("item id: ", item_id);
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

//This function acquires all the items that are in stock
const listItem =  async (req, res)=> {
    const {item_id, listed} = req.body;
    let con;
    try {
        con = await db.getConnection();
        let instock = (listed) ? 1 : 0;
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
    console.log(item_id);
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
        //console.log(result);
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

module.exports = {
    uploaditem,
    removeItem,
    listItem,
    sendlistGuest,
    sendlist,
    reportitem,
    sellerID,
    getAllCategory,
    updateitemrating
};
