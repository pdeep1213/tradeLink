const express = require('express');
const db = require('./db');
const app = express();
const port = 8080;
const bodyParser = require("body-parser");
require("dotenv").config();

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
app.post('/test', async (req, res) =>{
    const {table, data} = req.body;
    console.log("Table: ", table); //test
    console.log("Data: ", data); //test

    if(!tables.includes(table))
      return res.status(400).send({message: "Tables does not exist"});

    const columns = Object.keys(data).join(', ');
    const value = Object.values(data);
    const question = value.map(() => '?').join(', '); //this is to prevent sql injection attack

    let con; 
    try{
        con = await db.getConnection();
        const query = `insert into ${table} (${columns}) values (${question})`;
        const result = await con.query(query, value);
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

app.listen(port, "127.0.0.1" , () => console.log(`Server running on ${port}`));


