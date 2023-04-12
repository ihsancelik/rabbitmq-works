const { Agenda } = require('@hokify/agenda')
const amqp = require('amqplib');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');


const mongoAgendaConnectionString = config.connection.agendaUrl;
const mongoLogConnectionString = config.connection.nssLogUrl;
const queue = config.connection.rabbitMQQueue;

const agenda = new Agenda({ db: { address: mongoAgendaConnectionString } });

async function init() {
    const connection = await amqp.connect(config.connection.rabbitMQUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });


    const mongoClient = await MongoClient.connect(mongoLogConnectionString);
    const db = mongoClient.db(config.connection.nssDbName);
    const collection = db.collection(config.connection.nssCollectionName);

    let isSaving = false;
    var generation = 1;

    setInterval(async () => {
        if (isSaving) return;
        isSaving = true;

        for (let index = 0; index < 10000; index++) {

            const message = await channel.get(queue, { noAck: false });

            if (!message) break;

            var data = JSON.parse(message.content.toString());
            const result = await collection.insertOne(data);
            // Acknowledge the message if it was inserted into the database
            if (result.acknowledged) {
                channel.ack(message);
                console.log(`Message acknowledged ${message.content.toString()} gen:${generation} `);
            }
            else {
                console.log("Message not acknowledged");
            }

        }

        generation++;
        isSaving = false;
    }, 3000);


}

(async function () {

    await init();

    // console.log("Starting agenda");
    // const logWriter = agenda.create('check new logs');
    // await agenda.start();
    // logWriter.repeatEvery('2 minutes').save();
    // console.log("Agenda started");
})();