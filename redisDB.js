const {createClient} = require("redis");

class redisDB{

    async setConnectrion(){
        const client = createClient();
        client.on('error', err => console.log('Redis Client Error', err));
        return await client.connect();
    }
}

module.exports = new redisDB