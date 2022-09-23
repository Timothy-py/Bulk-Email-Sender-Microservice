const SMTPServer = require('smtp-server').SMTPServer;
const config = require('./config.json')

const server = new SMTPServer({
    logger: false,
    banner: "Welcome to Mailer Microservice",
    disabledCommands: ['STARTTLS'],
    size: 10*1024*1024,
    onAuth(auth, session, callback){
        return callback(null, {
            user: {
                username: auth.username
            }
        })
    },
    onData(stream, session, callback){
        console.log('Streaming message from user %s', session.user.username);
        console.log('------------------');
        stream.pipe(process.stdout)
        stream.on('end', ()=>{
            console.log('')
            callback(null, 'Message queued as ' + Date.now())
        })
    }
})

server.on('error', err => {
    console.log('Error occurred');
    console.log(err);
});

// start listening
server.listen(config.server.port, config.server.host);