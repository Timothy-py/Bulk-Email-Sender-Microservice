const amqplib = require('amqplib/callback_api')
const config = require('./config.json')

// create connection to AMQP server
amqplib.connect(config.amqp, (err, connection) => {
    if(err) {
        console.log(err.stack)
        return process.exit(1)
    }

    // create channel
    connection.createChannel((err, channel)=>{
        if(err){
            console.error(err.stack)
            return process.exit(1)
        }

        // create queue for messages
        channel.assertQueue('mailer', {
            // ensure queue is not deleted when server restarts
            durable: true
        }, err => {
            if(err){
                console.error(err.stack)
                return process.exit(1)
            }

            // function to send data objects to the queue
            let sender = (content, next) => {
                let sent = channel.sendToQueue('mailer', Buffer.from(JSON.stringify(content)), {
                    // store queued data on disk
                    persistent: true,
                    contentType: 'application/json'
                });

                if(sent){
                    return next()
                } else {
                    channel.once('drain', () => next())
                }
            };

            // push 100 messages to queue
            let sent = 0;
            let sendNext = () => {
                if(sent >= 10 ) {
                    console.log('All messages sent!')
                    // close connection to AMQP server
                    return channel.close(() => connection.close())
                }
                
                sent++;
                
                sender({
                    to: 'recipient@email.com',
                    subject: `Test message #${sent}`,
                    text: 'hello world!'
                }, sendNext)
            };

            sendNext()
        })
    })
})