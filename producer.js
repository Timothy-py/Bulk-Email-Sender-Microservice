const amqp = require('amqplib')
const config = require('./config')

const {url, exchangeName} = config.rabbitMQ

class Producer {
    channel;

    async createChannel () {
        // initialize rabbitmq connection
        const connection = await amqp.connect(url)

        // create channel
        this.channel = await connection.createChannel();
    }

    // create msg publisher function
    async messagePublisher(routingKey, message){
        // if connection has not been created: create one
        if (!this.channel){
            await this.createChannel()
        }

        // create exchange
        await this.channel.assertExchange(exchangeName, 'direct')

        const msgDetails = {
            msgType: routingKey,
            message: message,
            timestamp: new Date()
        }

        // publish message to the exchange
        await this.channel.publish(
            exchangeName,
            routingKey,
            Buffer.from(JSON.stringify(msgDetails))
        )

        console.log(`The message ${message} has been sent to exchange ${exchangeName}`)
    }
}

module.exports = Producer;