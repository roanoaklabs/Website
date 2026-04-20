// assets/js/ui.js
// UI rendering and updates

import { PYRAMID_STRUCTURE, PLAYER_COLORS } from './config.js';

// Show/Hide elements
export function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) element.style.display = '';
}

export function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) element.style.display = 'none';
}

// Show menu screen
export function showMenu() {
  showElement('menuContainer');
  hideElement('gameContainer');
  hideElement('roomModal');
  hideElement('waitingModal');
  hideElement('chatToggle');
  hideElement('chatWindow');
}

// Show game screen
export function showGame() {
  hideElement('menuContainer');
  showElement('gameContainer');
  hideElement('results');
}

// Render the pyramid of circles
export function renderPyramid(circles, onCircleClick) {
  const pyramid = document.getElementById('pyramid');
  if (!pyramid) {
    console.error('Pyramid element not found');
    return;
  }
  
  if (!circles || circles.length === 0) {
    console.error('No circles to render');
    return;
  }
  
  pyramid.innerHTML = '';
  
  PYRAMID_STRUCTURE.forEach((row) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'pyramid-row';
    
    for (let i = 0; i < row.count; i++) {
      const index = row.startIndex + i;
      const circle = circles[index];
      const circleDiv = createCircleElement(circle, index, onCircleClick);
      rowDiv.appendChild(circleDiv);
    }
    
    pyramid.appendChild(rowDiv);
  });
}

// Create a single circle element
function createCircleElement(circle, index, onCircleClick) {
  const circleDiv = document.createElement('div');
  circleDiv.className = 'circle';
  circleDiv.dataset.index = index;
  
  if (circle.value !== null) {
    circleDiv.classList.add('filled');
    circleDiv.style.backgroundColor = PLAYER_COLORS[circle.player];
    circleDiv.textContent = circle.value;
  }
  
  circleDiv.addEventListener('click', () => onCircleClick(index));
  
  return circleDiv;
}

// Update a specific circle (for animations/updates)
export function updateCircle(index, circle, isBlackHole = false) {
  const circleElement = document.querySelector(`[data-index="${index}"]`);
  if (!circleElement) return;
  
  if (isBlackHole) {
    circleElement.classList.add('black-hole');
    circleElement.textContent = '🕳️';
  } else if (circle.value !== null) {
    circleElement.classList.add('filled');
    circleElement.style.backgroundColor = PLAYER_COLORS[circle.player];
    circleElement.textContent = circle.value;
  }
}

// Show turn indicator
export function showTurnIndicator(currentPlayer, gameMode, p1Next, p2Next, playerNumber = null) {
  const indicator = document.getElementById('turnIndicator');
  const turnText = document.getElementById('turnText');
  const player1Icon = document.getElementById('player1Icon');
  const player2Icon = document.getElementById('player2Icon');
  const player1Circle = document.getElementById('player1Circle');
  const player2Circle = document.getElementById('player2Circle');
  
  indicator.style.display = 'flex';
  
  player1Circle.textContent = p1Next;
  player2Circle.textContent = p2Next;
  
  // Set colors
  player1Circle.style.backgroundColor = PLAYER_COLORS[1];
  player2Circle.style.backgroundColor = PLAYER_COLORS[2];
  
  // Update active state
  if (currentPlayer === 1) {
    player1Icon.classList.add('active');
    player2Icon.classList.remove('active');
  } else {
    player1Icon.classList.remove('active');
    player2Icon.classList.add('active');
  }
  
  // Update text
  if (gameMode === 'online') {
    const isMyTurn = currentPlayer === playerNumber;
    turnText.textContent = isMyTurn ? "Your Turn" : "Opponent's Turn";
  } else if (gameMode === 'vs-computer-easy') {
    turnText.textContent = currentPlayer === 1 ? "Your Turn" : "Computer's Turn";
  } else {
    turnText.textContent = `Player ${currentPlayer}'s Turn`;
  }
}

// Hide turn indicator
export function hideTurnIndicator() {
  hideElement('turnIndicator');
}

// Show results
export function showResults(winner, scores, gameMode) {
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
  
  player1ScoreText.textContent = `Player 1: ${scores[1]} points`;
  player2ScoreText.textContent = `Player 2: ${scores[2]} points`;
  
  // Change button text based on mode
  if (gameMode === 'local') {
    playAgainBtn.textContent = 'Play Again';
  } else if (gameMode === 'vs-computer-easy') {
    playAgainBtn.textContent = 'Play Again vs Computer';
  } else {
    playAgainBtn.textContent = 'Back to Menu';
  }
}

// Show room modal
export function showRoomModal() {
  showElement('roomModal');
  hideElement('joinInputContainer');
  document.getElementById('roomCodeInput').value = '';
}

// Hide room modal
export function hideRoomModal() {
  hideElement('roomModal');
}

// Show join input
export function showJoinInput() {
  showElement('joinInputContainer');
}

// Hide join input
export function hideJoinInput() {
  hideElement('joinInputContainer');
}

// Show waiting modal
export function showWaitingModal(roomCode) {
  showElement('waitingModal');
  document.getElementById('roomCodeDisplay').textContent = roomCode;
}

// Hide waiting modal
export function hideWaitingModal() {
  hideElement('waitingModal');
}

// Show chat
export function showChat() {
  showElement('chatToggle');
}

// Toggle chat window
export function toggleChatWindow() {
  const chatWindow = document.getElementById('chatWindow');
  if (chatWindow.style.display === 'none' || !chatWindow.style.display) {
    chatWindow.style.display = 'flex';
  } else {
    chatWindow.style.display = 'none';
  }
}

// Update chat messages
export function updateChatMessages(messages, playerNumber) {
  const chatMessagesDiv = document.getElementById('chatMessages');
  chatMessagesDiv.innerHTML = '';
  
  messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${msg.player === playerNumber ? 'me' : 'them'}`;
    msgDiv.textContent = msg.text;
    chatMessagesDiv.appendChild(msgDiv);
  });
  
  // Scroll to bottom
  chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

// Update chat badge
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

// Clear chat input
export function clearChatInput() {
  document.getElementById('chatInput').value = '';
}

// Mark all circles as black hole candidates (show animation)
export function markBlackHole(circles) {
  circles.forEach((circle, index) => {
    if (circle.value === null) {
      updateCircle(index, circle, true);
    }
  });
}