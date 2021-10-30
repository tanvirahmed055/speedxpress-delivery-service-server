const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;


const app = express()
const port = 5000

//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oa9tu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });




async function run() {
    try {
        await client.connect();
        const database = client.db("speedXpress_Db");
        const serviceCollection = database.collection("servicesData");

        //POST API for adding a new service
        app.post('/addService', async (req, res) => {
            const newService = req.body;
            console.log(newService);

            const result = await serviceCollection.insertOne(newService);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.json(result);
        })


        //GET API for getting services from database
        app.get('/services', async (req, res) => {
            // query for services 
            const query = {};
            const cursor = serviceCollection.find(query);
            // print a message if no documents were found
            if ((await cursor.count()) === 0) {
                console.log("No documents found!");
            }
            // replace console.dir with your callback to access individual elements
            const result = await cursor.toArray();
            res.json(result);
        })


        //GET API for getting a single service
        app.get('/services/:id', async (req, res) => {
            const serviceId = req.params.id;

            // Query for a service
            const query = { _id: ObjectId(serviceId) };

            const service = await serviceCollection.findOne(query);
            // since this method returns the matched document, not a cursor, print it directly
            res.json(service);

        })

    } finally {
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})