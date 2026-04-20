// assets/js/online.js
// Online multiplayer logic

import * as firebase from './firebase.js';
import * as game from './game.js';
import * as ui from './ui.js';

// Online game state
let roomCode = null;
let playerId = null;
let playerNumber = null;
let roomListener = null;
let chatListener = null;
let unreadCount = 0;

// Get online game state
export function getOnlineState() {
  return {
    roomCode,
    playerId,
    playerNumber,
    isOnline: roomCode !== null
  };
}

// Create a new online game room
export async function createOnlineRoom() {
  try {
    playerId = firebase.generatePlayerId();
    roomCode = firebase.generateRoomCode();
    playerNumber = 1;
    
    console.log('Creating online room...');
    const circles = game.initializeCircles();
    console.log('Initialized circles:', circles);
    
    await firebase.createRoom(roomCode, playerId, circles);
    console.log('Room created in Firebase');
    
    ui.hideRoomModal();
    ui.showWaitingModal(roomCode);
    
    return { roomCode, playerId, playerNumber };
  } catch (error) {
    console.error('Error creating room:', error);
    alert('Failed to create room. Please try again.');
    throw error;
  }
}

// Join an existing online game room
export async function joinOnlineRoom(code) {
  try {
    const upperCode = code.toUpperCase().trim();
    if (!upperCode) {
      alert('Please enter a room code');
      return null;
    }
    
    playerId = firebase.generatePlayerId();
    const roomData = await firebase.joinRoom(upperCode, playerId);
    
    roomCode = upperCode;
    playerNumber = 2;
    
    ui.hideRoomModal();
    ui.hideJoinInput();
    
    return { roomCode, playerId, playerNumber, roomData };
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

// Start listening to room changes
export async function startRoomListener(onUpdate, onGameStart) {
  if (!roomCode) return;
  
  let gameStartedNotified = false;
  
  roomListener = await firebase.listenToRoom(roomCode, (data) => {
    if (!data) {
      alert('The game room has been closed.');
      cleanupOnlineGame();
      onUpdate(null);
      return;
    }
    
    // If player 1, trigger game start when player 2 joins
    if (playerNumber === 1 && data.player2 && data.gameStarted && !gameStartedNotified) {
      gameStartedNotified = true;
      ui.hideWaitingModal();
      if (onGameStart) {
        onGameStart(data);
      }
      // After game starts, continue with normal updates
      setTimeout(() => onUpdate(data), 100);
      return;
    }
    
    // Normal updates
    if (data.gameStarted) {
      onUpdate(data);
    }
  });
}

// Start listening to chat messages
export async function startChatListener(onMessageReceived) {
  if (!roomCode) return;
  
  chatListener = await firebase.listenToChat(roomCode, (messages) => {
    onMessageReceived(messages);
    
    // Update unread count
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const chatWindow = document.getElementById('chatWindow');
      const isWindowHidden = chatWindow.style.display === 'none' || !chatWindow.style.display;
      
      if (lastMsg.player !== playerNumber && isWindowHidden) {
        unreadCount++;
        ui.updateChatBadge(unreadCount);
      }
    }
  });
}

// Handle player's move in online game
export async function handleOnlineMove(index, circles, currentPlayer, gameOver) {
  console.log('handleOnlineMove called with:', { index, currentPlayer, playerNumber, gameOver });
  
  if (gameOver) {
    console.log('Game is over, cannot move');
    return null;
  }
  
  if (circles[index].value !== 0) {
    console.log('Circle already has a value:', circles[index].value);
    return null;
  }
  
  if (currentPlayer !== playerNumber) {
    console.log('Not your turn. Current player:', currentPlayer, 'Your number:', playerNumber);
    return null;
  }
  
  try {
    console.log('Fetching room data...');
    const roomData = await firebase.getRoomData(roomCode);
    if (!roomData) {
      console.log('Room data not found');
      return null;
    }
    
    console.log('Room data fetched successfully');
    const nextNumber = game.getNextNumber(roomData.circles, playerNumber);
    console.log('Next number to place:', nextNumber);
    
    const newCircles = game.placeNumber(roomData.circles, index, playerNumber, nextNumber);
    console.log('New circles created');
    
    const updateData = {
      circles: newCircles,
      currentPlayer: playerNumber === 1 ? 2 : 1
    };
    
    // Check if game is over
    if (game.isGameOver(newCircles)) {
      console.log('Game is over!');
      const results = game.calculateFinalResults(newCircles);
      updateData.gameOver = true;
      updateData.scores = results.scores;
      updateData.winner = results.winner;
    }
    
    console.log('Updating Firebase with:', updateData);
    await firebase.updateGameState(roomCode, updateData);
    console.log('Firebase updated successfully');
    
    return updateData;
  } catch (error) {
    console.error('Error making move:', error);
    return null;
  }
}

// Send a chat message
export async function sendChatMessage(text) {
  if (!roomCode || !text.trim()) return;
  
  try {
    await firebase.sendChatMessage(roomCode, playerNumber, text.trim());
    ui.clearChatInput();
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Reset unread count when chat is opened
export function resetUnreadCount() {
  unreadCount = 0;
  ui.updateChatBadge(0);
}

// Cancel/leave the online game
export async function cancelOnlineGame() {
  if (roomCode) {
    try {
      await firebase.deleteRoom(roomCode);
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  }
  
  cleanupOnlineGame();
}

// Cleanup online game state
function cleanupOnlineGame() {
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
  playerNumber = null;
  unreadCount = 0;
  
  ui.hideWaitingModal();
  ui.hideElement('chatToggle');
  ui.hideElement('chatWindow');
}

// Export cleanup for external use
export function cleanup() {
  cleanupOnlineGame();
}