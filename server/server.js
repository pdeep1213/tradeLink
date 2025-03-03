const express = require('express');
const db = require('./db');
const app = express();
const port = 8080;
const bodyParser = require("body-parser");
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
require("dotenv").config();


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


sgMail.setApiKey("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");


tables = process.env.TABLES.split(','); //All database table are in the .env file




//GET rquest TODO
app.get('/', async (req, res) => {
    try {
        const result = await db.query("select * from ulogin");
        res.send(result);
    }catch(err){
        throw err;
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
        console.log(result);
        if (result != 0){
            return res.status(400).json({message: "A User is already registered with this email"});
        }
        console.log("pass if check");
        query = `insert into ulogin (${columns}) values (${question})`;
        console.log("creating new query");
        result = await con.query(query, value);
        console.log("inserting new query");
        result.insertId = result.insertId.toString();
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




        currentUser = user.email;
        res.status(200).json({ message: "Login Successful"});


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


//delete TODO
app.delete('/', async (req, res) => {
    let id = req.query.id;
    try{
        const result = await db.pool.query("delete from tasks where id = ?", [id]);
        res.send(result);
    }catch(err){
        throw err;
    }
});


const SECOND = 1000; //this is seconds in millisecond
const MINUTE = 60*1000; //this is minute in millisecond
const HOUR = 60*60*1000; //this is the hour in millisecond


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
    });
}


app.listen(port, "0.0.0.0" , () => console.log(`Server running on ${port}`));
