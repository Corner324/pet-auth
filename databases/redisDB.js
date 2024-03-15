const { createClient } = require('redis')

class redisDB {

    async setConnection() {
        this.client = createClient()
        this.client.on('error', (err) => console.log('Redis Client Error', err))
        return await this.client.connect()
    }

    getClient(){
        return this.client
    }

    logog(){
        console.log('logo')
    }
}

module.exports = new redisDB()
