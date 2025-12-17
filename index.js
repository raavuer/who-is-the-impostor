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

const players = [];

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    players.splice(players.findIndex((player) => {player.id === socket.id}), 1);
    console.log(players);
    io.emit("changePlayers", players);
  });
  io.to(socket.id).timeout(10000).emit("getPlayerName", (error, playerName) => {
    if (error) {
      console.log(`Couldn't get player name: ${error}`);
    } else {
      players.push({
        id: socket.id,
        name: playerName.toString().match(/\w{3,10}/).toString()
      });
      console.log(players);
      io.emit("changePlayers", players);
    }
  });
});

server.listen(8080, () => {console.log('App started.');});
