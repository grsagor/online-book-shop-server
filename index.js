const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { query } = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7le8ogp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try{
        const categoryCollection = client.db('assignment-12').collection('categories');
        const booksCollection = client.db('assignment-12').collection('books');
        const bookingCollection = client.db('assignment-12').collection('bookings');
        const usersCollection = client.db('assignment-12').collection('users');
        const advertiseCollection = client.db('assignment-12').collection('advertise');

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

            if(req.query.sellerEmail){
                query = {
                    sellerEmail: req.query.sellerEmail
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

        /* Post Book */
        app.post('/books', async (req, res) => {
            const body = req.body;
            const result = await booksCollection.insertOne(body);
            res.send(result);
        });

        /* Bokkingssssssssssssssssssss */
        app.post('/bookings', async (req, res) => {
            const body = req.body;
            const result = await bookingCollection.insertOne(body);
            res.send(result);
        });

        app.get('/bookings', async (req, res) => {
            let query = {};
            // console.log(req.headers.authorization);
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            };

            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        });

        /* Uerssssssssssssssssssssssssssssssssssssssss */

        app.get('/jwt', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'});
                return res.send({accessToken: token});
            }
            console.log(user);
            res.status(403).send({accessToken: ''});
        })
/* User Add */
        app.post('/users', async (req, res) => {
            const body = req.body;
            const result = await usersCollection.insertOne(body);
            res.send(result);
        });

        /* User Delete */
        app.delete('/user/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const users = await usersCollection.deleteOne(query);
            res.send(users);
        })

        app.get('/users', async (req, res) => {
            let query = {};

            if(req.query.role){
                query = {
                    role: req.query.role
                }
            };

            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.get('/users/admin/:email', async(req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send( {isAdmin: user?.role === 'admin'} );
        });

        app.put('/users/admin/:id',verifyJWT, async(req, res) => {
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await usersCollection.findOne(query);
            if(user?.role !== 'admin'){
                return res.status(403).send({messasge: 'forbidden'})
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        /* selleeeeeeeeeeeeeerrrrrrrrrrrrrrrrr */
        app.get('/users/seller/:email', async(req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send( {isSeller: user?.role === 'Seller'} );
        });

        /* Advertisement */
        app.post('/advertise', async (req, res) => {
            const body = req.body;
            const result = await advertiseCollection.insertOne(body);
            res.send(result);
        });

        app.get('/advertise', async (req, res) => {
            let query = {};
            const result = await advertiseCollection.find(query).toArray();
            res.send(result);
        });

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