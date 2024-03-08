const {MongoClient} = require("mongodb");
const {uriMongo} = require("config")


class mongoDB{

    async createConnection(URI){
        const client = new MongoClient(uriMongo);
        return await client.connect();
    }








}