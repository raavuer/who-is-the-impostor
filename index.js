"use strict";
import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";
const app = express();
const server = createServer(app);
const io = new Server(server);
const __dirname = dirname(fileURLToPath(import.meta.url));
app.get("/", (req, res) => {res.sendFile(join(__dirname, 'index.html'));});

const settings = {
  numberOfPlayers: 4,
  numberOfImpostors: 1,
};
const players = {};
function Player(id) {
  this.id = id;
  this.role = "Unassigned";
}

io.on("connection", (socket) => {
  players[socket.id] = new Player(socket.id);
  socket.on("disconnect", () => {
    delete players[socket.id];
  });
  if (Object.keys(players).length < settings.numberOfPlayers) {
    return;
  }
  for (let i = 0; i < settings.numberOfPlayers; i++) {
    players[Object.keys(players)[i]].role = "Bystander";
  }
  for (let i = 0; i < settings.numberOfImpostors; i++) {
    // FIX - Allows one person to be impostor multiple times
    players[Object.keys(players)[Math.floor(Math.random() * settings.numberOfPlayers)]].role = "Impostor";
  }
  io.emit("getRoles", players);
});

server.listen(8080, () => {console.log('App started.');});
