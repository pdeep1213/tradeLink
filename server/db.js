require('dotenv').config();
var db = require('mariadb');

var pool = db.createPool({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DATABASE 
});

module.exports = pool;
