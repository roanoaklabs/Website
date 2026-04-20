// assets/js/main.js
// Main game controller - ties everything together

import * as game from './game.js';
import * as ui from './ui.js';
import * as online from './online.js';
import * as computer from './computer.js'; // Import computer opponent logic

// Game state
let gameMode = null; // 'local' or 'online'
let circles = [];
let currentPlayer = 1;
let gameOver = false;
let scores = { 1: 0, 2: 0 };
let winner = null;
let player1NextNumber = 1; 
let player2NextNumber = 1;

// Initialize the application
function init() {
  setupMenuListeners();
  setupGameListeners();
  setupModalListeners();
  setupChatListeners();
  ui.showMenu();
}

// Setup menu button listeners
function setupMenuListeners() {
  document.getElementById('localBtn').addEventListener('click', startLocalGame);
  document.getElementById('computerEasyBtn').addEventListener('click', startComputerEasyGame);
  document.getElementById('onlineBtn').addEventListener('click', startOnlineGame);
}

// Setup game screen listeners
function setupGameListeners() {
  document.getElementById('backBtn').addEventListener('click', backToMenu);
  document.getElementById('playAgainBtn').addEventListener('click', handlePlayAgain);
}

// Setup modal listeners
function setupModalListeners() {
  document.getElementById('createRoomBtn').addEventListener('click', handleCreateRoom);
  document.getElementById('joinRoomBtn').addEventListener('click', () => ui.showJoinInput());
  document.getElementById('submitJoinBtn').addEventListener('click', handleJoinRoom);
  document.getElementById('cancelJoinBtn').addEventListener('click', () => ui.hideJoinInput());
  document.getElementById('closeRoomModal').addEventListener('click', () => {
    ui.hideRoomModal();
  });
  document.getElementById('copyCodeBtn').addEventListener('click', handleCopyCode);
  document.getElementById('cancelWaitingBtn').addEventListener('click', handleCancelWaiting);
  
  // Allow Enter key to join room
  document.getElementById('roomCodeInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
  });
}

// Setup chat listeners
function setupChatListeners() {
  document.getElementById('chatToggle').addEventListener('click', handleToggleChat);
  document.getElementById('closeChatBtn').addEventListener('click', () => {
    ui.hideElement('chatWindow');
  });
  document.getElementById('sendChatBtn').addEventListener('click', handleSendChat);
  
  document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSendChat();
    }
  });
}

// Start local 2-player game
function startLocalGame() {
  gameMode = 'local';
  resetGameState();
  ui.showGame();
  ui.showTurnIndicator(currentPlayer, gameMode, player1NextNumber, player2NextNumber);
  ui.renderPyramid(circles, handleCircleClick);
}

// Start VS Computer (Easy) game
function startComputerEasyGame() {
  gameMode = 'vs-computer-easy';
  resetGameState();
  ui.showGame();
  ui.showTurnIndicator(currentPlayer, gameMode, player1NextNumber, player2NextNumber);
  ui.renderPyramid(circles, handleCircleClick);
}

// Start online game (show modal)
function startOnlineGame() {
  gameMode = 'online';
  ui.showRoomModal();
}

// Handle create room
async function handleCreateRoom() {
  const result = await online.createOnlineRoom();
  if (result) {
    await online.startRoomListener(handleRoomUpdate, handleGameStart);
    await online.startChatListener(handleChatUpdate);
    ui.showChat();
  }
}

// Handle game start for player 1 when player 2 joins
function handleGameStart(data) {
  console.log('Game starting for player 1:', data);
  
  // Initialize game state
  circles = data.circles;
  currentPlayer = data.currentPlayer;
  gameOver = data.gameOver;
  scores = data.scores;
  winner = data.winner;
  
  console.log('Circles loaded:', circles);
  
  const onlineState = online.getOnlineState();
  
  // Show game screen
  ui.showGame();
  ui.showTurnIndicator(currentPlayer, gameMode, player1NextNumber, player2NextNumber, onlineState.playerNumber);
  ui.renderPyramid(circles, handleCircleClick);
  
  console.log('Game screen initialized for player 1');
}

// Handle join room
async function handleJoinRoom() {
  const code = document.getElementById('roomCodeInput').value;
  const result = await online.joinOnlineRoom(code);
  
  console.log('Join room result:', result);
  
  if (result) {
    // Initialize game with room data
    circles = result.roomData.circles;
    currentPlayer = result.roomData.currentPlayer;
    gameOver = result.roomData.gameOver;
    scores = result.roomData.scores;
    winner = result.roomData.winner;
    
    console.log('Player 2 circles loaded:', circles);
    
    ui.showGame();
    ui.showTurnIndicator(currentPlayer, gameMode, player1NextNumber, player2NextNumber, result.playerNumber);
    ui.renderPyramid(circles, handleCircleClick);
    ui.showChat();
    
    console.log('Game screen initialized for player 2');
    
    await online.startRoomListener(handleRoomUpdate, handleGameStart);
    await online.startChatListener(handleChatUpdate);
  }
}

// Handle room updates from Firebase
function handleRoomUpdate(data) {
  if (!data) {
    backToMenu();
    return;
  }
  
  const onlineState = online.getOnlineState();
  
  // Update game state
  circles = data.circles;
  currentPlayer = data.currentPlayer;
  gameOver = data.gameOver;
  scores = data.scores;
  winner = data.winner;
  
  // Update UI
  ui.renderPyramid(circles, handleCircleClick);
  
  if (!gameOver) {
    ui.showTurnIndicator(currentPlayer, gameMode, player1NextNumber, player2NextNumber, onlineState.playerNumber);
  } else {
    ui.hideTurnIndicator();
    ui.markBlackHole(circles);
    ui.showResults(winner, scores, gameMode);
  }
}

// Handle chat updates
function handleChatUpdate(messages) {
  const onlineState = online.getOnlineState();
  ui.updateChatMessages(messages, onlineState.playerNumber);
}

// Handle copy room code
function handleCopyCode() {
  const onlineState = online.getOnlineState();
  if (onlineState.roomCode) {
    navigator.clipboard.writeText(onlineState.roomCode).then(() => {
      const btn = document.getElementById('copyCodeBtn');
      const originalText = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  }
}

// Handle cancel waiting
async function handleCancelWaiting() {
  await online.cancelOnlineGame();
  backToMenu();
}

// Handle toggle chat
function handleToggleChat() {
  ui.toggleChatWindow();
  online.resetUnreadCount();
}

// Handle send chat message
function handleSendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (text) {
    online.sendChatMessage(text);
  }
}

// Handle circle click
function handleCircleClick(index) {
  console.log('Circle clicked:', index);
  console.log('Game mode:', gameMode);
  console.log('Current player:', currentPlayer);
  console.log('Circle data:', circles[index]);
  
  if (gameMode === 'local') {
    handleLocalClick(index);
  } else if (gameMode === 'vs-computer-easy') {
    // Only allow clicks when it's human's turn (Player 1)
    if (currentPlayer === 1) {
      handleLocalClick(index);
    }
  } else if (gameMode === 'online') {
    handleOnlineClick(index);
  }
}

// Handle local game click
function handleLocalClick(index) {
  console.log('Handling local click');
  console.log('Circle at index:', circles[index]);
  console.log('Circle player:', circles[index].player);
  console.log('Circle value:', circles[index].value);
  console.log('Game over:', gameOver);
  
  const canPlace = game.canPlaceNumber(circles[index], gameOver);
  console.log('Can place number:', canPlace);
  
  if (!canPlace) {
    console.log('Cannot place number - circle already filled or game over');
    return;
  }
  
  const nextNumber = game.getNextNumber(circles, currentPlayer);
  console.log('Next number to place:', nextNumber);
  
  circles = game.placeNumber(circles, index, currentPlayer, nextNumber);
  
  // Increment the counter for the current player
  if (currentPlayer === 1) {
    player1NextNumber++;
  } else {
    player2NextNumber++;
  }

  ui.renderPyramid(circles, handleCircleClick);
  
  if (game.isGameOver(circles)) {
    const results = game.calculateFinalResults(circles);
    scores = results.scores;
    winner = results.winner;
    gameOver = true;
    
    ui.hideTurnIndicator();
    ui.markBlackHole(circles);
    ui.showResults(winner, scores, gameMode);
  } else {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    ui.showTurnIndicator(currentPlayer, gameMode, player1NextNumber, player2NextNumber);

    // If VS Computer mode and it's computer's turn, trigger computer move
    if (gameMode === 'vs-computer-easy' && currentPlayer === 2) {
      handleComputerTurn();
    }
  }
}

// Handle computer's turn
function handleComputerTurn() {
  computer.scheduleComputerMove(() => {
    const moveIndex = computer.makeRandomMove(circles);
    
    if (moveIndex === null) {
      console.log('Computer has no valid moves');
      return;
    }
    
    console.log('Computer plays at index:', moveIndex);
    
    const nextNumber = game.getNextNumber(circles, currentPlayer);
    circles = game.placeNumber(circles, moveIndex, currentPlayer, nextNumber);
    
    ui.renderPyramid(circles, handleCircleClick);
    
    if (game.isGameOver(circles)) {
      const results = game.calculateFinalResults(circles);
      scores = results.scores;
      winner = results.winner;
      gameOver = true;
      
      ui.hideTurnIndicator();
      ui.markBlackHole(circles);
      ui.showResults(winner, scores, gameMode);
    } else {
      currentPlayer = 1; // Switch back to human
      ui.showTurnIndicator(currentPlayer, gameMode, player1NextNumber, player2NextNumber);
    }
  });
}

// Handle online game click
async function handleOnlineClick(index) {
  console.log('Handling online click');
  const result = await online.handleOnlineMove(index, circles, currentPlayer, gameOver);
  console.log('Online move result:', result);
  // Updates will come through the room listener
}

// Handle play again
function handlePlayAgain() {
  if (gameMode === 'local') {
    startLocalGame();
  } else if (gameMode === 'vs-computer-easy') {
    startComputerEasyGame();
  } else {
    backToMenu();
  }
}

// Back to menu
async function backToMenu() {
  if (gameMode === 'online') {
    await online.cleanup();
  }
  
  gameMode = null;
  resetGameState();
  ui.showMenu();
}

// Reset game state
function resetGameState() {
  circles = game.initializeCircles();
  currentPlayer = 1;
  gameOver = false;
  scores = { 1: 0, 2: 0 };
  winner = null;
  player1NextNumber = 1;
  player2NextNumber = 1; 
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}