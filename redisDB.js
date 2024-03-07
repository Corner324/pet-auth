const {createClient} = require("redis");

class redisDB{

    async setConnection(){
        const client = createClient();
        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect()
        return client
    }
}

module.exports = redisDB