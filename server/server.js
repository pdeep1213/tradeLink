const express = require('express');
const db = require('./db');
const app = express();
const port = 8080;
//Stuff relating to cookies
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
//end of stuff relating to cookies
const bodyParser = require("body-parser");
const {upload, imgFetch, imgupload} = require('./imgHandler.js');
const {uploadLogic, removeItem, listItem, sendlist, reportitem} = require('./itemHandler.js');
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

//in imgHandler get img to send to client
app.post('/fetchImg', imgFetch);

//in imgHandler saves the img on the server's device see /img/ for images
app.post('/uploadImg', upload.array('files', 5), imgupload); 

//in itemHandler uploads item to db
app.post('/uploadItem', uploaditem);

app.set('json replacer', (key, value) => 
   typeof value === 'bigint' ? value.toString() : value
);

//in itemHandler (this might not be used someone please check for me) sends items to the client
app.get('/send_listings', sendlist);

//in itemHandler delete item from the db can probably be rework to just take the item_id 
//as part of the access port with /remove_item/:item_id if anyone wants to try
app.post('/remove_item', removeItem);

//in itemHandler this is competing with send_listing i think. if anyone wants to confirm go ahead
app.post('/listing_item', listItem);

app.set('json replacer', (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
);

app.post('/report_item', reportitem);

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

    app.get('/wishlist/:uid', async (req, res) => {
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
      });
      
    
      
      app.post('/wishlist/add', async (req, res) => {
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
      });              

    app.post('/wishlist/remove', async (req, res) => {
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
    });
      
    app.listen(port, "0.0.0.0" , () => console.log(`Server running on ${port}`));
