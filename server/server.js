const express = require('express');
const bodyParser = require('body-parser');
var favicon = require('serve-favicon');
const { DB } = require('./work_db.js');


const app = express()

const actual_dir = __dirname.split('\\').slice(0, -1).join('\\')

app.use(express.static(actual_dir + "/client/src/public"));
app.use(favicon(actual_dir + '/client/src/public/images/favicon.ico'));
app.use(bodyParser.json());

const urlencodedParser = express.urlencoded({extended: false});

const PORT = 8000;
const HOSTNAME = '127.0.0.1';




app.get('/', (req, res) => {
    res.sendFile( actual_dir + '/client/src/index.html')
})

app.get('/registration', (req, res) => {
    res.sendFile( actual_dir + '/client/src/registration.html')
})


app.post('/', (req, res) => {
    let db = new DB('accounts');
    const { username, password } = req.body; // Получаем данные из запроса

    console.log(req.body)
    
    db.querry("SELECT login, password FROM accounts WHERE login=?", [username], (error, result) => {
        if (error) {
            console.error('Error! ', error);
        } else if (result == false){
            console.error('Error! Invalid');
        }
        else{
            console.log('Success! ', result); // Обработка результата запроса
        }
    });

    db.closeCon();
    
    console.log(username, password)
    res.status(200).json({ username, password });
    res.end()
    
    // Пример простой проверки на основе хардкодированных значений
    // if (username === 'user' && password === 'password') {
    //   // В случае успешной аутентификации отправляем ответ об успешной авторизации
    //   res.status(200).json({ message: 'Успешная аутентификация' });
    // } else {
    //   // В случае ошибки отправляем соответствующий статус и сообщение
    //   res.status(401).json({ message: 'Неверные учетные данные' });
    // }
  });

  app.post('/registration', (req, res) => {
    let db = new DB('accounts');
    const { username, password } = req.body; // Получаем данные из запроса
    
    db.querry("INSERT INTO accounts(login, password) VALUES(?, ?)", [username, password], (error, result) => {
        if (error) {
            console.error(error);
        } else {
            console.log(result); // Обработка результата запроса
        }
    });
    db.querry("SELECT * FROM accounts", [], (error, result) => {
        if (error) {
            console.error(error);
        } else {
            console.log(result); // Обработка результата запроса
        }
    });

    db.closeCon();
    
    console.log(username, password)
    //res.status(200).json({ message: 'Успешная регистрация' });
    res.redirect('/')
    // res.end()
    // res.end()
    
    // Пример простой проверки на основе хардкодированных значений
    // if (username === 'user' && password === 'password') {
    //   // В случае успешной аутентификации отправляем ответ об успешной авторизации
    //   res.status(200).json({ message: 'Успешная аутентификация' });
    // } else {
    //   // В случае ошибки отправляем соответствующий статус и сообщение
    //   res.status(401).json({ message: 'Неверные учетные данные' });
    // }
  });

app.listen(8000, () => {
    console.log(actual_dir);
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
})
