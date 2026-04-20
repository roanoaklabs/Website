// assets/js/online.js
// Online multiplayer logic for Number Chain

import * as firebase from './firebase.js';
import * as game from './game.js';
import * as ui from './ui.js';

let roomCode = null;
let playerId = null;
let playerNumber = null;
let roomListener = null;
let chatListener = null;
let unreadCount = 0;

export function getOnlineState() {
  return {
    roomCode,
    playerId,
    playerNumber,
    isOnline: roomCode !== null
  };
}

export async function createOnlineRoom() {
  try {
    playerId = firebase.generatePlayerId();
    roomCode = firebase.generateRoomCode();
    playerNumber = 1;
    
    const grid = game.initializeGrid();
    const initialGrid = game.setupInitialPositions(grid);
    
    await firebase.createRoom(roomCode, playerId, initialGrid);
    
    ui.hideRoomModal();
    ui.showWaitingModal(roomCode);
    
    return { roomCode, playerId, playerNumber };
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
    
    if (playerNumber === 1 && data.player2 && data.gameStarted && !gameStartedNotified) {
      gameStartedNotified = true;
      ui.hideWaitingModal();
      if (onGameStart) {
        onGameStart(data);
      }
      setTimeout(() => onUpdate(data), 100);
      return;
    }
    
    if (data.gameStarted) {
      onUpdate(data);
    }
  });
}

export async function startChatListener(onMessageReceived) {
  if (!roomCode) return;
  
  chatListener = await firebase.listenToChat(roomCode, (messages) => {
    onMessageReceived(messages);
    
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

export async function handleOnlineMove(fromIndex, toIndex, grid, currentPlayer, gameOver) {
  if (gameOver) {
    return null;
  }
  
  if (currentPlayer !== playerNumber) {
    return null;
  }
  
  const toCell = grid[toIndex];
  if (toCell.value !== 0) {
    return null;
  }
  
  const fromCell = grid[fromIndex];
  if (!fromCell || fromCell.player !== playerNumber || fromCell.value === 0) {
    return null;
  }
  
  const extensions = game.getExtensionCells(grid, fromIndex, playerNumber);
  if (!extensions.includes(toIndex)) {
    return null;
  }
  
  try {
    const roomData = await firebase.getRoomData(roomCode);
    if (!roomData) {
      return null;
    }
    
    const newGrid = game.placeNumberFrom(roomData.grid, fromIndex, toIndex, playerNumber);
    const placedValue = newGrid[toIndex].value;
    
    let p1Max = roomData.p1Max || 3;
    let p2Max = roomData.p2Max || 3;
    if (playerNumber === 1) {
      p1Max = Math.max(p1Max, placedValue);
    } else {
      p2Max = Math.max(p2Max, placedValue);
    }
    
    const updateData = {
      grid: newGrid,
      currentPlayer: playerNumber === 1 ? 2 : 1,
      p1Max: p1Max,
      p2Max: p2Max
    };
    
    if (game.isGameOver(newGrid)) {
      const results = game.calculateFinalResults(newGrid);
      updateData.gameOver = true;
      updateData.winner = results.winner;
    }
    
    await firebase.updateGameState(roomCode, updateData);
    
    return updateData;
  } catch (error) {
    console.error('Error making move:', error);
    return null;
  }
}

export async function sendChatMessage(text) {
  if (!roomCode || !text.trim()) return;
  
  try {
    await firebase.sendChatMessage(roomCode, playerNumber, text.trim());
    ui.clearChatInput();
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

export function resetUnreadCount() {
  unreadCount = 0;
  ui.updateChatBadge(0);
}

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

export function cleanup() {
  cleanupOnlineGame();
}
