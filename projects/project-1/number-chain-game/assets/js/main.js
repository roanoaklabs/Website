// assets/js/main.js
// Main game controller for Number Chain

import * as game from './game.js';
import * as ui from './ui.js';
import * as online from './online.js';
import * as computer from './computer.js';

let gameMode = null;
let grid = [];
let currentPlayer = 1;
let gameOver = false;
let winner = null;
let p1Max = 3;
let p2Max = 3;
let selectedCell = null;

function init() {
  setupMenuListeners();
  setupGameListeners();
  setupModalListeners();
  setupChatListeners();
  ui.showMenu();
}

function setupMenuListeners() {
  document.getElementById('localBtn').addEventListener('click', startLocalGame);
  document.getElementById('computerEasyBtn').addEventListener('click', startComputerEasyGame);
  document.getElementById('onlineBtn').addEventListener('click', startOnlineGame);
}

function setupGameListeners() {
  document.getElementById('backBtn').addEventListener('click', backToMenu);
  document.getElementById('playAgainBtn').addEventListener('click', handlePlayAgain);
}

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
  
  document.getElementById('roomCodeInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
  });
}

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

function startLocalGame() {
  gameMode = 'local';
  resetGameState();
  ui.showGame();
  updateTurnIndicator();
  ui.renderGrid(grid, handleCellClick);
}

function startComputerEasyGame() {
  gameMode = 'vs-computer-easy';
  resetGameState();
  ui.showGame();
  updateTurnIndicator();
  ui.renderGrid(grid, handleCellClick);
}

function startOnlineGame() {
  gameMode = 'online';
  ui.showRoomModal();
}

async function handleCreateRoom() {
  const result = await online.createOnlineRoom();
  if (result) {
    await online.startRoomListener(handleRoomUpdate, handleGameStart);
    await online.startChatListener(handleChatUpdate);
    ui.showChat();
  }
}

function handleGameStart(data) {
  grid = data.grid;
  currentPlayer = data.currentPlayer;
  gameOver = data.gameOver;
  winner = data.winner;
  p1Max = data.p1Max || 3;
  p2Max = data.p2Max || 3;
  
  const onlineState = online.getOnlineState();
  
  ui.showGame();
  updateTurnIndicator(onlineState.playerNumber);
  ui.renderGrid(grid, handleCellClick);
}

async function handleJoinRoom() {
  const code = document.getElementById('roomCodeInput').value;
  const result = await online.joinOnlineRoom(code);
  
  if (result) {
    grid = result.roomData.grid;
    currentPlayer = result.roomData.currentPlayer;
    gameOver = result.roomData.gameOver;
    winner = result.roomData.winner;
    p1Max = result.roomData.p1Max || 3;
    p2Max = result.roomData.p2Max || 3;
    
    ui.showGame();
    updateTurnIndicator(result.playerNumber);
    ui.renderGrid(grid, handleCellClick);
    ui.showChat();
    
    await online.startRoomListener(handleRoomUpdate, handleGameStart);
    await online.startChatListener(handleChatUpdate);
  }
}

function handleRoomUpdate(data) {
  if (!data) {
    backToMenu();
    return;
  }
  
  const onlineState = online.getOnlineState();
  
  grid = data.grid;
  currentPlayer = data.currentPlayer;
  gameOver = data.gameOver;
  winner = data.winner;
  p1Max = data.p1Max || 3;
  p2Max = data.p2Max || 3;
  
  ui.renderGrid(grid, handleCellClick);
  
  if (!gameOver) {
    updateTurnIndicator(onlineState.playerNumber);
  } else {
    ui.hideTurnIndicator();
    const maxNumbers = { 1: p1Max, 2: p2Max };
    ui.showResults(winner, maxNumbers, gameMode);
  }
}

function handleChatUpdate(messages) {
  const onlineState = online.getOnlineState();
  ui.updateChatMessages(messages, onlineState.playerNumber);
}

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

async function handleCancelWaiting() {
  await online.cancelOnlineGame();
  backToMenu();
}

function handleToggleChat() {
  ui.toggleChatWindow();
  online.resetUnreadCount();
}

function handleSendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (text) {
    online.sendChatMessage(text);
  }
}

function handleCellClick(index) {
  if (gameMode === 'local') {
    handleLocalClick(index);
  } else if (gameMode === 'vs-computer-easy') {
    if (currentPlayer === 1) {
      handleLocalClick(index);
    }
  } else if (gameMode === 'online') {
    handleOnlineClick(index);
  }
}

function handleLocalClick(index) {
  if (gameOver) return;
  
  const clickedCell = grid[index];
  
  if (selectedCell === null) {
    if (clickedCell.player === currentPlayer && clickedCell.value > 0) {
      if (game.canExtendFrom(grid, index, currentPlayer)) {
        selectedCell = index;
        ui.renderGrid(grid, handleCellClick, selectedCell, game.getExtensionCells(grid, index, currentPlayer));
      }
    }
    return;
  }
  
  const extensionCells = game.getExtensionCells(grid, selectedCell, currentPlayer);
  
  if (extensionCells.includes(index)) {
    grid = game.placeNumberFrom(grid, selectedCell, index, currentPlayer);
    
    const placedValue = grid[index].value;
    if (currentPlayer === 1) {
      p1Max = Math.max(p1Max, placedValue);
    } else {
      p2Max = Math.max(p2Max, placedValue);
    }
    
    selectedCell = null;
    
    ui.renderGrid(grid, handleCellClick);
    
    if (game.isGameOver(grid) || game.bothPlayersHaveNoMoves(grid)) {
      const results = game.calculateFinalResults(grid);
      winner = results.winner;
      gameOver = true;
      
      ui.hideTurnIndicator();
      ui.showResults(winner, results.maxNumbers, gameMode);
    } else {
      selectedCell = null;
      const nextPlayer = currentPlayer === 1 ? 2 : 1;
      const nextPlayerHasMoves = game.hasValidMoves(grid, nextPlayer);
      const currentPlayerHasMoves = game.hasValidMoves(grid, currentPlayer);
      
      if (!nextPlayerHasMoves && currentPlayerHasMoves) {
        updateTurnIndicator();
      } else {
        currentPlayer = nextPlayer;
        updateTurnIndicator();
      }
      
      if (gameMode === 'vs-computer-easy' && currentPlayer === 2) {
        handleComputerTurn();
      }
    }
  } else if (clickedCell.player === currentPlayer && clickedCell.value > 0) {
    if (game.canExtendFrom(grid, index, currentPlayer)) {
      selectedCell = index;
      ui.renderGrid(grid, handleCellClick, selectedCell, game.getExtensionCells(grid, index, currentPlayer));
    }
  } else {
    selectedCell = null;
    ui.renderGrid(grid, handleCellClick);
  }
}

function handleComputerTurn() {
  computer.scheduleComputerMove(() => {
    const move = computer.makeComputerMove(grid, 2);
    const p1HasMoves = game.hasValidMoves(grid, 1);
    
    if (move === null) {
      if (!p1HasMoves) {
        const results = game.calculateFinalResults(grid);
        winner = results.winner;
        gameOver = true;
        
        ui.hideTurnIndicator();
        ui.showResults(winner, results.maxNumbers, gameMode);
        return;
      }
      currentPlayer = 1;
      updateTurnIndicator();
      return;
    }
    
    grid = game.placeNumberFrom(grid, move.fromIndex, move.toIndex, 2);
    const placedValue = grid[move.toIndex].value;
    p2Max = Math.max(p2Max, placedValue);
    
    ui.renderGrid(grid, handleCellClick);
    
    if (game.isGameOver(grid) || game.bothPlayersHaveNoMoves(grid)) {
      const results = game.calculateFinalResults(grid);
      winner = results.winner;
      gameOver = true;
      
      ui.hideTurnIndicator();
      ui.showResults(winner, results.maxNumbers, gameMode);
    } else {
      selectedCell = null;
      const p1HasMoves = game.hasValidMoves(grid, 1);
      const p2HasMoves = game.hasValidMoves(grid, 2);
      
      if (!p1HasMoves && p2HasMoves) {
        updateTurnIndicator();
      } else {
        currentPlayer = 1;
        updateTurnIndicator();
      }
    }
  });
}

async function handleOnlineClick(index) {
  const onlineState = online.getOnlineState();
  const playerNum = onlineState.playerNumber;
  const clickedCell = grid[index];
  
  if (selectedCell === null) {
    if (clickedCell.player === playerNum && clickedCell.value > 0) {
      if (game.canExtendFrom(grid, index, playerNum)) {
        selectedCell = index;
        ui.renderGrid(grid, handleCellClick, selectedCell, game.getExtensionCells(grid, index, playerNum));
      }
    }
    return;
  }
  
  const extensionCells = game.getExtensionCells(grid, selectedCell, playerNum);
  
  if (extensionCells.includes(index)) {
    const result = await online.handleOnlineMove(selectedCell, index, grid, currentPlayer, gameOver);
    if (result) {
      selectedCell = null;
    }
  } else if (clickedCell.player === playerNum && clickedCell.value > 0) {
    if (game.canExtendFrom(grid, index, playerNum)) {
      selectedCell = index;
      ui.renderGrid(grid, handleCellClick, selectedCell, game.getExtensionCells(grid, index, playerNum));
    }
  } else {
    selectedCell = null;
    ui.renderGrid(grid, handleCellClick);
  }
}

function handlePlayAgain() {
  if (gameMode === 'local') {
    startLocalGame();
  } else if (gameMode === 'vs-computer-easy') {
    startComputerEasyGame();
  } else {
    backToMenu();
  }
}

async function backToMenu() {
  if (gameMode === 'online') {
    await online.cleanup();
  }
  
  gameMode = null;
  resetGameState();
  ui.showMenu();
}

function resetGameState() {
  const initialGrid = game.initializeGrid();
  grid = game.setupInitialPositions(initialGrid);
  currentPlayer = 1;
  gameOver = false;
  winner = null;
  p1Max = 3;
  p2Max = 3;
  selectedCell = null;
}

function updateTurnIndicator(playerNumber = null) {
  const nextNumbers = game.getCurrentNextNumbers(grid);
  ui.showTurnIndicator(currentPlayer, gameMode, nextNumbers, playerNumber);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
