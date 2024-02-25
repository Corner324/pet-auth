const bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
const { DB } = require('./work_db.js');
const { HashPass } = require('./hash_pass.js');
const path = require('path')


class Controller{

    async getLogin(req, res){
        if(req.cookies.UserData == 'user1'){
            res.sendFile( __dirname + '/views/index_APanel.html')
        }
        else{
            res.sendFile( __dirname + '/views/index.html')
        }
    }

    async login(req, res){
        let db = new DB('accounts');
        const { username, password } = req.body; // Получаем данные из запроса
        const HashGenerator = new HashPass();
        HashGenerator.hashing(password).then((hashingPassword) =>{

            console.log('INFO: ', hashingPassword)
        
            console.log(req.body)
            
            db.querry("SELECT login, password FROM accounts WHERE login=?", [username], (error, result) => {
                if (error) {
                    console.error('Error! ', error);
                } else if (result == false){
                    console.error('Error! Invalid login or password');
                    res.status(401).json({ "Error": "Unauthorized" });
                    res.end()
        
                }
                else{
                    const correctPassword = HashGenerator.check_pass(hashingPassword, password);
                    if(!correctPassword){
                        console.error('Error! Invalid login or password');
                        res.status(401).json({ "Error": "Unauthorized" });
                        res.end()
                    }
                    else{
                        console.log('Success! ', result); // Обработка результата запроса
                        res.cookie('UserData', 'user1', {expire: 360000 + Date.now()});
                        res.status(301).json({ redirectURL: '/apanel' });
                        //res.status(200).json({ username, password });
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
        const { username, password } = req.body; // Получаем данные из запроса
        const HashGenerator = new HashPass();
        const hashedPassword = await HashGenerator.hashing(password);

        let candidateExist = false;
    
        await db.querry("SELECT * FROM accounts WHERE login=?", [username], (error, result) => {
            if (error) {
                console.error(error);
            } else if(result) {
                candidateExist = true;
                res.status(400).json({message: "Account with some login already exist"})
            }
            else{
                
            }
        }); 

        if(!candidateExist){
            await db.querry("INSERT INTO accounts(login, password) VALUES(?, ?)", [username, hashedPassword], (error, result) => {
                if (error) {
        
                    console.error(error);
                } 
                console.log(hashedPassword);
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