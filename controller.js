const bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
const { DB } = require('./work_db.js');
const { HashPass } = require('./hash_pass.js');
const path = require('path')
const { query, validationResult } = require('express-validator');
const crypto = require('crypto');
const session = require('express-session');
const { secret } = require('./config')
const { createClient } = require('redis');


const generate_key = function() {
    // 16 bytes is likely to be more than enough,
    // but you may tweak it to your needs
    return crypto.randomBytes(16).toString('base64');
};


class Controller{

    async getLogin(req, res){

        const client = createClient();
        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();
        if(req.cookies.UserData) {
            const usrd = req.cookies.UserData;
            console.log('UserData from cookies - ', usrd)
            const chk = await client.get(usrd);
        }
        if(true){ // REMARK!!!!!!!!!!!!!!!!!!!!!!!!!!! STOP HERE
            res.sendFile( __dirname + '/views/index_APanel.html')
        }
        else{
            res.sendFile( __dirname + '/views/index.html')
        }
    }

    async login(req, res){
        let db = new DB('accounts');
        const { username, password } = req.body;
        const HashGenerator = new HashPass();
        const error_result = validationResult(req);

        if (!error_result.isEmpty()) {
            return res.status(401).send({ errors: error_result.array() });
        }

        HashGenerator.hashing(password).then((hashingPassword) =>{

            console.log('INFO: ', hashingPassword);
            
            db.querry("SELECT login, password FROM accounts WHERE login=?", [username], async (error, result) => {
                if (error) {
                    console.error('Error! ', error);
                } else if (result == false) {
                    console.error('Error! Invalid login');
                    res.status(401).json({message: "Unauthorized"});
                    res.end()

                } else {
                    const correctPassword = HashGenerator.check_pass(hashingPassword, password);
                    if (!correctPassword) {
                        console.error('Error! Invalid login or password');
                        res.status(401).json({message: "Unauthorized"});
                        res.end()
                    } else {
                        console.log('Success! ', result);

                        const client = createClient();
                        client.on('error', err => console.log('Redis Client Error', err));
                        await client.connect();

                        await client.set(username, generate_key());
                        const value = await client.get(username);
                        console.log('Данные из Redis - ', value)

                        res.cookie('UserData', generate_key, {maxAge: 3600 * 24});
                        // req.session.cookie()
                        res.status(301).json({redirectURL: '/apanel'});
                    }
                }
            });
        
            db.closeCon();
            console.log(username, password)
        });
    }

    async getRegistration(req, res){
        res.sendFile( __dirname + '/views/registration.html')
    }

    async registration(req, res){
        let db = await new DB('accounts');
        const { username, password } = req.body;
        const HashGenerator = new HashPass();
        const hashedPassword = await HashGenerator.hashing(password);

        const error_result = validationResult(req);

        if (!error_result.isEmpty()) {
            return res.status(401).send({ errors: error_result.array() });
        }

        let candidateExist = false;
    
        await db.querry("SELECT * FROM accounts WHERE login=?", [username], (error, result) => {
            if (error) {
                console.error(error);
            } else if(result) {
                candidateExist = true;
                return res.status(400).json({message: "Account with this login already exist"})
            }
        }); 

        if(!candidateExist){
            await db.querry("INSERT INTO accounts(login, password) VALUES(?, ?)", [username, hashedPassword], async (error, result) => {
                if (error) {
                    console.error(error);
                } else {

                }
            });
        }

        candidateExist = false;
        await db.closeCon();
        res.redirect(301, "/")
       
    }

    async getApanel(req, res){
        if(req.cookies.UserData == 'user1'){
            res.sendFile( __dirname + '/views/panel.html')
        }
        else{
            res.sendStatus(401)
        }
    }

    async clearCookie(req, res){
        res.clearCookie('UserData').send({'Error': 'Cookie cleared!', redirectURL: '/' })
    }
}

module.exports = new Controller();