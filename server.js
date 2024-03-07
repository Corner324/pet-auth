const express = require('express');
const bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
const { DB } = require('./work_db.js');
const { HashPass } = require('./hash_pass.js');
const path = require('path')
const router = require('./router')
const session = require("express-session");
const {createClient} = require("redis");
const mongoose = require('mongoose');
const {uriMongo} = require("./config.js")


/*
*  TODO:
*   1) Перводить все на MongoDB
*
* */


const PORT = 8000
const HOSTNAME = '127.0.0.1';

const app = express()




app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/", router)





async function startApp(){

    await mongoose.connect(uriMongo);
    app.listen(PORT, () => {
        console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
    })
}

startApp()


