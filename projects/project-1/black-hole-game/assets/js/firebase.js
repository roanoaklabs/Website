// assets/js/firebase.js
// Firebase setup and database operations

import { FIREBASE_CONFIG, ROOM_CODE_ADJECTIVES, ROOM_CODE_NOUNS } from './config.js';

let firebaseApp = null;
let database = null;
let auth = null;
let authReady = false;

// Initialize Firebase
export async function initFirebase() {
  if (firebaseApp) {
    console.log('Firebase already initialized');
    return { app: firebaseApp, database, auth };
  }
  
  console.log('Initializing Firebase...');
  
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js');
    const { getDatabase } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    const { getAuth, signInAnonymously } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js');
    
    console.log('Firebase SDKs loaded');
    
    firebaseApp = initializeApp(FIREBASE_CONFIG);
    console.log('Firebase app created');
    
    database = getDatabase(firebaseApp);
    console.log('Firebase database connected');
    
    auth = getAuth(firebaseApp);
    console.log('Firebase auth obtained');

    // Sign in anonymously - happens silently in the background
    if (!authReady) {
      try {
        await signInAnonymously(auth);
        authReady = true;
        console.log('Firebase auth successful');
      } catch (authError) {
        console.error('Firebase auth error:', authError);
        // Don't throw - allow game to continue even if auth fails
        console.log('Continuing without auth...');
      }
    }
    
    console.log('Firebase fully initialized');
    return { app: firebaseApp, database, auth };
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
  }
}

// Generate a unique room code
export function generateRoomCode() {
  const adj = ROOM_CODE_ADJECTIVES[Math.floor(Math.random() * ROOM_CODE_ADJECTIVES.length)];
  const noun = ROOM_CODE_NOUNS[Math.floor(Math.random() * ROOM_CODE_NOUNS.length)];
  return `${adj}-${noun}`;
}

// Generate a unique player ID
export function generatePlayerId() {
  return 'player_' + Math.random().toString(36).substr(2, 9);
}

// Create a new game room
export async function createRoom(roomCode, playerId, circles) {
  console.log('createRoom called with:', { roomCode, playerId });
  
  try {
    const { ref, set } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    await initFirebase();
    
    console.log('Creating room with circles:', circles);
    
    // Convert circles array to plain object for Firebase
    const circlesData = {};
    for (let i = 0; i < circles.length; i++) {
      circlesData[i] = {
        player: circles[i].player,
        value: circles[i].value
      };
    }
    
    console.log('Circles data for Firebase:', circlesData);
    
    const roomData = {
      player1: playerId,
      player2: null,
      circles: circlesData,
      currentPlayer: 1,
      gameStarted: false,
      gameOver: false,
      scores: { 1: 0, 2: 0 },
      winner: null
    };
    
    console.log('Room data to save:', roomData);
    
    await set(ref(database, 'blackhole/' + roomCode), roomData);
    
    console.log('Room created successfully');
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

// Join an existing room
export async function joinRoom(roomCode, playerId) {
  const { ref, get, update } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  const roomRef = ref(database, 'blackhole/' + roomCode);
  const snapshot = await get(roomRef);
  
  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }
  
  const roomData = snapshot.val();
  console.log('Join room - raw data:', roomData);
  
  if (roomData.player2) {
    throw new Error('Room is full');
  }
  
  await update(roomRef, {
    player2: playerId,
    gameStarted: true
  });
  
  // Convert circles object back to array
  if (roomData.circles) {
    console.log('Join room - circles before conversion:', roomData.circles);
    
    if (!Array.isArray(roomData.circles)) {
      const circlesArray = [];
      for (let i = 0; i < 21; i++) {
        if (roomData.circles[i]) {
          circlesArray[i] = roomData.circles[i];
        } else {
          circlesArray[i] = { player: null, value: null };
        }
      }
      roomData.circles = circlesArray;
    }
    
    console.log('Join room - circles after conversion:', roomData.circles);
  }
  
  return roomData;
}

// Listen to room changes
export async function listenToRoom(roomCode, callback) {
  const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  const roomRef = ref(database, 'blackhole/' + roomCode);
  return onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('Raw Firebase data:', data);
      
      // Convert circles object back to array
      if (data.circles) {
        console.log('Circles before conversion:', data.circles);
        console.log('Type of circles:', typeof data.circles);
        
        if (Array.isArray(data.circles)) {
          // Already an array
          console.log('Circles is already array');
        } else {
          // Convert object to array
          const circlesArray = [];
          for (let i = 0; i < 21; i++) {
            if (data.circles[i]) {
              circlesArray[i] = data.circles[i];
            } else {
              circlesArray[i] = { player: 0, value: 0 };  // Use 0 instead of null
            }
          }
          data.circles = circlesArray;
          console.log('Converted circles to array:', data.circles);
        }
      } else {
        console.log('No circles in data');
      }
      
      callback(data);
    } else {
      callback(null);
    }
  });
}

// Update game state
export async function updateGameState(roomCode, updateData) {
  const { ref, update } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  // Convert circles array to object if present
  if (updateData.circles && Array.isArray(updateData.circles)) {
    const circlesObject = {};
    updateData.circles.forEach((circle, index) => {
      circlesObject[index] = circle;
    });
    updateData.circles = circlesObject;
  }
  
  const roomRef = ref(database, 'blackhole/' + roomCode);
  await update(roomRef, updateData);
}

// Get current room data
export async function getRoomData(roomCode) {
  const { ref, get } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  const roomRef = ref(database, 'blackhole/' + roomCode);
  const snapshot = await get(roomRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    // Convert circles object back to array
    if (data.circles) {
      data.circles = Object.values(data.circles);
    }
    return data;
  }
  return null;
}

// Delete room
export async function deleteRoom(roomCode) {
  const { ref, remove } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  await remove(ref(database, 'blackhole/' + roomCode));
}

// Send chat message
export async function sendChatMessage(roomCode, playerNumber, text) {
  const { ref, push } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  const chatRef = ref(database, 'blackhole/' + roomCode + '/chat');
  await push(chatRef, {
    player: playerNumber,
    text: text,
    time: Date.now()
  });
}

// Listen to chat messages
export async function listenToChat(roomCode, callback) {
  const { ref, onValue } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
  await initFirebase();
  
  const chatRef = ref(database, 'blackhole/' + roomCode + '/chat');
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