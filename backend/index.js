import express from 'express';
require('dotenv').config()
var path = require('path');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const DB_FILE = process.env.DB_FILE
const DB_TABLE = process.env.DB_TABLE

app.get('/columns', function(req, res) {
    let db = new sqlite3.Database(path.resolve(__dirname, `./db/${DB_FILE}`), sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.log(err.message);
    else console.log('Connected to the us-census database to retrieve columns names');
});
    var data = [];
    db.serialize(() => {
        db.each(`PRAGMA table_info(${DB_TABLE});`, (err, row) => {
            if (err) console.error(err.message);
            data.push(row.name);
        },  function(){
            res.send(data); 
            db.close(); 
            console.log('Close the database connection (columns names)');
        }
        );
    });
});

app.get(`/getValuesNumber`, function(req, res) {
    let db = new sqlite3.Database(path.resolve(__dirname, `./db/${DB_FILE}`), sqlite3.OPEN_READWRITE, (err) => {
        if (err) console.log(err.message);
        else console.log('Connected to the us-census database to retrieve correspondant values.');
    });
    const columnName = req.query.columnName;
    var data = [];
    db.serialize(() => {
        db.each(`
            SELECT count(*) as values_number FROM (
                SELECT "${columnName}", 
                COUNT("${columnName}") as count,
                AVG("age") as average_age
                FROM ${DB_TABLE} 
                WHERE "${columnName}" NOT NULL
                GROUP BY "${columnName}" 
                ORDER BY "${columnName}" DESC
        )`, (err, row) => {
                if (err) console.error(err.message);
                data.push(row);
        },  function(){
                res.send(data); 
                db.close(); 
                console.log('Close the database connection (values)');
            }
        );
    });
});

app.get(`/getValues`, function(req, res) {
    let db = new sqlite3.Database(path.resolve(__dirname, `./db/${DB_FILE}`), sqlite3.OPEN_READWRITE, (err) => {
        if (err) console.log(err.message) 
        else console.log('Connected to the us-census database to retrieve correspondant values.');
    });
    const columnName = req.query.columnName
    const offset = req.query.offset;
    var data = [];
    db.serialize(() => {
        db.each(`
            SELECT "${columnName}", 
            COUNT("${columnName}") as count,
            AVG("age") as average_age
            FROM ${DB_TABLE}
            WHERE "${columnName}" NOT NULL
            GROUP BY "${columnName}" 
            ORDER BY "${columnName}" DESC
            LIMIT 100 OFFSET ${offset}
        `, (err, row) => {
            if (err) console.error(err.message)
            data.push(row);
        },  function(){
                res.send(data); 
                db.close(); 
                console.log('Close the database connection (values)');
            }
        );
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, err => {
    if(err) console.error(err);
    else console.log(`Listening to port: ${PORT}`);
})