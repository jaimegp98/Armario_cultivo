const mqtt = require('mqtt')

const protocol = 'mqtt'
const host = 'test.mosquitto.org'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `${protocol}://${host}:${port}`

var messages = [];

const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
})

const connectMQTT = () => {
    client.on('connect', () => {
        console.log('Connected');
        
        /*client.on('message', (topic, payload) => {
            console.log('Received Message:', topic, payload.toString())
        });*/

    })
}

const subscribeTopic = (topicName) => {
    client.subscribe([topicName], () => {
        console.log(`Subscribe to topic '${topicName}'`)
    });

    client.on('message', (topic, message) => {
        // message is Buffer
        messages.push(message.toString())
        console.log(message.toString());
    });
}

const getMessages = () => {
    return messages
}

const resetMessages = () => {
    messages = []
}

const publishTopic = (topicName, message) => {
    return client.publish(topicName, message, { qos: 0, retain: false }, (error) => {
        if (error) {
          console.error(error)
          return false
        } 
        return true
    })
}

module.exports = {
    connectMQTT,
    subscribeTopic,
    publishTopic,
    getMessages,
    resetMessages
}; 