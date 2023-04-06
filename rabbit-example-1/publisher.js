const amqp = require("amqplib");

const data = require("./data.json");
const queueName = process.argv[2] || "jobsQueue";

const message = {
    userId: -1,
    requestCount: 0
} 

connect();

async function connect() {
    try {

        const connection = await amqp.connect('amqp://rabbitmquser:1234@127.0.0.1:5672/notsosecret');
        const channel = await connection.createChannel();
        const assertion = await channel.assertQueue(queueName);

        data.forEach(i => {
            message.userId = i.id;
            message.requestCount++;
            channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
            console.log("Sent: ", i);
        })


        /* Interval
        setInterval(() => {
            message.count++;
            message.description = queueName;
            channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
        }, 500);
        Interval end */

        console.log("The message was sent successfully!", message);

    } catch (error) {
        console.log(error);
    }
}