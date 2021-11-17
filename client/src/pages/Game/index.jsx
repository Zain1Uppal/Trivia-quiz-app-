import React, { useState, useEffect } from 'react';
import { Header } from '../../components';
import { RoomLeaderboard } from '../../components/index';
import { GeneralLeaderboard } from '../../components/index';
import io from 'socket.io-client';
import './style.css';
import { MCAnswer } from '../../components';

export function Game({ socket, userName, roomNum, roomCreated, questionNum, difficulty, type, category }) {
    let room = roomNum;
    //const [count, setCount] = useState(0);
    const [score, setScore] = useState(0);
    const [questionList, setQuestionsList] = useState([]);
    const [endGame, setEndgame] = useState(false);
    const [startGame, setStart] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const userData = [score, userName]
        socket.emit('track_score', userData)
    }, [score])

    const hideButton = (buttonId) => {
        let button = document.getElementById(buttonId);
        button.style.display = 'none';
    }

    const showButton = (buttonId) => {
        let button = document.getElementById(buttonId);
        button.style.display = 'block';
    }

    useEffect(() => {
        console.log('in useEffect')
        socket.on('receive_q', (data) => {
            setQuestionsList(data)
            hideButton('startButton');
            showButton('endButton');
        })
    }, [startGame])

    useEffect(() => {
        let leaderboard_room = []
        socket.on('send_score', (data) => {
            data.map((r) => { leaderboard_room.push(r) })
            setLeaderboard(leaderboard_room)
            console.log(leaderboard_room)
            hideButton('endButton');
            hideButton('scoreItem');
            setQuestionsList([])
        })

    }, [endGame])

    function handleClick() {
        setScore((prevCount) => prevCount + 1)
    }

    function handleEnd() {
        setEndgame((prevEnd) => !prevEnd)
        const data = [room, endGame]
        socket.emit('endgame', data)
        setQuestionsList([]);
    }

    function handleStart() {
        let data = [questionNum, difficulty, type, category]
        socket.emit('start_game', room)
        socket.emit('questionData', data)
        setStart((prevEnd) => !prevEnd)
        console.log(questionList)
    }


    const getUserScores = () => {
        const scores = leaderboard.map((u, i) =>
            <li key={i}>
                <span>{u.username}</span>
                <span>{u.score}</span>
            </li>
        )
        return scores;
    }

    console.log(roomCreated)


    return (
        <div>
            {roomCreated &&
                <>
                    <button id='startButton' onClick={handleStart}>Start Game</button>
                </>
            }
            <button id='endButton' onClick={handleEnd}>End Game</button>
            <button id='scoreItem' onClick={handleClick}>{score}</button>
            <MCAnswer data={questionList} />
            <ul>
                {getUserScores()}
            </ul>
            { endGame && <GeneralLeaderboard /> }
        </div >
    )
}
