const express = require('express');
const app = express();
const cors = require('cors')
const axios = require('axios')
const leaderboardRoutes = require('./routes/leaderboard');
const Leaderboard = require('./models/Leaderboard')
const port = process.env.PORT || 3000;

const socket = require('socket.io');

app.use(cors())
app.use(express.json())
app.use('/leaderboard', leaderboardRoutes);

// connect routes to server.js
const server = app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`)
});


app.get('/', (req, res) => res.send("Welcome to the API"));

io = socket(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});



io.on('connection', (socket) => {



    socket.on('join_room', (data) => {
        socket.join(data);
        console.log('user is in room: ' + data)
        // cb(`Joined room: ${data}`)
    })

    socket.on('username', (data) => {
        console.log(socket.id)
        console.log('username is' + data)

    })

    socket.on('endgame', (data) => {
        async function get_r_leaderboard() {
            try {
                const room_leaderboard = await Leaderboard.getRoomLeaderboard(data[0])
                // io.in(data[0]).emit('receive_room_leaderboard', room_leaderboard)
                if (!data[1]) {
                    console.log("in IF statement")
                    let leaderboard_r = [];

                    room_leaderboard.map((s) => { leaderboard_r.push(s) })
                    console.log(leaderboard_r)
                    io.in(data[0]).emit('send_score', leaderboard_r)
                }

            } catch (error) {
                console.log(err)
            }
        }
        get_r_leaderboard()

    })

    socket.on('track_score', (data) => {
        console.log('your score is ' + data)
        async function updateScore() {
            try {
                await Leaderboard.update(data[0], socket.id);

            } catch (err) {
                console.log(err)
            }

        }
        updateScore();
    })

    socket.on('start_game', (data) => {
        console.log('data in start game ' + data)
        let result;
        socket.on('questionData', (q_data) => {
            async function apiCall() {
                try {

                    const trivia = await axios.get(`https://opentdb.com/api.php?amount=${q_data[0]}&category=${q_data[3]}&difficulty=${q_data[1]}&type=${q_data[2]}`);
                    result = (trivia.data.results)
                }
                catch (err) {
                    console.log(err)
                }
                io.in(data).emit('receive_q', result)
            }

            apiCall()
        })
    })
    socket.on('all_data', (data) => {
        console.log(data)
        async function createUser() {
            try {
                await Leaderboard.create(data, socket.id)

            } catch (err) {
                console.log(err)
            }
        }
        createUser();
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})
