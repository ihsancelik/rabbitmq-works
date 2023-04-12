const amqp = require('amqplib');

const rabbitmqUrl = 'amqp://localhost';
const rabbitmqQueue = 'nss-logs';

let counter = 1000000;
sendToRabbitMQ();

async function sendToRabbitMQ() {
  try {
    const rabbitmqConnection = await amqp.connect(rabbitmqUrl);
    const channel = await rabbitmqConnection.createChannel();
    await channel.assertQueue(rabbitmqQueue, { durable: true });

    while (true) {
      counter--;
      var sendObject = { message: 'Hello World!', counter: counter };
      channel.sendToQueue(rabbitmqQueue, Buffer.from(JSON.stringify(sendObject)));
      console.log(`message sent: ${sendObject.counter}`);
      if (counter <= 0) break;
    }


  } catch (error) {
    console.error(error);
  }
}
