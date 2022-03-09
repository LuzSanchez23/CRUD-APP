//Dependencies//
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet'); //security 
const rateLimit = require("express-rate-limit"); //security


//PORTS//
var PORT = 3000;
var app = express();

//Create Server//
var server = http.createServer(app);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 //Limit each IP to 1800 request per windowMS.
});

// Sets up the Express app to handle data parsing
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, './public')));
app.use(helmet());
app.use(limiter);

//Set up DB //
let db = new sqlite3.Database('dateform');

db.run('CREATE TABLE IF NOT EXISTS emp(id TEXT, name TEXT)');


//ROUTES//
//Set up a GET request to render our HTML PAGE
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './public/form.html'));
});

// Add - THE CREATED FUNTIONALITY
app.post("/add", function (req, res) {
    db.serialize(() => {
        db.run("INSERT INTO emp(id,name) VALUES(?,?)", [req.body.id, req.body.name],
            function (err) {
                if (err) {
                    res.send("An Error has Occured!");
                    return console.log(err.message);
                }
                console.log("New employee has been added");
                res.send("New employee has been added into the database with ID = " +
                    req.body.id + " and Name = " + req.body.name);
            });
    });
});

// View -READ THE FUNTIONATILY
app.post('/view', function(req,res){
    db.serialize(()=>{
        db.each('SELECT id ID, name NAME FROM emp WHERE id =?', [req.body.id], function(err,row){ 
            //db one which is functioning while reading data from the DB
        if (err) {
            res.send("Error encountered while displaying");
            return console.error(err.message);
        }
        res.send(` ID: ${row.ID},      Name: ${row.NAME}`);
        console.log("Entry displayed succesfully");
        });
    });
});

//Update
app.post('/update', function(req,res){
    db.serialize(()=>{
        db.run('UPDATE emp SET name = ? WHERE id = ?',[req.body.name, req.body.id],
        function(err){
            if (err) {
                res.send("Error encountered while updating");
                return console.log.error(err.message);
            }
            res.send("Entry update succesfully");
            console.log("Entry update successfully");
        });
    });
});


// Delete
app.post('/delete', function(req,res){
    db.serialize(()=>{
        db.run('DELETE FROM emp WHERE id = ?', [req.body.id],
        function(err){
            if (err) {
                res.send("Error encountered while deleting");
                return console.log.error(err.message);
            }
            res.send("Entry deleted succesfully");
            console.log("Entry deleted successfully");
        });
    });
});

// Closing the database connection.
app.get('/close', function(req,res){
    db.close((err) => {
        if (err) {
            res.send('There is some error in closing the database');
            return console.error(err.message);
        }
        console.log('Closing the database connection.');
        res.send('Database connection succesfully closed');
    });
});


//Start your Server
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})
