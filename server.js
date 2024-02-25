const express = require('express');
const bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
const { DB } = require('./work_db.js');
const { HashPass } = require('./hash_pass.js');
const path = require('path')
const router = require('./router')

const app = express()

const actual_dir = __dirname.split('\\').slice(0, -1).join('\\')

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/", router)


const PORT = 8000;
const HOSTNAME = '127.0.0.1';


async function startApp(){

    app.listen(8000, () => {
        console.log(actual_dir);
        console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
    })
}

startApp()

