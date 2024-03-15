import { createClient } from 'redis';

class redisDB {

    async setConnection() {
        this.client = createClient()
        this.client.on('error', (err) => console.log('Redis Client Error', err))
        console.log('Соединение установлено!')
        await this.client.connect()
        return this.client
    }

    getClient(){
        console.log('ПОЛУЧИТЬ КЛИЕНТА!')
        return this.client
    }

    logog(){
        console.log('logo')
    }
}

export default new redisDB()
