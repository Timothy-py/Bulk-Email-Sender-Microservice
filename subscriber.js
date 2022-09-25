const amqplib = require('amqplib/callback_api')
const nodemailer = require('nodemailer')
const config = require('./config')

// setup nodemailer transport
const transport = nodemailer.createTransport({
    
});

// create connection to AMQP server
amqplib.connect(config.amqp, (err, connection)=>{
    if(err){
        console.error(err.stack)
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
            durable: true
        }, err => {
            if(err){
                console.error(err.stack);
                return process.exit(1)
            }

            // Only request 1 unacked message from queue
            // This value represents the number of messages to process in parallel
            channel.prefetch(1);

            // callback to handle messages received from the queue
            channel.consume('mailer', data => {
                if(data === null){
                    console.log('Null data received')
                    return;
                }

                // decode message contents
                const message = JSON.parse(data.content.toString())
                const{to, subject, text} = message

                let mailOptions = {
                    from: 'Aradugbo Admin <admin.aradugbo@efficion.org>',
                    to: to,
                    subject: subject,
                    text: text
                  };

                // // send the message
                transport.sendMail(mailOptions, (err, info)=>{
                    if(err){
                        console.error(err.stack)
                        // put the failed message item back to queue
                        return channel.nack(data)
                    }

                    console.log(`Message delivered ${info.messageId}`)
                    // remove message item from the queue
                    channel.ack(data);
                })
            })
        })
    })
})