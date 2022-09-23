const amqp = require('amqplib')
const config = require('./config')

const {url, exchangeName} = config.rabbitMQ


async function messageConsumer () {
    const connection =  await amqp.connect(url)
    const channel = await connection.createChannel()
    
    await channel.assertExchange(exchangeName, 'direct')

    const q = await channel.assertQueue('InfoQueue')

    await channel.bindQueue(q.queue, exchangeName, 'Info');

    channel.consume(q.queue, (msg)=>{
        const data = JSON.parse(msg.content)
        console.log(data)
        channel.ack(msg)
    })
}

messageConsumer()