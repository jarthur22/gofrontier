const express = require('express');
const mongoose = require('mongoose');
const _ = require('underscore');
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
    console.log(`Sockets in waiting:`);
    console.log(socketsInWaiting);
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

//add code here to remove socket from socketinwaiting after USER IS PLACED IN LOBBY
function addPlayerToLobby(player, id, privacyPacket) {
    console.log("Adding player to lobby. Private: " + privacyPacket.status);
    for (var i = id; i < 9999; i++) {
        if (!lobbies[i].player1) {
            lobbies[i].player1 = player; //add first player to lobby
            lobbies[i].player1.lobbyid = i;
            lobbies[i].player1.lobbypos = 1;
            if(privacyPacket.status){
                lobbies[i].private = privacyPacket.status;
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
        console.log(lobbies[i].player1.id);
        console.log(lobbies[i].player2);
        console.log(lobbies[i].private);
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
            //there is no player2, the lobby is private, and the player's packet shows private
            var player2Match = {};
            for(var x=0; x<socketsInWaiting.length; x++){
                console.log(socketsInWaiting[x]);
                if(socketsInWaiting[x].socket === player.id){
                    player2Match = socketsInWaiting[x]; //match socket in waiting to player
                    console.log("Player 2 match found:");
                    console.log(player2Match);
                }
            }
            if(player2Match !== {} && player2Match.opponent){
                var player1Match = {};
                for(var x=0; x<socketsInWaiting.length; x++){
                    if(socketsInWaiting[x].socket === lobbies[i].player1.id){
                        player1Match = socketsInWaiting[x]; //match socket in waiting to player1 in lobby
                        console.log("Player 1 match found:");
                        console.log(player1Match);
                    }
                } 
                if(player1Match !== {} && player1Match.opponent){ //everything is valid
                    //the opponent id matches the user id for both sockets in waiting
                    if(player1Match.opponent === player2Match.user && player1Match.user === player2Match.opponent){
                        //user pair found: good to enter private lobby
                        console.log("User Ids for accepted opponents: "+player1Match.user+"\n"+player2Match.user);
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
            /* if(player.userId === lobbies[i].awaiting1 || player.userId === lobbies[i].awaiting2){
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
            } */
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
    if(!lobbies[i].player1 && !lobbies[i].player2 && lobbies[i].private){
        lobbies[i].private = undefined;
    }
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

    /* socket.on('attachuser', function(data){ //might have to send socket with new field back to the user
        console.log(`Socket ID: ${data._id}`)
        socket.userId = data._id;
        //console.log(socket);
        socket.emit('attached', {});
    }); */

    //receive socket that player 2 has accepted request, send socket to player 1
    socket.on('challengeaccepted', function(data) {
        var socketList = io.sockets.server.eio.clients;
        if (socketList[data.socketId] === undefined){
            socket.emit('challengefailed', {});
        }else {
            io.to(`${data.socketId}`).emit('challengeaccepted', {});
        }
    });

    /* socket.on("migrateuser", function(data) {
        var socketList = io.sockets.connected;
        console.log(socketList);
        for(s in socketList){
            console.log("migrate");
            console.log(s.userId);
        }
    }); */

    //var chatlog = "";

    socket.on('battleconnection', function(data) { //this emit is sent from the battle page with localStorage data and new socket!!!!
        //connect new socket to user and opponent on old socket
        let socketToAdd;
        for(var i=0; i<socketsInWaiting.length; i++){
            if(socketsInWaiting[i].user === data.user){
                /* socketsInWaiting[i] = {
                    socket: socket.id,
                    user: data.user,
                    opponent: data.privacyPacket.awaiting1 === data.user ?  data.privacyPacket.awaiting2 :  data.privacyPacket.awaiting1
                } */
                socketToAdd = {socket: socket.id, user: data.user};
                socketsInWaiting[i] = socketToAdd;
                console.log("Match to user found: ");
                console.log(socketsInWaiting[i]);
            }
        }
        
        socket.emit('connected', {});
        players++;
        console.log("We have a new client: " + socket.id + "\nPlayers: " + players);
        //console.log(socket.userId);
        socket.ready = false;
        var lobbypos = addPlayerToLobby(socket, 0, data.privacyPacket);
        socket.emit("lobbypos", {lobbypos});
        io.sockets.emit('playercount', {count: players});
        sendLobbyCount();
        //socket.emit('chat', {chatlog});


        socket.on('lobbyrequest',
                function (data) {
                    console.log(`Lobby request received: ${socket.lobbypos}`);
                    removePlayerFromLobby(socket);
                    console.log(`Player removed from lobby: ${socket.lobbypos}`);
                    if(data.privacyPacket.status){
                        for(var i=0; i<socketsInWaiting.length; i++){
                            console.log(socket.id);
                            console.log(socketsInWaiting[i].socket);
                            if(socketsInWaiting[i].socket === socket.id){
                                console.log("Match found");
                                socketsInWaiting[i].opponent = data.privacyPacket.awaiting1 === socketsInWaiting[i].user ?  data.privacyPacket.awaiting2 :  data.privacyPacket.awaiting1;
                                console.log(socketsInWaiting[i]);
                            }
                        }
                    } 
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
            console.log(data.id);
            sendToOther(socket, 'switch', data);
        });

        //failsafe for when a desync happens
        socket.on('expecting0health', function (data) {
                //console.log("Received: " + data.move);
                sendToOther(socket, 'expecting0health', data);
            }
        );

        socket.on('disconnect', function (data) {
            players--;
            console.log(`Client has disconnected. Players: ${players}`);
            io.sockets.emit('playercount', {count: players});
            removePlayerFromLobby(socket);
            sendLobbyCount();
        }); 
    });

    //remove initial sockets from socketsinwaiting
    socket.on('disconnect', function(data){
        socketsInWaiting = _.reject(socketsInWaiting, s => {return s.socket === socket.id});
        console.log(socketsInWaiting);
    });
});