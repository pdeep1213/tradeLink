const express = require('express');
const db = require('./db');
const app = express();
const port = 8080;
//Stuff relating to cookies
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
//end of stuff relating to cookies
const bodyParser = require("body-parser");
const upload = require('./imgHandler.js');
const cors = require('cors');
const path = require('path');
const corsOption = {
    origin: 'http://128.6.60.7:4173',
    credentials: true,
};
const sgMail = require('@sendgrid/mail');
require("dotenv").config();


app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/img', express.static(path.join(__dirname, 'img')));

sgMail.setApiKey("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");

const jwt_token = process.env.JWTOKEN;

app.post('/fetchImg', async (req, res) => {
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

});


app.post('/uploadImg', upload.array('files', 5), async (req, res) =>{//handles img upload from client, change 5 depending on max amount of picture allow
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
        
});

    app.post('/uploadItem', async (req, res) => { //upload all the item info first, this will return the item_id which is needed for uploading item imgs
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


    });

    app.set('json replacer', (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
    );

    //Sending listed items
    app.get('/send_listings', async (req, res) => {
        const token = req.cookies.tradelink;
        if(!token){
            return res.status(401).json({message: "no token"});
        }
        
        const {type} = req.query;

        try{
            const decoded = jwt.verify(token, jwt_token);
            const uid = decoded.uid;
            const con = await db.getConnection().catch(err => {
                console.error("DB Connection Error:", err);
                return null;
            });
            if (!con) {
                return res.status(500).json({ message: "Database connection failed" });
            }
            const rows = await con.query( (type == 'main') ?  "SELECT * FROM items" : (type == 'admin') ? "SELECT * FROM items WHERE report = 1" :"SELECT * FROM items WHERE uid = ?", [uid]
            );
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
    });

    app.post('/report_item', async (req, res)=> {
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

    })

    app.post('/remove_item', async (req, res)=> {
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

    })

    app.post('/listing_item', async (req, res)=> {
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

    });

    

    app.get('/send_token', async (req, res) => {
        const token = req.cookies.tradelink;
        if(!token){
            return res.status(401).json({message: "no token"})
        }
        
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
            const rows = await con.query(
                "SELECT perm FROM ulogin WHERE uid = ?", [uid]
            );
            con.release();
            if (!rows || rows.length === 0) { 
                return res.status(400).json({ message: "User not found" });
            }
        } catch (err) {
            console.error("Error:", err);
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }

    });

    // get user info for user dashboard
    app.get('/profile', async (req, res) => {
        const token = req.cookies.tradelink;
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
    });

    //POST
    app.post('/register', async (req, res) =>{
        const data = req.body;
        console.log("Data: ", data); //test


        const columns = Object.keys(data).join(', ');
        const value = Object.values(data);
        const question = value.map(() => '?').join(', '); //this is to prevent sql injection attack


        let con;
        try{
            con = await db.getConnection();
            //check the database for same email
            let query = "select * from ulogin where email=?";
            let result = await con.query(query, data.email);
            if (result != 0){
                return res.status(400).json({message: "A User is already registered with this email"});
            }
            query = `insert into ulogin (${columns}) values (${question}) returning *`;
            result = await con.query(query, value);
            console.log("res",result[0].uid);
            //const insertId = result.insertId;
            const sign = jwt.sign({uid: result[0].uid}, jwt_token, {expiresIn: '30d'});
            res.cookie('tradelink', sign, {
                httpOnly:true,
                maxAge: 30 * 24 * 60 * 60 *1000, //day (?), hour(24), minute (60), second (60), millisecond (1000)
                sameSite: 'Lax',
            });
            res.status(200).json({ message: 'Task Inserted Successfully', result});
        }catch (err){
            res.status(500).json({error: 'Error During Post', details: err.message});
        }
        finally{
            if(con)
                con.release();
        }
    });


    // **Login Route (No Encryption)**
    app.post('/login', async (req, res) => {
        const { email, password } = req.body;

        try {
            const con = await db.getConnection();
            const result = await con.query("SELECT * FROM ulogin WHERE email=? AND password=?", [email, password]);
            // Fetch user from database
            const user = Array.isArray(result) ? result[0] : result;
            if (user.length === 0 || !user) {
                return res.status(400).json({ message: "Invalid email or password" });
            }
            
            console.log(user);
            console.log("sending cookie");
            const sign = jwt.sign({uid: result[0].uid}, jwt_token, {expiresIn: '30d'});
            res.cookie('tradelink', sign, {
                httpOnly:true,
                maxAge: 30 * 24 * 60 * 60 *1000, //day (?), hour(24), minute (60), second (60), millisecond (1000)
                sameSite: 'Lax',
            });


                res.status(200).json({ 
                message: "Login Successful",
                perm: user.perm 
            });

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Error During Login', details: err.message });
        }
    });


    //Post Auth
    // Store verification codes temporarily (Replace with a database for production)
    const verificationCodes = {};


    // **Send Verification Code Route**
    app.post('/auth', async (req, res) => {
        const { email } = req.body;


        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }


        // Generate a random 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();


        // Store code in memory (for demo purposes)
        verificationCodes[email] = verificationCode;


        const msg = {
            to: email,
            from: 'pdeep1312@gmail.com', // Must be a verified sender on SendGrid
            subject: 'Your Verification Code',
            text: `Your verification code is: ${verificationCode}`,
            html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
        };


        try {
            await sgMail.send(msg);
            console.log(`Verification code sent to ${email}`);
            res.status(200).json({ message: "Verification email sent" });
        } catch (error) {
            console.error("Error sending email:", error);
            res.status(500).json({ error: "Failed to send email" });
        }
    });


    // **Verify Code Route**
    app.post('/verify', (req, res) => {
        const { email, code } = req.body;


        if (!email || !code) {
            return res.status(400).json({ error: "Email and code are required" });
        }


        // Check if code matches
        if (verificationCodes[email] === code) {
            delete verificationCodes[email]; // Remove after successful verification
            res.status(200).json({ message: "Verification successful" });
        } else {
            res.status(400).json({ error: "Invalid verification code" });
        }
    });




    //Get Auth
    app.get('/auth', (req, res) => {
      res.status(200).json({ message: 'Authenticated', email : currentUser });
    })

    //TODO
    app.put('/', async (req, res) =>{
        let task = req.body;
        try{
            const result = await db.pool.query("update tasks set description = ?, completed = ? where id = ?", [task.description, task.completed, task.id]);        res.send(result);
        }catch (err){
            throw err;
        }
    });

    const SECOND = 1000; //this is seconds in millisecond
    const MINUTE = 60*SECOND; //this is minute in millisecond
    const HOUR = 60*MINUTE; //this is the hour in millisecond


    //Delete unactivated account after sometime
    setInterval(delete_unact, 2*HOUR); //runs every 2 hour can change if needed


    function delete_unact(){
        const con = db.getConnection();
        const query = "delete from ulogin where activate = 0";
        con.query(query, (error, result => {
            if(error){
                console.log("Error during query deletion");
                return;
            }
            console.log(`Query Deletion Succesful, ${result.affectedRows} removed`);
        }));
    }


    app.listen(port, "0.0.0.0" , () => console.log(`Server running on ${port}`));
