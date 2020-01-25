const express = require('express');
const mongoose = require('mongoose');
const db = "mongodb+srv://pvpsimapp:pvpsimapp123@cluster0-oxflz.mongodb.net/pvpsimulator?retryWrites=true&w=majority";
const pokemon = require('./routes/api/pokemon');
const users = require('./routes/api/users');
const moves = require('./routes/api/moves');
//const online = require('./routes/api/onlineusers');

const app = express();
app.use(express.json());

//Connect to mongo
mongoose.connect(db, {useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true})
.then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));

//Use Routes
app.use('/api/pokemon', pokemon);
app.use('/api/users',users);
app.use('/api/moves', moves);
//app.use('/api/online', online);

//temporarily store socket ids for sockets that are moving to a battle
var socketsInWaiting = [];

app.post('/api/socket/store', (req, res) => {
    socketsInWaiting.push(req.body);
    console.log(req.body);
    console.log(`Sockets: ${socketsInWaiting}`);
    res.sendStatus(200);
}); //after this, replace the socket with this id with a new socket created by battle.html
//or, store the id of the socket in waiting in localStorage and use addToLobby or similar to replace with the new socket


const port = process.env.PORT || 4000;

var server = app.listen(port, () => console.log(`Server started on port ${port}`));

const io = require('socket.io')(server);

var players = 0;
var lobbies = [];
for (var i = 0; i < 9999; i++) {
    lobbies.push({});
}

function addPlayerToLobby(player, id, privacyPacket) {
    console.log("Adding player to lobby. Private: " + privacyPacket.status);
    for (var i = id; i < 9999; i++) {
        if (!lobbies[i].player1) {
            lobbies[i].player1 = player; //add first player to lobby
            lobbies[i].player1.lobbyid = i;
            lobbies[i].player1.lobbypos = 1;
            if(privacyPacket.status){
                lobbies[i].private = true;
                lobbies[i].awaiting1 = privacyPacket.awaiting1;
                lobbies[i].awaiting2 = privacyPacket.awaiting2;
            }
            if (lobbies[i].player2) {
                lobbies[i].player1.emit("lobbycount", {count: 2});
                lobbies[i].player2.emit("lobbycount", {count: 2});
            } else {
                lobbies[i].player1.emit("lobbycount", {count: 1});
            }
            return i;
        }
        if (!lobbies[i].player2 && !lobbies[i].private) {
            console.log("Adding second player. Private lobby: " + lobbies[i].private);
            lobbies[i].player2 = player; //add second player to lobby
            lobbies[i].player2.lobbyid = i;
            lobbies[i].player2.lobbypos = 2;
            if (lobbies[i].player1) {
                lobbies[i].player1.emit("lobbycount", {count: 2});
                lobbies[i].player2.emit("lobbycount", {count: 2});
            } else {
                lobbies[i].player2.emit("lobbycount", {count: 1});
            }
            return i;
        }else if(!lobbies[i].player2 && lobbies[i].private && privacyPacket.status){
            console.log("User Id on socket: " + player.userId);
            if(player.userId === lobbies[i].awaiting1 || player.userId === lobbies[i].awaiting2){
                console.log("Adding second player. Private lobby: " + lobbies[i].private);
                lobbies[i].player2 = player; //add second player to lobby
                lobbies[i].player2.lobbyid = i;
                lobbies[i].player2.lobbypos = 2;
                if (lobbies[i].player1) {
                    lobbies[i].player1.emit("lobbycount", {count: 2});
                    lobbies[i].player2.emit("lobbycount", {count: 2});
                } else {
                    lobbies[i].player2.emit("lobbycount", {count: 1});
                }
                return i;
            }
        }
    }
    //shouldn't happen
    return -1;
}
function removePlayerFromLobby(player) {
    var i = player.lobbyid;
    var pos = player.lobbypos;
    var pos2 = other(pos);
    lobbies[i]["player" + pos] = undefined;
    if (lobbies[i]["player" + pos2])
        lobbies[i]["player" + pos2].emit("lobbycount", {count: 1});
}
//send a packet to the opponent
function sendToOther(player, msg, data) {
    var i = player.lobbyid;
    var pos = player.lobbypos;
    var pos2 = other(pos);
    if (lobbies[i]["player" + pos2])
        lobbies[i]["player" + pos2].emit(msg, data);
}
function other(pos) {
    return pos === 2 ? 1 : 2
}
//send start packet and the amount of players in each mode
function sendLobbyCount() {
    var res = {lobbies1: "", lobbies2: ""};
    var great = 0;
    var master = 0;
    for (var i = 0; i < 9999; i++) {
        if (lobbies[i].player1 && lobbies[i].player2) {
            res.lobbies2 += (", " + (i + 1));
            if (i > 100 && i < 5000)
                great += 2;
            if (i > 5000)
                master += 2;
            continue;
        }
        if (lobbies[i].player1 || lobbies[i].player2) {
            res.lobbies1 += (", " + (i + 1));
            if (i > 100 && i < 5000)
                great += 1;
            if (i > 5000)
                master += 1;
        }


        if (lobbies[i].player1 && lobbies[i].player1.ready && lobbies[i].player2 && lobbies[i].player2.ready) {
            lobbies[i]["player1"].emit('start', {});
            lobbies[i]["player2"].emit('start', {});
        }

    }
    res.lobbies1 = res.lobbies1.replace(", ", "");
    res.lobbies2 = res.lobbies2.replace(", ", "");
    io.sockets.emit('playersinmodes', {great, master});
    //this tells the client if the opponent disconnected
    console.log(res);
    io.sockets.emit('lobbycount', res);
}

//replace io.sockets.on(connection) here
io.sockets.on('connection', socket => {
    console.log(socket.id);

    socket.on('attachuser', function(data){ //might have to send socket with new field back to the user
        socket.userId = data._id;
    });

    //receive socket that player 2 has accepted request, send socket to player 1
    socket.on('challengeaccepted', function(data) {
        var socketList = io.sockets.server.eio.clients;
        if (socketList[data.socketId] === undefined){
            socket.emit('challengefailed', {});
        }else {
            io.to(`${data.socketId}`).emit('challengeaccepted', {});
        }
    });

    //var chatlog = "";
    socket.on('battleconnection', function(data) { //this emit is sent from the battle page with localStorage data and new socket!!!!
        socket.emit('connected', {});
        players++;
        console.log("We have a new client: " + socket.id + "\nPlayers: " + players);
        console.log(socket.userId);
        socket.ready = false;
        var lobbypos = addPlayerToLobby(socket, 0, data.privacyPacket);
        socket.emit("lobbypos", {lobbypos});
        io.sockets.emit('playercount', {count: players});
        sendLobbyCount();
        //socket.emit('chat', {chatlog});


        //For invites, need to open socket upon accepting invite
        //(Or after choosing and confirming team) and then pass in the lobby number that was received in the invite
        socket.on('lobbyrequest',//pass in private boolean as data?
                function (data) {
                    console.log(`Lobby request received: ${socket.lobbypos}`);
                    removePlayerFromLobby(socket);
                    console.log(`Player removed from lobby: ${socket.lobbypos}`);
                    var newpos = addPlayerToLobby(socket, data.num, data.privacyPacket);
                    socket.emit("lobbypos", {lobbypos: newpos});
                    sendLobbyCount();
        });

        socket.on('ready', function (data) {
            console.log("ready: " + data.id);
            socket.ready = true;
            var i = socket.lobbyid;
            var pos = socket.lobbypos;
            var pos2 = other(pos);
            if (lobbies[i]["player" + pos2] && lobbies[i]["player" + pos2].ready) {
                lobbies[i]["player" + pos].emit('start', {});
                lobbies[i]["player" + pos2].emit('start', {});
            }
        });

        socket.on('enemychoseteam', function (data) {
            sendToOther(socket, 'enemychoseteam', data);
        });

        socket.on('dmg', function (data) {
                sendToOther(socket, 'dmg', data);
        });

        socket.on('shield', function (data) {
                console.log("Received shield");
                sendToOther(socket, 'shield', {});
        });

        socket.on('switch', function (data) {
            console.log(data.poke);
            sendToOther(socket, 'switch', data);
        });

        socket.on('disconnect', function (data) {
            players--;
            console.log(`Client has disconnected. Players: ${players}`);
            io.sockets.emit('playercount', {count: players});
            removePlayerFromLobby(socket);
            sendLobbyCount();
        });
    });
});