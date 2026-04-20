// assets/js/ui.js
// UI functions for Memory Game

export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

export function showElement(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.style.display = '';
    }
}

export function hideElement(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.style.display = 'none';
    }
}

export function setElementText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = text;
    }
}

export function setElementHTML(elementId, html) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = html;
    }
}

export function renderBoard(cards, onCardClick, gridSizeKey) {
    const gameBoard = document.getElementById('gameBoard');
    if (!gameBoard) return;

    gameBoard.innerHTML = '';

    const size = {
        '3x4': { cols: 3, rows: 4 },
        '4x4': { cols: 4, rows: 4 },
        '4x5': { cols: 4, rows: 5 },
        '5x6': { cols: 5, rows: 6 },
        '6x6': { cols: 6, rows: 6 }
    }[gridSizeKey] || { cols: 4, rows: 4 };

    gameBoard.style.gridTemplateColumns = `repeat(${size.cols}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${size.rows}, 1fr)`;

    cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.symbol = symbol;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="card-face card-back">?</div>
            <div class="card-face card-front">${symbol}</div>
        `;

        card.addEventListener('click', () => onCardClick(card));
        gameBoard.appendChild(card);
    });
}

export function flipCard(card) {
    card.classList.add('flipped');
}

export function unflipCard(card) {
    card.classList.remove('flipped');
}

export function markMatched(card) {
    card.classList.add('matched');
}

export function unmarkMatched(card) {
    card.classList.remove('matched');
}

export function updateMoves(moves) {
    setElementText('moves', moves);
}

export function updateTimer(elapsed) {
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    setElementText('timer', `${minutes}:${seconds.toString().padStart(2, '0')}`);
}

export function updatePlayerScore(score) {
    setElementText('playerScore', score);
}

export function updateOpponentScore(score) {
    setElementText('opponentScore', score);
}

export function showSoloStats() {
    const soloStats = document.getElementById('soloStats');
    const vsStats = document.getElementById('vsStats');
    if (soloStats) soloStats.style.display = '';
    if (vsStats) vsStats.style.display = 'none';
}

export function showVsStats() {
    const soloStats = document.getElementById('soloStats');
    const vsStats = document.getElementById('vsStats');
    if (soloStats) soloStats.style.display = 'none';
    if (vsStats) vsStats.style.display = '';
}

export function updateTurnIndicator(gameMode, currentPlayer, playerRole) {
    const indicator = document.getElementById('turnIndicator');
    const turnText = document.getElementById('turnText');

    if (!indicator || !turnText) return;

    if (gameMode === 'vs-friend') {
        indicator.style.display = 'inline-block';
        const isMyTurn = (playerRole === 'player1' && currentPlayer === 'player1') ||
                        (playerRole === 'player2' && currentPlayer === 'player2');
        turnText.textContent = isMyTurn ? 'Your Turn' : 'Opponent Turn';
    } else if (gameMode === 'vs') {
        indicator.style.display = 'inline-block';
        turnText.textContent = currentPlayer === 'human' ? 'Your Turn' : 'Computer Turn';
    } else {
        indicator.style.display = 'none';
    }
}

export function showWinMessage(gameMode, elapsedTime, gridSize, theme, moves, playerMatches, opponentMatches, difficulty) {
    const winTitle = document.getElementById('winTitle');
    const winContent = document.getElementById('winContent');
    const scoreTextEl = document.getElementById('scoreText');

    if (!winTitle || !winContent || !scoreTextEl) return;

    let finalScoreText = '';
    let titleText = '';
    let contentHTML = '';

    if (gameMode === 'solo') {
        titleText = 'Congratulations!';
        contentHTML = `
            <p>You completed the game!</p>
            <p>Time: ${elapsedTime}</p>
            <p>Moves: ${moves}</p>
        `;
        finalScoreText = `Memory Game - Solo Mode
Grid: ${gridSize}
Theme: ${theme}
Time: ${elapsedTime}
Moves: ${moves}`;
    } else {
        const difficultyText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

        if (playerMatches > opponentMatches) {
            titleText = '🎉 You Win!';
        } else if (opponentMatches > playerMatches) {
            titleText = '🤖 Computer Wins!';
        } else {
            titleText = '🤝 Tie Game!';
        }

        contentHTML = `
            <p>Final Score:</p>
            <p>You: ${playerMatches}</p>
            <p>Computer: ${opponentMatches}</p>
        `;
        finalScoreText = `Memory Game - VS ${difficultyText} Computer
Grid: ${gridSize}
Theme: ${theme}
Final Score:
  You: ${playerMatches}
  Computer: ${opponentMatches}
Result: ${playerMatches > opponentMatches ? 'You Win!' : opponentMatches > playerMatches ? 'Computer Wins!' : 'Tie!'}`;
    }

    winTitle.textContent = titleText;
    winContent.innerHTML = contentHTML;
    scoreTextEl.textContent = finalScoreText;

    showModal('winMessage');
}

export function showOnlineWinMessage(playerRole, roomData) {
    const myScore = playerRole === 'player1' ? roomData.player1Score : roomData.player2Score;
    const theirScore = playerRole === 'player1' ? roomData.player2Score : roomData.player1Score;

    const winTitle = document.getElementById('winTitle');
    const winContent = document.getElementById('winContent');
    const scoreTextEl = document.getElementById('scoreText');

    if (!winTitle || !winContent || !scoreTextEl) return;

    if (myScore > theirScore) {
        winTitle.textContent = '🎉 You Win!';
    } else if (theirScore > myScore) {
        winTitle.textContent = '😢 You Lose!';
    } else {
        winTitle.textContent = '🤝 Tie Game!';
    }

    winContent.innerHTML = `
        <p>Final Score:</p>
        <p>You: ${myScore}</p>
        <p>Opponent: ${theirScore}</p>
    `;

    showModal('winMessage');
}

export function updateChatMessages(messages, playerNumber) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    chatMessages.innerHTML = '';
    messages.forEach(msg => {
        const div = document.createElement('div');
        div.classList.add('message');
        div.classList.add(msg.player === playerNumber ? 'me' : 'them');
        div.textContent = msg.text;
        chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function clearChatInput() {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = '';
    }
}

export function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatMessages = document.getElementById('chat-messages');
    if (chatWindow) {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden') && chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
}

export function showChatToggle() {
    const chatToggle = document.getElementById('chat-toggle');
    if (chatToggle) {
        chatToggle.classList.remove('hidden');
    }
}

export function hideChatToggle() {
    const chatToggle = document.getElementById('chat-toggle');
    if (chatToggle) {
        chatToggle.classList.add('hidden');
    }
}

export function hideChatWindow() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.classList.add('hidden');
    }
}

export function setRoomCodeDisplay(code) {
    setElementText('roomCodeDisplay', code);
}

export function selectOption(selectId, value) {
    const select = document.getElementById(selectId);
    if (select) {
        select.value = value;
    }
}
