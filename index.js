const express = require("express");
const {connectMQTT, publishTopic, subscribeTopic, getMessages, resetMessages} = require("./mqtt")
const cors = require('cors');

const app = express();
const apiPort = 3000;

app.use(cors());

app.post("/send/:temp/:hum", (req, res) => {
    const {params: { temp, hum }} = req;

    if(!temp || !hum) {
        res.status(500).json({ status: "FAILED", message: { error: "Falta algún parámetro"} });
        return;
    }

    if(temp < 0 || hum < 0 || hum > 100) {
        res.status(500).json({ status: "FAILED", message: { error: "Valores fuera de rango permitido"} });
        return;
    }

    const publishedTemp = publishTopic('Tdeseada', temp)

    if(!publishedTemp) {
        res.status(500).json({ status: "FAILED", message: { error: "Error al publicar la temperatura"} });
        return;
    }
    
    const publishedHum = publishTopic('Hdeseada', hum)

    if(!publishedHum) {
        res.status(500).json({ status: "FAILED", message: { error: "Error al publicar la humedad"} });
        return;
    }

    res.status(200).json({ status: "OK"});
});

app.post("/subscribe/:topic", (req, res) => {
    const {params: { topic }} = req;

    if(!topic) {
        res.status(500).json({ status: "FAILED", message: { error: "Falta algún parámetro"} });
        return;
    }

    connectMQTT();

    subscribeTopic(topic);
});

app.get("/messages", (req, res) => {
    const messages = getMessages();

    resetMessages();

    res.status(200).json({ status: "OK", messages: messages});
});

app.listen(apiPort, () => {console.log(`🚀 Server listening on port ${apiPort}`)});