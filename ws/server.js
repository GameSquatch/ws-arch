import { readFile, writeFile } from "node:fs";
import path from "node:path";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 5174 });

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (rawData) => {
    const message = JSON.parse(rawData.toString("utf8"));
    switch (message.type) {
      case "getUserPreferences":
        readStored("user_preferences.json", (readData) => {
          ws.send(readData);
        });
        break;
      case "userPreferences":
        writeStored("user_preferences.json", rawData);
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState == 1) {
            // 1 is OPEN
            client.send(rawData.toString("utf8"));
          }
        });
        break;
      case "getTree":
        readStored("tree.json", (readData) => {
          ws.send(readData);
        });
        break;
      case "tree":
        writeStored("tree.json", rawData);
        wss.clients.forEach((client) => {
          client.send(rawData.toString("utf8"));
        });
        break;
    }
  });
});

function readStored(fileName, onDone) {
  readFile(path.join("./", "ws", fileName), (err, data) => {
    if (err) return;
    onDone(data.toString("utf8"));
  });
}

function writeStored(fileName, data) {
  writeFile(path.join("./", "ws", fileName), data, { flag: "w+" }, (err) => {
    if (err) console.error("Error saving prefs", err);
  });
}
