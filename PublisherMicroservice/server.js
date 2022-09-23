const express = require('express')
const Producer = require('./producer')

const app = express()
const producer = new Producer()

app.use(express.json())


app.post('/sendMsg', async(req, res) => {
    const {logType, message} = req.body

    await producer.messagePublisher(logType, message)

    res.send()
})

app.listen(3000, ()=>{
    console.log("Server started....")
})