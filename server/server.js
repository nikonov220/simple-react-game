const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const debug = true
let messageCount = 0;
let connectedSockets = new Set();  // Store for active socket IDs
let users = {}
let rooms = {}
let PORT = 3000; // Change as per your server's port

if(process.env.MY_VAR == 1){
    debug = false
}
console.log("Debug: "+debug)
if(debug){
    PORT = 3001
}

const Questions = ['Если бы RandomPersonFromRoom собрался на необитаемый остров, что бы он взял с собой?', 
'Как бы RandomPersonFromRoom назвал собаку?', 
"Какое преступление на уме у RandomPersonFromRoom?", "Какие скелеты у RandomPersonFromRoom в шкафу?",
"Кто главный враг RandomPersonFromRoom ?",
"Если бы RandomPersonFromRoom летел в космос, какие 3 вещи он с собой бы взял?",
"Если бы RandomPersonFromRoom был моряком, как назывался бы корабль?",
"Если бы RandomPersonFromRoom сыграл в фильме, как он бы назывался?",
"Если бы RandomPersonFromRoom отправлял послание инопланетянам, там было бы написано «…?",
"Если бы RandomPersonFromRoom был писателем, его книга начиналась бы со слов «…?",
"Если бы RandomPersonFromRoom был актером цирка, то каким?",
"Если бы RandomPersonFromRoom был ученым, его открытием было бы … ?",
"Если бы RandomPersonFromRoom был генным инженером, он бы вывел новый вид живого организма «..»?",
"Если бы RandomPersonFromRoom стал музыкантом, как бы назывался его дебютный альбом?",
"Если бы RandomPersonFromRoom био-гено инженером, какие два вида животных он бы скрестил?",
"Если бы RandomPersonFromRoom был супергероем, какой супер-силой он бы обладал?",
"Если бы RandomPersonFromRoom посадили в тюрьму, то по какой статье?",
"Если бы RandomPersonFromRoom посадили в тюрьму, кто был бы его сокамерник?",
"Если бы RandomPersonFromRoom доверили придумать олимпийский символ, то что бы это было?",
"Если бы RandomPersonFromRoom был футболистом, какое имя было бы написано на футболке?", 
"Если бы RandomPersonFromRoom разработал криптовалюту, чем бы она обеспечивалась?"]



const io = new Server(server, {
  cors: {
    origin: "*",  // Allow your client's URL, change if different
    methods: ["GET", "POST"]
  }
});
function generateQuestionForRoom(roomId) {
    const room = rooms[roomId];
    if (room && Object.keys(room.members).length > 0) {
        const memberIds = Object.keys(room.members);
        const randomMemberId = memberIds[Math.floor(Math.random() * memberIds.length)];
        const member = room.members[randomMemberId];

        const questionTemplate = Questions[Math.floor(Math.random() * Questions.length)]; // Random question

        const personalizedQuestion = questionTemplate.replace('RandomPersonFromRoom', `${member.avatar}${member.nickname}`);

        return personalizedQuestion;
    } else {
        return null;
    }
}

function checkIfAllMembersVoted(room) {
    const members = room.members;
    const answers = room.questions[room.round].answers;
    const memberIds = Object.keys(members);
    let allVoted = true;
    let voteCounts = {};

    // Initialize a count for each member
    memberIds.forEach(id => voteCounts[id] = 0);

    // Count votes for each member
    Object.values(answers).forEach(answer => {
        answer.votes.forEach(voterId => {
            if (voteCounts.hasOwnProperty(voterId)) {
                voteCounts[voterId]++;
            }
        });
    });

    // Check vote counts
    memberIds.forEach(memberId => {
        if (voteCounts[memberId] === 0) {
            allVoted = false;  // If any member has not voted, set allVoted to false
            console.log(`Member ${memberId} (${members[memberId].nickname}) has not voted.`);
        }
        if (voteCounts[memberId] > 1) {
            console.log(`Error: Member ${memberId} (${members[memberId].nickname}) has voted more than once.`);
        }
    });

    if (allVoted) {
        console.log("All members have voted.");
    }

    return allVoted;  // Return true if all members voted exactly once, false otherwise
}

function findUserIdBySocketId(socketId) {
    for (const userId in users) {
        if (users[userId].socketId === socketId) {
            return userId;  // Return the userId whose socketId matches the given socketId
        }
    }
    console.log('Couldnt find this socket id')
    return null;  // Return null if no matching socketId is found
}

function findUserProfileBySocketId(socketId){
    if (!findUserIdBySocketId(socketId)){
        console.log('Couldnt find userid in users')
        return null;
    }
    return {nickname:users[findUserIdBySocketId(socketId)].nickname, avatar:users[findUserIdBySocketId(socketId)].avatar}
}

io.on('connection', (socket) => {

    connectedSockets.add(socket.id);
    console.log('==== Socket Connection ====')
    console.log(connectedSockets)

    socket.on('fromClient', (message) => {
        messageCount++;
        console.log(`${JSON.stringify(message)} from ${socket.id}`);
        socket.emit('fromServer', `You sent message number ${messageCount}`);
    });

    socket.on('connectionHandshake', (profileData) => {
        messageCount++;
        console.log(`Received handshake: ${JSON.stringify(profileData)}`);
        socket.emit('fromServer', 'Handshake has been made')
        if (!profileData['id']) {
            // User is playing first time?
            const newUuid = uuidv4();
            socket.emit('setID', newUuid);  // Emit back the new UUID to the client
            console.log(`Generated UUID for ${profileData['nickname']}: ${newUuid}`);
        } else {
            // Handshake success
            let userid = profileData['id']
            socket.emit('handshakeSuccess', userid);
            console.log(`Existing UUID for ID ${profileData['nickname']}: ${userid}`);

            if (userid in users){
                // User reconnected || need to update profile?
                users[userid].nickname = profileData.nickname
                users[userid].avatar = profileData.avatar
                console.log("User already known by userid, updating their info.")
                if (users[userid].roomID != 0) {
                        if(rooms[users[userid].roomID])
                        {
                            socket.join(users[userid].roomID)
                            if(rooms[users[userid].roomID].state == 'created'){
                                socket.emit('joinRoomSuccess', rooms[users[userid].roomID])
                            }
                        }
                    }            
            }
            else{
                users[userid] = {}
                console.log("Adding user to array and setting room to 0.")
                users[userid].roomID = 0
            }
            users[userid].socketId = socket.id
            users[userid].avatar = profileData['avatar']
            users[userid].nickname = profileData['nickname']
            users[userid].connectionActive = true

            console.log(`${users[userid].nickname} connected`);
            console.log(JSON.stringify(users))
        }
    });

    socket.on('disconnect', () => {
        let userid = findUserIdBySocketId(socket.id)
        console.log(socket.id)
        connectedSockets.delete(socket.id)
        if(userid){
        users[userid].connectionActive = false
        }
        console.log('==== Socket Disconnection ====')
        console.log(findUserProfileBySocketId(userid)+ ' diconnected');
        console.log(JSON.stringify(users))
    });

    socket.on('setViewState', (message) => {
        messageCount++;
        console.log(`${JSON.stringify(message)} from ${socket.id}`);
        socket.emit('setViewStateAnswer', `${message}`);
    });

    socket.on('hostRoom', (id) => {
        messageCount++;
        let userid = findUserIdBySocketId(socket.id)
        console.log("=== room host event ===");
        if(!users[userid]){
            console.log("User id not in database, no connection handshake has been made!")
            return;
        }
        console.log(`Request to host room ${JSON.stringify(id)} from ${users[userid].nickname}`);
        if (rooms[id] && rooms[id].state != 'ended')
        {
            console.log('Trying to create existing room')
            return;
        }
        users[userid].roomID = id
        rooms[id] = {host:userid, id:id, state:'created', members:{[userid]:{nickname:users[userid].nickname, avatar:users[userid].avatar}}}
        socket.join(id)
        socket.emit('joinRoomSuccess', rooms[id])
        console.log("ROOMS: "+ JSON.stringify(rooms))
        console.log("USERS: "+ JSON.stringify(users))
    });

    socket.on('joinRoom', (id) => {
        messageCount++;
        let userid = findUserIdBySocketId(socket.id)
        console.log("=== room join event ===");
        if(!users[userid]){
            console.log("User id not in database, no connection handshake has been made!")
            return;
        }
        console.log(`Request to join room ${id} by ${users[userid].nickname}`)
        if (rooms[id] == undefined)
        {
            console.log('Joining room that doesnt exist')
            socket.emit('setInfoBar', 'Такой комнаты не существует!')
            return;
        }
        if (userid in rooms[id].members)
        {
            console.log('Already in that room')
            io.to(id).emit('gameStateUpdate', rooms[id]);
            return;
        }
        users[userid].roomID = id
        rooms[id].members = {...rooms[id].members, [userid]:{nickname:users[userid].nickname, avatar:users[userid].avatar}}
        socket.join(id)
        socket.emit('joinRoomSuccess', rooms[id])
        console.log(findUserProfileBySocketId(socket.id))
        console.log("ROOMS: "+ JSON.stringify(rooms))
        console.log("USERS: "+ JSON.stringify(users))
    });

    socket.on('requestRoomInfoUpdate', () => {
        let userid = findUserIdBySocketId(socket.id)
        userRoomId = users[userid].roomID
        socket.emit('roomInfoUpdate', rooms[userRoomId])
    })

    socket.on('leaveRoom', () => {
        let userid = findUserIdBySocketId(socket.id)
        let roomid = users[userid].roomID
        console.log('=== room leave event ===')
        if (roomid != 0) {
            if (userid in rooms[roomid].members){
                users[userid].roomID = 0
                delete rooms[roomid].members[userid]
                socket.leave(roomid)
                socket.emit('roomInfoUpdate', 0)
                console.log(findUserProfileBySocketId(socket.id).nickname + " left room " + roomid)
                if (Object.keys(rooms[roomid].members).length === 0) {
                    delete rooms[roomid];
                    console.log(`Room ${roomid} was empty and has been deleted.`);
                }
                else {
                    rooms[roomid].host = Object.keys(rooms[roomid].members)[0]
                }
            }   
            console.log("ROOMS: "+ JSON.stringify(rooms))
            console.log("USERS: "+ JSON.stringify(users))
        }
    })

    socket.on('startGame', (data) => {
        userid = findUserIdBySocketId(socket.id)
        roomid = data.roomid
        if (!userid){
            console.log('No user in users or or bad room id')
            return;
        }
        if(roomid != users[userid].roomID)
        {
            console.log('Bad user id!')
            return;
        }
        roomid = data.roomid
        console.log(roomid in rooms)
        if (rooms[roomid] && Object.keys(rooms[roomid].members).length <= 1) {
            socket.emit('setInfoBar', 'You can\'t play alone!')
            // return
        }
        socket.emit('setInfoBar', 'The game will start shortly!')
        rooms[roomid].rounds = data.rounds
        rooms[roomid].state = 'start'
    })

    socket.on('submitQuestion', data =>
    {
        const round = data.gameState.roomInfo.round
        const userid = findUserIdBySocketId(socket.id)
        const roomid = data.gameState.roomInfo.id
        if(!rooms[roomid]){
            console.log('Submitted to nonexistent room')
            return;
        }
        
        rooms[roomid].questions[round.toString()].answers[userid] = {answer:data.answer, id:userid, votes:[]}
        io.to(roomid).emit('gameStateUpdate', rooms[roomid])
    })
    socket.on('submitAnswer', data =>
    {
        const round = data.gameState.roomInfo.round
        const userid = findUserIdBySocketId(socket.id)
        const roomid = data.gameState.roomInfo.id
        if(!rooms[roomid]){
            console.log('Submitted to nonexistent room')
            return;
        }
        console.log(userid in rooms[roomid].questions[round.toString()].answers[data.vote].votes)
        if (rooms[roomid].questions[round.toString()].answers[data.vote].votes)
        {
            rooms[roomid].questions[round.toString()].answers[data.vote].votes.push(userid)
        }
        else{
            console.log('No votes object')
        }
        io.to(roomid).emit('gameStateUpdate', rooms[roomid])
    })
});

setInterval(() => {
    const roomIds = Object.keys(rooms);
    if (roomIds.length > 0) {
        roomIds.forEach(roomId => {
            const room = rooms[roomId];
            // Check if the room is in the 'created' state and it is not empty
            if (room.state === 'created' && Object.keys(room.members).length > 0) {
                io.to(roomId).emit('roomInfoUpdate', room);
            }
            else if (room.state === 'start' && Object.keys(room.members).length > 0) {
                let question = generateQuestionForRoom(room.id)
                room.round = 1
                room.questions = {1:{question:question, answers:{}}}
                room.state = 'question'
                room.viewState = 'question'
                io.to(roomId).emit('gameStateUpdate', room);
            }
            else if (room.state === 'question' && Object.keys(room.members).length > 0) {
                if(Object.keys(room.questions[room.round].answers).length == Object.keys(room.members).length){
                    room.viewState = 'vote'
                    room.state = 'vote'
                }
                io.to(roomId).emit('gameStateUpdate', room);
            }
            else if (room.state === 'vote' && Object.keys(room.members).length > 0) {
                if(checkIfAllMembersVoted(room))
                {
                    if (room.round == room.rounds){
                        room.state = 'result'
                        room.viewState = 'result'
                        room.finalMembers = Object.keys(room.members).reduce((acc, key) => {
                            acc[key] = { ...room.members[key] };
                            return acc;
                          }, {});
                        io.to(roomId).emit('gameStateUpdate', room);
                    }
                    else{
                        room.round = room.round+1
                        room.state = 'question'
                        room.viewState = 'question'
                        let question = generateQuestionForRoom(room.id)
                        room.questions[room.round] = {question:question, answers:{}}
                        io.to(roomId).emit('gameStateUpdate', room);
                    }
                }
            }
            else if (room.state === 'result' && Object.keys(room.members).length > 0){
                const roomForEmission = {
                    ...room,
                    members: room.finalMembers
                  };
                
                  io.to(roomId).emit('gameStateUpdate', roomForEmission);
            }
            console.log('Processed room ' + room.id + ", status: " + room.state)
        });
    } else {
        console.log("No rooms to process.");
    }
}, 5000);

if (!debug)
{
    app.use(express.static(path.join(__dirname, '..', 'build')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
    });
}


server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
