const express = require('express');
const db = require('./db');
const app = express();
const port = 8080;
const bodyParser = require("body-parser");
const cors = require('cors');
require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

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

//TODO
app.put('/', async (req, res) =>{
    let task = req.body;
    try{
        const result = await db.pool.query("update tasks set description = ?, completed = ? where id = ?", [task.description, task.completed, task.id]);
        res.send(result);
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

app.listen(port, "0.0.0.0" , () => console.log(`Server running on ${port}`));


