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
function Player(name) {
  this.name = name;
  this.role = "Unassigned";
  this.vote = "No one";
}

function startGame() {
  for (let i = 0; i < settings.numberOfPlayers; i++) {
    players[Object.keys(players)[i]].role = "Bystander";
  }
  for (let i = 0; i < settings.numberOfImpostors; i++) {
    // FIX - Allows one person to be impostor multiple times
    players[Object.keys(players)[Math.floor(Math.random() * settings.numberOfPlayers)]].role = "Impostor";
  }
  for (const player of Object.keys(players)) {
    io.to(player).emit("getRole", players[player]);
  }
}

io.on("connection", (socket) => {
  players[socket.id] = new Player(socket.id);
  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("getPlayersNames", players); // Probably gives client too much trust (can see roles possibly)
  });
  socket.on("changeName", (name) => {
    players[socket.id].name = name.match(/\w{3,10}/);
    io.emit("getPlayersNames", players); // Probably gives client too much trust (can see roles possibly)
  });
  if (Object.keys(players).length < settings.numberOfPlayers) {
    return;
  }
  startGame();
  socket.once("voteFor", (votedFor) => {
    players[socket.id].vote = votedFor;
    console.log(`${players[socket.id].name} voted for ${players[socket.id].vote}`);
  });
});

server.listen(8080, () => {console.log('App started.');});

/* TODO
 * Remove cheating through getPlayersNames and browser network
 * Add voting confirmation for client
 *
*/
