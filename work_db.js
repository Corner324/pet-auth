const sqlite3 = require('sqlite3').verbose();

class DB {
    constructor(table_name) {
        // Открываем соединение с базой данных
        this.db = new sqlite3.Database('mydatabase.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the database.');
        });

        // Выполняем SQL-запросы
        this.db.serialize(() => {
            this.db.run(`CREATE TABLE IF NOT EXISTS ${table_name} (login TEXT, password TEXT)`);
        });
    }

    querry(req, arg, callback) {
        this.db.serialize(() => {
            if (req.split(' ')[0] == 'SELECT'){
                this.db.all(req, arg, (err, row) => {
                    if (err) {
                        callback("Error! " + err.message, null);
                    } else {
                        callback(null, row);
                    }
                });
            } else {
                this.db.each(req, arg, (err, row) => {
                    if (err) {
                        callback("Error! " + err.message, null);
                    } else {
                        callback(null, row);
                    }
                });
            }
        });
    }

    closeCon() {
        // Закрываем соединение с базой данных
        this.db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Disconnected from the database.');
        });
    }
}

module.exports = { DB };
