import { readFile, writeFile } from 'node:fs';
import path from 'node:path';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 5174 });

wss.on('connection', (ws) => {
    ws.on('error', console.error);

    ws.on('message', (rawData) => {
        const message = JSON.parse(rawData.toString('utf8'));
        switch (message.type) {
            case 'getUserPreferences':
                readStored((readData) => {
                    ws.send(readData);
                });
                break;
            case 'userPreferences':
                writeStored(rawData);
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState == 1) {// 1 is OPEN
                        client.send(rawData.toString('utf8'));
                    }
                });
                break;
        }
    });
});

function readStored(onDone) {
    readFile(path.join('./', 'ws', 'user_preferences.json'), (err, data) => {
        if (err) return;
        onDone(data.toString('utf8'));
    });
}

function writeStored(data) {
    writeFile(path.join('./', 'ws', 'user_preferences.json'), data, { flag: 'w+' }, (err) => {
        if (err) console.error('Error saving prefs', err);
    });
}
