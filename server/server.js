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
    getAllCategory, updateitemrating
} = require('./itemHandler.js');
const {
    profile, wishlist_uid, wishlist_add, 
    wishlist_remove, info, 
    rateuser
} = require('./profileHandler.js');
const {sendMessage, getMessages, emitMessage, getChats, updateStatus} = require('./MessageHandler.js');
const {transaction} = require('./transaction.js')
const {filteritem,filterLocation} = require('./returnHandler.js');
const cors = require('cors');
const path = require('path');
const corsOption = {
    origin: 'http://128.6.60.7:4173',
    credentials: true,
};
const sgMail = require('@sendgrid/mail');
const socketIo = require('socket.io');
require("dotenv").config();


app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/img', express.static(path.join(__dirname, 'img')));

sgMail.setApiKey("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");

const jwt_token = process.env.JWTOKEN;

//------------------------------------------------------------
//for buying item
app.post('/transaction', transaction);
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
//------------------------------------------------------------

//------------------------------------------------------------
//in profileHandler to get info of a user given UID
app.get('/info/:uid', info);

//in profileHandler retrieve profile information
app.get('/profile', profile);

//in profileHandler it is grabbing a person's wishlist
app.get('/wishlist/:uid', wishlist_uid);
      
//in profileHandler adding to a users wishlist
app.post('/wishlist/add', wishlist_add);

//in profileHandler remove an item from a user's wishlist
app.post('/wishlist/remove', wishlist_remove);

//in profileHandler rate the user after buying an item [see that method for more info]
app.post('/rateuser', rateuser);
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



app.set('json replacer', (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
);

app.post('/logout', (req, res) =>{
    res.cookie('tradelink', '', {
        httpOnly:true,
        expires: new Date(0),
        sameSite: 'Strict'
    });
    res.send("deleting cookie");
});

app.get('/send_token', async (req, res) => {
    const token = req.cookies.tradelink;
    if(!token){
        return res.status(401).json({message: "no token"})
    }
    try {
        const decoded = jwt.verify(token, jwt_token);
        console.log(decoded);
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
        return res.status(200).json({message: "user exist"});
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
    }

});

////POST
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

    // Item Report
    app.get('/item-report', async (req, res) => {
        try {
            const con = await db.getConnection();
            
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
            con.release();
    
            if (!result || result.length === 0) {
                return res.status(200).json([]);
            }
    
            res.status(200).json(result);
        } catch (error) {
            console.error("Error fetching categories:", error);
            res.status(500).json({ error: "Error fetching categories" });
        }
    });
    
    // UserReport
    app.get('/user-report', async (req, res) => {
        try {
          const con = await db.getConnection();
      
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
      
          con.release();
      
          if (!listingsResult || listingsResult.length === 0) {
            return res.status(200).json([]);
          }
      
          res.status(200).json(listingsResult);
        } catch (error) {
          console.error("Error fetching user reports:", error);
          res.status(500).json({ error: "Error fetching user reports" });
        }
      }); 
      
const server = app.listen(port, "0.0.0.0" , () => console.log(`Server running on ${port}`));
const io = socketIo(server, { cors: corsOption }); 

// Handling socket connections
io.on('connection', (socket) => {
    console.log('New client connected',socket.id);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
