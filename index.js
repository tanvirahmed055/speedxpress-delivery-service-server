const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;


const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oa9tu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });




async function run() {
    try {
        await client.connect();
        const database = client.db("speedXpress_Db");
        //database collections
        const serviceCollection = database.collection("servicesData");
        const orderCollection = database.collection("ordersData");
        const clientCollection = database.collection("clientsData");

        //POST API for adding a new service
        app.post('/addService', async (req, res) => {
            const newService = req.body;
            //console.log(newService);

            const result = await serviceCollection.insertOne(newService);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.json(result);
        })

        //POST API for adding orders in orderCollection
        app.post('/addOrder', async (req, res) => {
            const newOrder = req.body;
            //console.log(newOrder);

            const result = await orderCollection.insertOne(newOrder);
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


        //GET API for getting orders from database of a particular user
        app.get('/orders/:userEmail', async (req, res) => {
            const userEmail = req.params.userEmail;
            //console.log(userEmail);

            // Query for a user's orders
            const query = { email: userEmail };

            const cursor = orderCollection.find(query);
            // print a message if no documents were found
            if ((await cursor.count()) === 0) {
                console.log("No documents found!");
            }

            const result = await cursor.toArray();
            res.json(result);
        })

        //GET API for getting clients from database
        app.get('/clients', async (req, res) => {
            // query for clients 
            const query = {};
            const cursor = clientCollection.find(query);
            // print a message if no documents were found
            if ((await cursor.count()) === 0) {
                console.log("No documents found!");
            }
            // replace console.dir with your callback to access individual elements
            const result = await cursor.toArray();
            res.json(result);
        })


        //GET API for getting all the orders from database
        app.get('/orders', async (req, res) => {
            // query for orders
            const query = {};
            const cursor = orderCollection.find(query);
            // print a message if no documents were found
            if ((await cursor.count()) === 0) {
                console.log("No documents found!");
            }


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

        //DELETE API for deleting an order
        app.delete('/deleteOrder/:id', async (req, res) => {
            const orderId = req.params.id;

            // Query for order Id
            const query = { _id: ObjectId(orderId) };

            const result = await orderCollection.deleteOne(query);

            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
            } else {
                console.log("No documents matched the query. Deleted 0 documents.");
            }
        })


        //PUT API for updating the order status of an order
        app.put('/updateOrderStatus/:id', async (req, res) => {
            const orderId = req.params.id;

            let updatedOrderStatus = req.body.status;

            updatedOrderStatus = 'approved';

            // create a filter for a order to update
            const filter = { _id: ObjectId(orderId) };

            // this option instructs the method to create a document if no documents match the filter
            const options = { upsert: true };

            // create a document that sets the plot of the movie
            const updateDoc = {
                $set: {
                    status: `${updatedOrderStatus}`
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
            res.json(result);
        })

    } finally {
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Welcome to SpeedXpress Server!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})