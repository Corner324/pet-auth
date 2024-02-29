const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const { DB } = require('./work_db.js');
const { HashPass } = require('./hash_pass.js');
const path = require('path')
const { query, validationResult } = require('express-validator');
const crypto = require('crypto');
const session = require('express-session');
const { secret } = require('./config')
const { createClient } = require('redis');


const generate_key = function() {
    return crypto.randomBytes(16).toString('base64');
};

class Controller {

    async getLogin(req, res){

        const client = createClient();
        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();
        if(req.cookies.UserName) {
            const usr_name = req.cookies.UserName;
            console.log('UserName from cookies - ', usr_name)
            const usr_data = await client.get(usr_name);
            if(req.cookies.UserData === usr_data){
                res.sendFile( __dirname + '/views/index_APanel.html')
            }
        }
        else {
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

            console.log('hashingPassword: ', hashingPassword);
            
            db.querry("SELECT login, password FROM accounts WHERE login=?", [username], async (error, result) => {
                if (error) {
                    console.error('Error! ', error);
                } else if (result === false) {
                    res.status(401).json({message: "Unauthorized, invalid login"}); // w/o return ?
                    res.end()

                } else {
                    const correctPassword = HashGenerator.check_pass(hashingPassword, password);
                    if (!correctPassword) {
                        res.status(401).json({message: "Unauthorized, invalid login or password"});
                        res.end()
                    } else {
                        console.log('Success! ', result);



                        res.cookie('UserData', generate_key(), {maxAge: 3600 * 24});
                        res.cookie('UserName', username, {maxAge: 3600 * 24});
                        // req.session.cookie()


                        const client = createClient();
                        client.on('error', err => console.log('Redis Client Error', err));
                        await client.connect();

                        await client.set(username, generate_key());
                        const value = await client.get(username);
                        console.log('Данные из Redis - ', value);

                        res.status(301).json({redirectURL: '/apanel'});
                    }
                }
            });
            db.closeCon();
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
            console.log('ОШИБКА РЕГИСТРАЦИИ ПО ДАННЫМ')
            res.status(401).send({ errors: error_result.array() });
            res.end()
        }

        let candidateExist = false;
    
        await db.querry("SELECT * FROM accounts WHERE login=?", [username], (error, result) => {
            if (error) {
                console.log('ОШИБКА РЕГИСТРАЦИИ ПО БД');
                console.error(error);
                return 0
            } else if(result) {
                candidateExist = true;
                console.log('ТАКОЙ ЛОГИН УЖЕ ЕСТЬ');
                res.status(400).json({message: "Account with this login already exist"})
                return res.end()
            }
        }); 

        if(!candidateExist){
            await db.querry("INSERT INTO accounts(login, password) VALUES(?, ?)", [username, hashedPassword], async (error, result) => {
                if (error) {
                    console.log('ОШИБКА РЕГИСТРАЦИИ ПО БД 2')
                    console.error(error);
                    return 0
                }
                else{
                    res.redirect(301, "/")
                }
            });
        }

        candidateExist = false;
        await db.closeCon();

    }

    async getApanel(req, res){
        const client = createClient();
        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();
        if(req.cookies.UserName) {
            const usr_name = req.cookies.UserName;
            console.log('UserName from cookies - ', usr_name)
            const usr_data = await client.get(usr_name);
            if(req.cookies.UserData === usr_data){
                res.sendFile( __dirname + '/views/panel.html')
                res.end()
            }
        }
        else{
            res.sendStatus(401)
            res.end()
        }
    }

    async clearCookie(req, res){
        res.clearCookie('UserData').send({'Error': 'Cookie cleared!', redirectURL: '/' })
    }
}

module.exports = new Controller();