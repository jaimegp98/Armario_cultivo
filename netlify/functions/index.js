const express = require('express');
const { connectMQTT, publishTopic, subscribeTopic, getMessages, resetMessages } = require('./mqtt');

const app = express();

app.use(express.json());

app.post('/.netlify/functions/send/:temp/:hum', async (req, res) => {
    const { params: { temp, hum } } = req;

    if (!temp || !hum) {
        res.status(400).json({ status: 'FAILED', message: { error: 'Falta algún parámetro' } });
        return;
    }

    if (temp < 0 || hum < 0 || hum > 100) {
        res.status(400).json({ status: 'FAILED', message: { error: 'Valores fuera de rango permitido' } });
        return;
    }

    const publishedTemp = publishTopic('Tdeseada', temp);
    const publishedHum = publishTopic('Hdeseada', hum);

    if (!publishedTemp || !publishedHum) {
        res.status(500).json({ status: 'FAILED', message: { error: 'Error al publicar la temperatura o la humedad' } });
        return;
    }

    res.status(200).json({ status: 'OK' });
});

app.post('/.netlify/functions/subscribe/:topic', async (req, res) => {
    const { params: { topic } } = req;

    if (!topic) {
        res.status(400).json({ status: 'FAILED', message: { error: 'Falta algún parámetro' } });
        return;
    }

    connectMQTT();
    subscribeTopic(topic);

    res.status(200).json({ status: 'OK' });
});

app.get('/.netlify/functions/messages', async (req, res) => {
    const messages = getMessages();
    resetMessages();

    res.status(200).json({ status: 'OK', messages });
});

// Netlify Function entry point
exports.handler = async (event, context) => {
    // Use the Express app as a serverless function
    return app(event, context);
};