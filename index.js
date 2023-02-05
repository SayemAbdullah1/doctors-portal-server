const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, CommandStartedEvent } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1q1hbsc.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try {
        const appointmentOptionsCollection = client.db('doctorsPortalNew').collection('appointmentOptions')
        const bookingsCollection = client.db('doctorsPortalNew').collection('bookings')
        const userssCollection = client.db('doctorsPortalNew').collection('users')
        

        app.get('/appointmentOptions',  async(req, res)=>{
            const date = req.query.date;
            // console.log(date)
            const query = {}
            const options = await appointmentOptionsCollection.find(query).toArray()
            const bookingQuery = { appointmentDate : date}
            const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray()
            options.forEach(option => {
                const optionsBooked = alreadyBooked.filter(book => book.treatment === option.name)
                const bookedSlots = optionsBooked.map(book => book.slot)
                const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
                option.slots=remainingSlots
                // console.log(option.name, remainingSlots.length)
            })
            res.send(options)
        })

        app.get('/bookings', async(req, res)=>{
            const email = req.query.email
            const query = {email: email}
            const bookings = await bookingsCollection.find(query).toArray()
            res.send(bookings)
        })

        app.post('/bookings', async(req, res) =>{
            const booking = req.body
            const query = {
                appointmentDate: booking.appointmentDate,
                email: booking.email,
                treatment: booking.treatment
            }
            const alreadyBooked = await bookingsCollection.find(query).toArray()
            if(alreadyBooked.length){
                const message = `You already booked on ${booking.appointmentDate}`
                return res.send({acknowledged: false, message})
            }
            const result = await bookingsCollection.insertOne(booking)
            res.send(result)
        })

        app.get('/jwt', async(req, res)=>{
            const email = req.query.email
            const query = {email: email}
            const user = await userssCollection.findOne(query)
            console.log(user)
            res.send({accesToken: 'Token'})
        })

        app.post('/users', async(req, res)=>{
            const query = req.body
            const result = await userssCollection.insertOne(query)
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