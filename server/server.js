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
const {
    uploaditem, removeItem, listItem, sendlistGuest, 
    sendlist, reportitem, sellerID, 
    getAllCategory, updateitemrating, getMyPurchases,
    process_refund, edit_item
} = require('./itemHandler.js');
const {
    profile, wishlist_uid, wishlist_add, 
    wishlist_remove, info, getUserRating, rateuser, 
    uploadprofile, updateProfileInfo
} = require('./profileHandler.js');
const {sendMessage, getMessages, emitMessage, getChats, updateStatus} = require('./MessageHandler.js');
const {transaction, earnings, saveCardInfo} = require('./transaction.js')
const {filteritem,filterLocation} = require('./returnHandler.js');
const cors = require('cors');
const path = require('path');
const corsOption = {
    origin: 'http://128.6.60.7:4173',
    credentials: true,
};
const sgMail = require('@sendgrid/mail');
const socketIo = require('socket.io');
const { Console } = require('console');
require("dotenv").config();


app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/pfp', express.static(path.join(__dirname, 'pfp')));


sgMail.setApiKey(process.env.SGMAIL);

const jwt_token = process.env.JWTOKEN;

//------------------------------------------------------------
//for buying item
app.post('/transaction', transaction);

//for getting earning Stats
app.get('/earnings/:uid', earnings);

//saving card info in transaction.js
app.post('/saveCardInfo', saveCardInfo);
//------------------------------------------------------------


//------------------------------------------------------------
//in returnHandler should return a list of filter item
app.post('/filter', filteritem);

app.post('/filterLocation', filterLocation);
//------------------------------------------------------------


//------------------------------------------------------------
//in imgHandler get img to send to client
app.post('/fetchImg', imgFetch);

//in imgHandler saves the img on the server's device see /img/ for images
app.post('/uploadImg', upload.array('files', 5), imgupload); 

//------------------------------------------------------------

app.set('json replacer', (key, value) => 
   typeof value === 'bigint' ? value.toString() : value
);


//------------------------------------------------------------
//in itemHandler uploads item to db
app.post('/uploadItem', uploaditem);

//in itemHandler uploads item to db
app.post('/rateitem', updateitemrating);

//in itemHandler get all the category
app.get('/allCategory', getAllCategory);

//in itemHandler to get all item for guest
app.get('/send_listings_guest', sendlistGuest)

//in itemHandler (this might not be used someone please check for me) sends items to the client
app.get('/send_listings', sendlist);

//in itemHandler delete item from the db can probably be rework to just take the item_id 
//as part of the access port with /remove_item/:item_id if anyone wants to try
app.post('/remove_item', removeItem);

//in itemHandler this is competing with send_listing i think. if anyone wants to confirm go ahead
app.post('/listing_item', listItem);

//in itemhandler should increase an item report count by 1
app.post('/report_item', reportitem);

//in itemHandler to get uid of seller
app.post('/sellerID', sellerID);

//in itemHandler to get Purchases of a user
app.get('/send_Purschases/:uid', getMyPurchases);

//in itemHandler to process a refund
app.post('/process_refund', process_refund);

//in itemHandler to edit items
app.post('/edit-item',edit_item);
//------------------------------------------------------------

//------------------------------------------------------------
//in profileHandler to get info of a user given UID
app.get('/info/:uid', info);

//in profileHandler retrieve profile information
app.get('/profile', profile);

//in profileHandler it is grabbing a person's wishlist
app.get('/wishlist', wishlist_uid);

//in profileHandler it is grabbing a person's average rating
app.get('/userrating/:uid', getUserRating);
      
//in profileHandler adding to a users wishlist
app.post('/wishlist/add', wishlist_add);

//in profileHandler remove an item from a user's wishlist
app.post('/wishlist/remove', wishlist_remove);

//in profileHandler rate the user after buying an item [see that method for more info]
app.post('/rateuser', rateuser);

//in profileHandler updates user info name, pfp, and description /pfp/ for images
app.post('/updateProfile', uploadprofile.array('files',1), updateProfileInfo); 

//------------------------------------------------------------

//Message Handling Start----------------------------------------------------------------------------------------
//send message 
app.post('/sendMessage', async (req, res) => {
    const {receiver_id, sender_id ,content } = req.body;
    try {  
      const message = await sendMessage(sender_id, receiver_id, content);  // Call messageHandler.sendMessage
      
      emitMessage(io, receiver_id, message);  // Emit real-time message via WebSocket 
      res.status(200).json({ success: true, message });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

//get message
app.get('/getMessages/:receiverId/:senderID', async (req, res) => {
    const { receiverId,senderID } = req.params;
    try {
         
      const messages = await getMessages(senderID, receiverId);  // Call messageHandler.getMessages
      res.status(200).json({ success: true, messages });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

//get user Chats
app.get('/getChats/:sender_id', async (req, res) => {
    const {sender_id} = req.params;

    try{
        const chats = await getChats(sender_id);
        res.status(200).json({success: true, chats});
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
});

//Update status
app.post('/updateStatus', async (req, res) => {
    const {receiver_id, sender_id} = req.body;

    try {  
        const response =  await updateStatus(receiver_id, sender_id); 
        
        res.status(200).json({ success: true});
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }

});

//Message Handling End----------------------------------------------------------------------------------------

//delete a user's cookie upon logging out
app.post('/logout', (req, res) =>{
    res.cookie('tradelink', '', {
        httpOnly:true,
        expires: new Date(0),
        sameSite: 'Strict'
    });
    res.send("deleting cookie");
});

//this endpoint only purpose is to confirm that the token that link to the cookie exist in the db
app.get('/send_token', async (req, res) => {
    const token = req.cookies.tradelink;
    if(!token){
        return res.status(401).json({message: "no token"})
    }
    let con;
    try {
        const decoded = jwt.verify(token, jwt_token);
        console.log(decoded);
        const uid = decoded.uid;
        con = await db.getConnection().catch(err => {
            console.error("DB Connection Error:", err);
            return null;
        });
        if (!con) {
            return res.status(500).json({ message: "Database connection failed" });
        }
        const rows = await con.query(
            "SELECT perm FROM ulogin WHERE uid = ?", [uid]
        );
        if (!rows || rows.length === 0) { 
            return res.status(400).json({ message: "User not found" });
        }
        return res.status(200).json({message: "user exist"});
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }
    finally{
        con.release();
    }
});

//password encryption nonce + password -> sha256 encryption
//prevents dictionary attack
async function encryptPassword(password) {
    const nonce = process.env.HASHNONCE; 
    const pass = new TextEncoder('utf-8').encode(nonce + password);
    const hash = await crypto.subtle.digest('SHA-256', pass);
    const arr = Array.from(new Uint8Array(hash));
    const hex = arr.map(bytes => ('00' + bytes.toString(16)).slice(-2)).join('');
    return hex;
};

//allows the user to create an account. send a cookie back that will be use for majority of the site
app.post('/register', async (req, res) =>{
    const data = req.body;
    const newpassword = await encryptPassword(data.password);
    data.password = newpassword;
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
        //const insertId = result.insertId;
        const sign = jwt.sign({uid: result[0].uid}, jwt_token, {expiresIn: '30d'});
            res.cookie('tradelink', sign, {
                httpOnly:true,
                maxAge: 30 * 24 * 60 * 60 *1000, //day (?), hour(24), minute (60), second (60), millisecond (1000)
                sameSite: 'Strict',
            });
        //add uid to userrating
        query = "insert into userrating (uid) values (?)";
        await con.query(query, result[0].uid); //make a row for the user
        res.status(200).json({ message: 'Task Inserted Successfully', result});
    }catch (err){
        res.status(500).json({error: 'Error During Post', details: err.message});
    }
    finally{
        if(con)
            con.release();
    }
});


// **Login Route**
app.post('/login', async (req, res) => {
    let { email, password } = req.body;
    //given a password encrypt then check with the database: this is faster than trying to decrypt a 1-way hash
    const newpassword = await encryptPassword(password);
    password = newpassword;
    let con;
    try {
        con = await db.getConnection();
        const result = await con.query("SELECT * FROM ulogin WHERE email=? AND password=?", [email, password]);
        // Fetch user from database
        const user = Array.isArray(result) ? result[0] : result;
        if (user.length === 0 || !user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
            
        const sign = jwt.sign({uid: result[0].uid}, jwt_token, {expiresIn: '30d'});
        res.cookie('tradelink', sign, {
            httpOnly:true,
            maxAge: 30 * 24 * 60 * 60 *1000, //day (?), hour(24), minute (60), second (60), millisecond (1000)
            sameSite: 'Strict',
        });


        res.status(200).json({ 
            message: "Login Successful",
            perm: user.perm 
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error During Login', details: err.message });
    }
    finally{
        con.release();
    }

});


//Post Auth
// Store verification codes temporarily (Replace with a database for production)
const verificationCodes = {};

//generate a string to be used for vertification
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let vertifyString = '';
    for (let i = 0; i<length; i++){
        vertifyString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return vertifyString;
}

// **Send Verification Code Route**
app.post('/auth', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    } 
    //generate a random string between 32-48 characters long
    let vcode;
    do{
        vcode = generateRandomString(Math.floor(Math.random() * (48) + 32));
    }while(vcode in verificationCodes);
    verificationCodes[vcode] = email;


    const msg = {
        to: email,
        from: 'pdeep1312@gmail.com', // Must be a verified sender on SendGrid
        subject: 'Vertify Your Account',
        html: `<p>Click the Link to Vertify Your Account: <a href=http://128.6.60.7:4173/auth?confirm=${vcode}>Verify</a></p>
        <p>Link Will Expire After 2 Hour</p> `,
    };

    try {
        await sgMail.send(msg);
        res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});


// **Verify Code Route**
app.get('/verify', async (req, res) => {
     const verify = req.query.confirm;

    //check to see if the verify string is in the dictionary
     if (verify in verificationCodes) {
         const activateEmail = verificationCodes[verify]; //this is the email link to that code
         delete verificationCodes[verify]; // Remove after successful verification
         let con;
         try {
             const query = `update ulogin set activate=1 where email like "?"`;
             con = await db.getConnection();
             const result = con.execute(query, [activateEmail]);
         } catch (err){
             console.log("error activating account: ", err);
             res.status(500).json({message: "issue in email vertification"});
         }
         finally {
             con.release();
         }
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
setInterval(delete_unact, 2 * HOUR); //runs every 2 hour can change if needed


async function delete_unact(){
    const con = await db.getConnection();
    const query = "delete from ulogin where activate = 0";
    try {
        const result = await con.execute(query);
        console.log(`Query Deletion Succesful, ${result.affectedRows} removed`);
    } catch(err) {
        console.log("error deleting account", err);
    } finally {
        con.release();
    }
}

// Item Report
app.get('/item-report', async (req, res) => {
    let con;
    try {
        con = await db.getConnection();
            
        const query = `
        SELECT 
        c.info AS category_name, 
        COUNT(i.item_id) AS total_items,
        SUM(CASE WHEN i.instock > 0 THEN 1 ELSE 0 END) AS active_items,
        SUM(CASE WHEN i.instock = 0 THEN 1 ELSE 0 END) AS completed_items,
        SUM(CASE WHEN i.report = 1 THEN 1 ELSE 0 END) AS reported_items
        FROM categories c
        RIGHT JOIN items i ON c.category = i.category
        GROUP BY c.category, c.info;
        `;
            
        const result = await con.query(query);
    
        if (!result || result.length === 0) {
            return res.status(200).json([]);
        }
    
        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Error fetching categories" });
    }
    finally{
        con.release();
    }
});
    
    // UserReport
app.get('/user-report', async (req, res) => {
    let con;
    try {
        con = await db.getConnection();
      
        const query = `
        SELECT 
        u.uid,
        COUNT(i.item_id) AS total_listings,
        SUM(CASE WHEN i.instock > 0 THEN 1 ELSE 0 END) AS active_listings,
        SUM(CASE WHEN i.instock = 0 THEN 1 ELSE 0 END) AS completed_listings,
        SUM(CASE WHEN i.report = 1 THEN 1 ELSE 0 END) AS reported_listings
        FROM ulogin u
        LEFT JOIN items i ON u.uid = i.uid
        WHERE u.perm = 0  -- Exclude admins (perm = 1)
        GROUP BY u.uid;
        `;
      
        const listingsResult = await con.query(query);
      
      
        if (!listingsResult || listingsResult.length === 0) {
            return res.status(200).json([]);
        }
      
        res.status(200).json(listingsResult);
    } catch (error) {
        console.error("Error fetching user reports:", error);
        res.status(500).json({ error: "Error fetching user reports" });
    }
    finally{
        con.release();
    }
}); 

app.get('/trending', async (req, res) => {
    let con;
    try {
        con = await db.getConnection();
        const query = `
        SELECT * FROM items 
        WHERE instock > 0
        AND report = 0
        ORDER BY view_count DESC 
        LIMIT 10;
        `;
        const result = await con.query(query);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching trending items:", err);
        res.status(500).json({ error: "Error fetching trending items" });
    } finally {
        if (con) con.release();
    }
});
        
app.get('/recent', async (req, res) => {
    let con;
    try {
        con = await db.getConnection();
        const query = `
        SELECT * FROM items 
        WHERE created_at >= NOW() - INTERVAL 7 DAY 
        AND instock > 0
        AND report = 0
        ORDER BY created_at DESC;
        `;
        const result = await con.query(query);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching recent items:", err);
        res.status(500).json({ error: "Error fetching recent items" });
    } finally {
        if (con) con.release();
    }
});  

app.post('/view_item', async (req, res) => {
    const { item_id } = req.body;
    if (!item_id) {
        return res.status(400).json({ error: "Item ID is required" });
    }
      
    let con;
    try {
        con = await db.getConnection();
        const query = `UPDATE items SET view_count = view_count + 1 WHERE item_id = ?`;
        await con.query(query, [item_id]);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Error updating view count:", err);
        res.status(500).json({ error: "Failed to update view count" });
    } finally {
        if (con) con.release();
    }
});
      
const server = app.listen(port, "0.0.0.0" , () => console.log(`Server running on ${port}`));
const io = socketIo(server, { cors: corsOption }); 

// Handling socket connections
io.on('connection', (socket) => {
    
    socket.on('disconnect', () => {
    });
});
