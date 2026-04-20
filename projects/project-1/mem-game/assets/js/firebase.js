// assets/js/firebase.js
// Firebase setup and database operations

import { FIREBASE_CONFIG, ROOM_CODE_ADJECTIVES, ROOM_CODE_NOUNS } from './config.js';

let firebaseApp = null;
let database = null;
let auth = null;
let authReady = false;

export async function initFirebase() {
    if (firebaseApp) {
        return { app: firebaseApp, database, auth };
    }

    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js');
    const { getDatabase } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    const { getAuth, signInAnonymously } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js');

    firebaseApp = initializeApp(FIREBASE_CONFIG);
    database = getDatabase(firebaseApp);
    auth = getAuth(firebaseApp);

    if (!authReady) {
        try {
            await signInAnonymously(auth);
            authReady = true;
            console.log('Memory Game - Firebase auth successful');
        } catch (error) {
            console.error('Memory Game - Firebase auth error:', error);
        }
    }

    return { app: firebaseApp, database, auth };
}

export function generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
}

export function generateRoomCode() {
    const adj = ROOM_CODE_ADJECTIVES[Math.floor(Math.random() * ROOM_CODE_ADJECTIVES.length)];
    const noun = ROOM_CODE_NOUNS[Math.floor(Math.random() * ROOM_CODE_NOUNS.length)];
    return `${adj}-${noun}`;
}

export async function createRoom(roomCode, playerId, roomData) {
    const { ref, set } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    await initFirebase();

    const fullRoomData = {
        player1: playerId,
        player2: null,
        ...roomData,
        gameStarted: false
    };

    await set(ref(database, 'memory-game/' + roomCode), fullRoomData);
    return { roomCode, playerId, playerNumber: 1 };
}

export async function joinRoom(roomCode, playerId) {
    const { ref, get, update } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    await initFirebase();

    const roomRef = ref(database, 'memory-game/' + roomCode);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
        throw new Error('Room not found');
    }

    const roomData = snapshot.val();
    if (roomData.player2) {
        throw new Error('Room is full');
    }

    await update(roomRef, {
        player2: playerId,
        gameStarted: true,
        currentPlayer: Math.random() < 0.5 ? 'player1' : 'player2'
    });

    return { roomCode, playerId, playerNumber: 2, roomData };
}

export async function updateRoom(roomCode, updateData) {
    const { ref, update } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    await initFirebase();

    const roomRef = ref(database, 'memory-game/' + roomCode);
    await update(roomRef, updateData);
}

export async function deleteRoom(roomCode) {
    const { ref, remove } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    await initFirebase();

    await remove(ref(database, 'memory-game/' + roomCode));
}

export async function getRoomData(roomCode) {
    const { ref, get } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    await initFirebase();

    const roomRef = ref(database, 'memory-game/' + roomCode);
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
        return snapshot.val();
    }
    return null;
}

export function getDatabase() {
    return database;
}

export async function listenToRoom(roomCode, callback) {
    const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    await initFirebase();

    const roomRef = ref(database, 'memory-game/' + roomCode);
    return onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        } else {
            callback(null);
        }
    });
}

export async function sendChatMessage(roomCode, playerNumber, text) {
    const { ref, push } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    await initFirebase();

    const chatRef = ref(database, 'memory-game/' + roomCode + '/chat');
    await push(chatRef, {
        player: playerNumber,
        text: text,
        time: Date.now()
    });
}

export async function listenToChat(roomCode, callback) {
    const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    await initFirebase();

    const chatRef = ref(database, 'memory-game/' + roomCode + '/chat');
    return onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const messages = Object.values(data).sort((a, b) => a.time - b.time);
            callback(messages);
        } else {
            callback([]);
        }
    });
}
