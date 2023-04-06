const amqp = require("amqplib");

const data = require("./data.json");
const queueName = process.argv[2] || "jobsQueue";

const message = {
    description: "This is a test message!"
}

connect();

async function connect() {
    try {

        const connection = await amqp.connect('amqp://rabbitmquser:1234@127.0.0.1:5672/notsosecret');
        const channel = await connection.createChannel();
        const assertion = await channel.assertQueue(queueName);

        channel.consume(queueName, message => {
            const messageInfo = JSON.parse(message.content.toString());
            const userInfo = data.find(s => s.id == messageInfo.userId);
            if (userInfo) {
                console.log("User found: ", userInfo);
                channel.ack(message);
            }
            else {
                console.log("User not found!");
                channel.nack(message);
            }
        });

    } catch (error) {
        console.log(error);
    }
}