const express = require('express')
const { MongoClient } = require('mongodb')
const cors = require('cors')
const app = express()

let db;
(async () => {
    try {
        let url = "mongodb://localhost:27017"
        let dbName = "office"

        const client = new MongoClient(url)
        await client.connect()
        db = client.db(dbName)
        console.log('Connected to Mongo')
    } catch (err) {
        console.log(err)
    }
})()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.status(200).send('working')
})

app.post('/add-transactions', async (req, res) => {
    let { date, type, amount, desc } = req.body
    
    // check if amount is less than 1
    if (amount <= 0) {
        return res.status(200).send({
            message: "Please enter amount greater than 0"
        })
    }
    let balance = 0
    // get previous balance
    const details = await db.collection('account').find().sort({ date: -1}).toArray()
    // console.log('=>>>', details)
    if(details.length > 0){
        balance = details[0].balance
    }
    // add balance if type is credit
    if (type == 'credit') balance += amount
    //sub balanceif type is debit
    if(type == 'debit'){
        if(amount > balance){
            return res.status(200).send({
                message: 'Debit amount cannot be greater than balance'
            })
        }else{
            balance -= amount
        }
    }
    console.log('balance is: ', balance)
    // add updated record in db
    if(type == 'credit') { 
        let d = await db.collection('account').insertOne({
        date: date,
        desc: desc,
        credit: amount,
        balance: balance
    })
    if(d){
        return res.status(200).send({
            message: 'Transcation successful'
        })
    }
}
    else{
     
        let d = await db.collection('account').insertOne({
            date: date,
            desc: desc,
            debit: amount,
            balance: balance
        })
        if(d){
            return res.status(200).send({
                message: 'Transcation successful'
            })
        }
    
}
    


})

app.get('/show-transactions', async (req, res) => {
    const details = await db.collection('account').find().sort({ date: -1}).toArray()
    // console.log(details)
    res.status(200).send(details)
})

app.listen(8000, () => {
    console.log('App running on port 3000')
})