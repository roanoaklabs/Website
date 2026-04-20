// assets/js/firebase.js
// Firebase setup and database operations for Number Chain

import { FIREBASE_CONFIG, ROOM_CODE_ADJECTIVES, ROOM_CODE_NOUNS } from './config.js';

let firebaseApp = null;
let database = null;
let auth = null;
let authReady = false;

export async function initFirebase() {
  if (firebaseApp) {
    return { app: firebaseApp, database, auth };
  }
  
  try {
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
      } catch (authError) {
        console.error('Firebase auth error:', authError);
      }
    }
    
    return { app: firebaseApp, database, auth };
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
  }
}

export function generateRoomCode() {
  const adj = ROOM_CODE_ADJECTIVES[Math.floor(Math.random() * ROOM_CODE_ADJECTIVES.length)];
  const noun = ROOM_CODE_NOUNS[Math.floor(Math.random() * ROOM_CODE_NOUNS.length)];
  return `${adj}-${noun}`;
}

export function generatePlayerId() {
  return 'player_' + Math.random().toString(36).substr(2, 9);
}

export async function createRoom(roomCode, playerId, grid) {
  try {
    const { ref, set } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    await initFirebase();
    
    const gridData = {};
    for (let i = 0; i < grid.length; i++) {
      gridData[i] = {
        player: grid[i].player,
        value: grid[i].value
      };
    }
    
    const roomData = {
      player1: playerId,
      player2: null,
      grid: gridData,
      currentPlayer: 1,
      gameStarted: false,
      gameOver: false,
      winner: null,
      p1Max: 3,
      p2Max: 3
    };
    
    await set(ref(database, 'numberchain/' + roomCode), roomData);
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

export async function joinRoom(roomCode, playerId) {
  const { ref, get, update } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  const roomRef = ref(database, 'numberchain/' + roomCode);
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
    gameStarted: true
  });
  
  return roomData;
}

export async function listenToRoom(roomCode, callback) {
  const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  const roomRef = ref(database, 'numberchain/' + roomCode);
  return onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      if (data.grid) {
        const gridArray = [];
        const gridSize = 36;
        for (let i = 0; i < gridSize; i++) {
          if (data.grid[i]) {
            gridArray[i] = data.grid[i];
          } else {
            gridArray[i] = { player: 0, value: 0 };
          }
        }
        data.grid = gridArray;
      }
      
      callback(data);
    } else {
      callback(null);
    }
  });
}

export async function updateGameState(roomCode, updateData) {
  const { ref, update } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  if (updateData.grid && Array.isArray(updateData.grid)) {
    const gridObject = {};
    updateData.grid.forEach((cell, index) => {
      gridObject[index] = cell;
    });
    updateData.grid = gridObject;
  }
  
  const roomRef = ref(database, 'numberchain/' + roomCode);
  await update(roomRef, updateData);
}

export async function getRoomData(roomCode) {
  const { ref, get } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  const roomRef = ref(database, 'numberchain/' + roomCode);
  const snapshot = await get(roomRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    if (data.grid) {
      data.grid = Object.values(data.grid);
    }
    return data;
  }
  return null;
}

export async function deleteRoom(roomCode) {
  const { ref, remove } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  await remove(ref(database, 'numberchain/' + roomCode));
}

export async function sendChatMessage(roomCode, playerNumber, text) {
  const { ref, push } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  const chatRef = ref(database, 'numberchain/' + roomCode + '/chat');
  await push(chatRef, {
    player: playerNumber,
    text: text,
    time: Date.now()
  });
}

export async function listenToChat(roomCode, callback) {
  const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  const chatRef = ref(database, 'numberchain/' + roomCode + '/chat');
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
