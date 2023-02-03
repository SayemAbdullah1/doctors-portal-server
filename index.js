const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1q1hbsc.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try {
        const appointmentOptionsCollection = client.db('doctorsPortalNew').collection('appointmentOptions')
        const bookingsCollection = client.db('doctorsPortalNew').collection('bookings')

        app.get('/appointmentOptions',  async(req, res)=>{
            const query = {}
            const options = await appointmentOptionsCollection.find(query).toArray()
            res.send(options)
        })

        app.post('/bookings', async(req, res) =>{
            const query = req.body
            const result = await bookingsCollection.insertOne(query)
            res.send(result)
        })
    } finally {

    }
}
run().catch(console.log)


app.get('/', async(req, res) =>{
    res.send(`Doctors portal is running`)
})
app.listen(port, ()=> console.log(`Doctor portl is running on ${port}`))