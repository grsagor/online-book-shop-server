const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7le8ogp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        const categoryCollection = client.db('assignment-12').collection('categories');
        const booksCollection = client.db('assignment-12').collection('books');
        const bookingCollection = client.db('assignment-12').collection('bookings');

        /* Categories */
        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await categoryCollection.find(query).toArray();
            res.send(categories);
        });

        /* Books */
        app.get('/books', async (req, res) => {
            let query = {};

            if(req.query.id){
                query = {
                    categoryID: req.query.id
                }
            };

            const books = await booksCollection.find(query).toArray();
            res.send(books);
        });

        app.get('/books/:id', async (req, res) => {
            const id = req.params.id;
            const query = {categoryID: id};
            const books = await booksCollection.find(query).toArray();
            res.send(books);
        });

        app.post('/bookings', async (req, res) => {
            const body = req.body;
            console.log(body)
            const result = await bookingCollection.insertOne(body);
            res.send(result);
        })
    }
    finally{

    }
}

run().catch(console.log)


app.get('/', (req, res) => {
    res.send('server is running');
})

app.listen(port, () => {
    console.log('Server is running');
})