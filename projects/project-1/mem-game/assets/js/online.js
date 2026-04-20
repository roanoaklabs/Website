// assets/js/online.js
// Online multiplayer functionality for Memory Game

import * as firebase from './firebase.js';
import * as ui from './ui.js';

let roomCode = null;
let playerId = null;
let playerRole = null;
let roomListener = null;
let chatListener = null;
let lastProcessedMove = null;
let unreadCount = 0;

export function getOnlineState() {
    return {
        roomCode,
        playerId,
        playerRole,
        isOnline: roomCode !== null
    };
}

export async function createOnlineRoom(gridSize, theme, cards) {
    try {
        playerId = firebase.generatePlayerId();
        roomCode = firebase.generateRoomCode();
        playerRole = 'player1';

        const roomData = {
            gridSize,
            theme,
            cards,
            currentPlayer: 'player1',
            player1Score: 0,
            player2Score: 0,
            matchedCards: [],
            lastMove: null
        };

        await firebase.createRoom(roomCode, playerId, roomData);

        ui.hideModal('roomModal');
        ui.setRoomCodeDisplay(roomCode);
        ui.showModal('waitingModal');

        return { roomCode, playerId, playerRole };
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Failed to create room. Please try again.');
        throw error;
    }
}

export async function joinOnlineRoom(code) {
    try {
        const upperCode = code.toUpperCase().trim();
        if (!upperCode) {
            alert('Please enter a room code');
            return null;
        }

        playerId = firebase.generatePlayerId();
        const result = await firebase.joinRoom(upperCode, playerId);

        roomCode = upperCode;
        playerRole = 'player2';

        ui.hideModal('roomModal');
        ui.hideElement('joinInput');

        return result;
    } catch (error) {
        if (error.message === 'Room not found') {
            alert('Room not found! Check the code and try again.');
        } else if (error.message === 'Room is full') {
            alert('This room is already full!');
        } else {
            console.error('Error joining room:', error);
            alert('Failed to join room. Please try again.');
        }
        return null;
    }
}

export async function startRoomListener(onGameStart, onGameUpdate) {
    if (!roomCode) return;

    roomListener = await firebase.listenToRoom(roomCode, (roomData) => {
        if (!roomData) {
            alert('The game room has been closed.');
            leaveRoom();
            return;
        }

        if (playerRole === 'player1' && roomData.player2 && roomData.gameStarted) {
            ui.hideModal('waitingModal');
            if (onGameStart) {
                onGameStart(roomData);
            }
        }

        if (roomData.gameStarted) {
            if (onGameUpdate) {
                onGameUpdate(roomData);
            }
        }
    });
}

export async function startChatListener(onMessageReceived) {
    if (!roomCode) return;

    chatListener = await firebase.listenToChat(roomCode, (messages) => {
        if (onMessageReceived) {
            onMessageReceived(messages, playerRole);
        }

        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            const chatWindow = document.getElementById('chat-window');
            const isWindowHidden = chatWindow?.classList.contains('hidden');

            if (lastMsg.player !== playerRole && isWindowHidden) {
                unreadCount++;
                updateChatBadge(unreadCount);
            }
        }
    });
}

export async function sendChatMessage(text) {
    if (!roomCode || !text.trim()) return;

    try {
        await firebase.sendChatMessage(roomCode, playerRole, text.trim());
        ui.clearChatInput();
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

export async function makeMove(card1Index, card2Index, isMatch, currentScore) {
    if (!roomCode) return;

    const lastMoveObj = {
        player: playerId,
        cards: [card1Index, card2Index],
        matched: isMatch,
        time: Date.now()
    };

    if (isMatch) {
        await firebase.updateRoom(roomCode, {
            [playerRole === 'player1' ? 'player1Score' : 'player2Score']: currentScore + 1,
            lastMove: lastMoveObj,
            currentPlayer: playerRole
        });

        setTimeout(async () => {
            const roomData = await firebase.getRoomData(roomCode);
            const matchedCards = (roomData?.matchedCards || []).slice();
            matchedCards.push(card1Index, card2Index);
            await firebase.updateRoom(roomCode, { matchedCards });
        }, 700);
    } else {
        await firebase.updateRoom(roomCode, {
            currentPlayer: playerRole === 'player1' ? 'player2' : 'player1',
            lastMove: lastMoveObj
        });
    }
}

export function resetUnreadCount() {
    unreadCount = 0;
    updateChatBadge(0);
}

function updateChatBadge(count) {
    const badge = document.getElementById('chat-badge');
    const toggle = document.getElementById('chat-toggle');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
    if (toggle && count > 0) {
        toggle.classList.add('notify');
    }
}

export async function leaveRoom() {
    if (roomCode) {
        try {
            await firebase.deleteRoom(roomCode);
        } catch (error) {
            console.error('Error deleting room:', error);
        }
    }

    cleanup();
    ui.hideModal('waitingModal');
    ui.hideModal('roomModal');
    ui.hideChatToggle();
    ui.hideChatWindow();
}

export function cleanup() {
    if (roomListener) {
        roomListener();
        roomListener = null;
    }

    if (chatListener) {
        chatListener();
        chatListener = null;
    }

    roomCode = null;
    playerId = null;
    playerRole = null;
    lastProcessedMove = null;
    unreadCount = 0;
}

export function getLastProcessedMove() {
    return lastProcessedMove;
}

export function setLastProcessedMove(move) {
    lastProcessedMove = move;
}
