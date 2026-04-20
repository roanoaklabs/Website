// assets/js/ui.js
// UI rendering and updates for Number Chain

import { GRID_SIZE, PLAYER_COLORS } from './config.js';

export function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) element.style.display = '';
}

export function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) element.style.display = 'none';
}

export function showMenu() {
  showElement('menuContainer');
  hideElement('gameContainer');
  hideElement('roomModal');
  hideElement('waitingModal');
  hideElement('chatToggle');
  hideElement('chatWindow');
}

export function showGame() {
  hideElement('menuContainer');
  showElement('gameContainer');
  hideElement('results');
}

export function renderGrid(grid, onCellClick, selectedCell = null, validExtensionCells = []) {
  const gridElement = document.getElementById('grid');
  if (!gridElement) {
    console.error('Grid element not found');
    return;
  }
  
  if (!grid || grid.length === 0) {
    console.error('No grid to render');
    return;
  }
  
  gridElement.innerHTML = '';
  
  for (let row = 0; row < GRID_SIZE; row++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'grid-row';
    
    for (let col = 0; col < GRID_SIZE; col++) {
      const index = row * GRID_SIZE + col;
      const cell = grid[index];
      const isSelected = index === selectedCell;
      const isExtension = validExtensionCells.includes(index);
      const cellDiv = createCellElement(cell, index, onCellClick, isSelected, isExtension);
      rowDiv.appendChild(cellDiv);
    }
    
    gridElement.appendChild(rowDiv);
  }
}

function createCellElement(cell, index, onCellClick, isSelected = false, isExtension = false) {
  const cellDiv = document.createElement('div');
  cellDiv.className = 'cell';
  cellDiv.dataset.index = index;
  
  if (cell.value !== 0) {
    cellDiv.classList.add('filled');
    cellDiv.style.backgroundColor = PLAYER_COLORS[cell.player];
    cellDiv.textContent = cell.value;
  }
  
  if (isSelected) {
    cellDiv.classList.add('selected');
  }
  
  if (isExtension) {
    cellDiv.classList.add('extension');
  }
  
  cellDiv.addEventListener('click', () => onCellClick(index));
  
  return cellDiv;
}

export function updateCell(index, cell) {
  const cellElement = document.querySelector(`[data-index="${index}"]`);
  if (!cellElement) return;
  
  if (cell.value !== 0) {
    cellElement.classList.add('filled');
    cellElement.style.backgroundColor = PLAYER_COLORS[cell.player];
    cellElement.textContent = cell.value;
  }
}

export function showTurnIndicator(currentPlayer, gameMode, nextNumbers, playerNumber = null) {
  const indicator = document.getElementById('turnIndicator');
  const turnText = document.getElementById('turnText');
  const player1Icon = document.getElementById('player1Icon');
  const player2Icon = document.getElementById('player2Icon');
  const player1Circle = document.getElementById('player1Circle');
  const player2Circle = document.getElementById('player2Circle');
  
  indicator.style.display = 'flex';
  
  player1Circle.textContent = nextNumbers[1];
  player2Circle.textContent = nextNumbers[2];
  
  player1Circle.style.backgroundColor = PLAYER_COLORS[1];
  player2Circle.style.backgroundColor = PLAYER_COLORS[2];
  
  if (currentPlayer === 1) {
    player1Icon.classList.add('active');
    player2Icon.classList.remove('active');
  } else {
    player1Icon.classList.remove('active');
    player2Icon.classList.add('active');
  }
  
  if (gameMode === 'online') {
    const isMyTurn = currentPlayer === playerNumber;
    turnText.textContent = isMyTurn ? "Your Turn" : "Opponent's Turn";
  } else if (gameMode === 'vs-computer-easy') {
    turnText.textContent = currentPlayer === 1 ? "Your Turn" : "Computer's Turn";
  } else {
    turnText.textContent = `Player ${currentPlayer}'s Turn`;
  }
}

export function hideTurnIndicator() {
  hideElement('turnIndicator');
}

export function showResults(winner, maxNumbers, gameMode) {
  const results = document.getElementById('results');
  const winnerText = document.getElementById('winnerText');
  const player1ScoreText = document.getElementById('player1ScoreText');
  const player2ScoreText = document.getElementById('player2ScoreText');
  const playAgainBtn = document.getElementById('playAgainBtn');
  
  results.style.display = 'block';
  
  if (winner === 0) {
    winnerText.textContent = "It's a Tie!";
  } else {
    winnerText.textContent = `Player ${winner} Wins!`;
  }
  
  player1ScoreText.textContent = `Player 1 highest: ${maxNumbers[1]}`;
  player2ScoreText.textContent = `Player 2 highest: ${maxNumbers[2]}`;
  
  if (gameMode === 'local') {
    playAgainBtn.textContent = 'Play Again';
  } else if (gameMode === 'vs-computer-easy') {
    playAgainBtn.textContent = 'Play Again vs Computer';
  } else {
    playAgainBtn.textContent = 'Back to Menu';
  }
}

export function showRoomModal() {
  showElement('roomModal');
  hideElement('joinInputContainer');
  document.getElementById('roomCodeInput').value = '';
}

export function hideRoomModal() {
  hideElement('roomModal');
}

export function showJoinInput() {
  showElement('joinInputContainer');
}

export function hideJoinInput() {
  hideElement('joinInputContainer');
}

export function showWaitingModal(roomCode) {
  showElement('waitingModal');
  document.getElementById('roomCodeDisplay').textContent = roomCode;
}

export function hideWaitingModal() {
  hideElement('waitingModal');
}

export function showChat() {
  showElement('chatToggle');
}

export function toggleChatWindow() {
  const chatWindow = document.getElementById('chatWindow');
  if (chatWindow.style.display === 'none' || !chatWindow.style.display) {
    chatWindow.style.display = 'flex';
  } else {
    chatWindow.style.display = 'none';
  }
}

export function updateChatMessages(messages, playerNumber) {
  const chatMessagesDiv = document.getElementById('chatMessages');
  chatMessagesDiv.innerHTML = '';
  
  messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${msg.player === playerNumber ? 'me' : 'them'}`;
    msgDiv.textContent = msg.text;
    chatMessagesDiv.appendChild(msgDiv);
  });
  
  chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

export function updateChatBadge(count) {
  const badge = document.getElementById('chatBadge');
  const toggle = document.getElementById('chatToggle');
  
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'flex';
    toggle.classList.add('notify');
  } else {
    badge.style.display = 'none';
    toggle.classList.remove('notify');
  }
}

export function clearChatInput() {
  document.getElementById('chatInput').value = '';
}
