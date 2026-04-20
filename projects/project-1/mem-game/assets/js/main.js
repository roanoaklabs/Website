// assets/js/main.js
// Main controller for Memory Game

import * as game from './game.js';
import * as ui from './ui.js';
import * as online from './online.js';
import * as computer from './computer.js';

let cards = [];
let flippedCards = [];
let moves = 0;
let totalPairs = 0;
let canFlip = true;
let gameMode = 'solo';
let currentPlayer = 'human';
let playerMatches = 0;
let opponentMatches = 0;
let computerMemory = {};
let computerMemoryTurns = {};
let turnNumber = 0;
let difficulty = 'medium';
let startTime = null;
let timerInterval = null;

let onlineMode = false;

function init() {
    setupEventListeners();
    setupChatListeners();
    gameMode = 'solo';
    
    const randomTheme = game.getRandomTheme();
    const randomGridSize = game.getRandomGridSize();
    
    ui.selectOption('themeSelect', randomTheme);
    ui.selectOption('sizeSelect', randomGridSize);
    
    startSoloGame(randomGridSize, randomTheme);
}

function setupEventListeners() {
    document.getElementById('modeSelect')?.addEventListener('change', handleModeChange);
    document.getElementById('themeSelect')?.addEventListener('change', handleSettingsChange);
    document.getElementById('sizeSelect')?.addEventListener('change', handleSettingsChange);
    
    document.getElementById('createRoomBtn')?.addEventListener('click', handleCreateRoom);
    document.getElementById('joinRoomBtn')?.addEventListener('click', () => ui.showElement('joinInput'));
    document.getElementById('submitJoinBtn')?.addEventListener('click', handleJoinRoom);
    document.getElementById('cancelJoinBtn')?.addEventListener('click', handleCancelJoin);
    document.getElementById('closeRoomModal')?.addEventListener('click', () => ui.hideModal('roomModal'));
    document.getElementById('copyCodeBtn')?.addEventListener('click', handleCopyCode);
    document.getElementById('cancelWaitingBtn')?.addEventListener('click', handleCancelRoom);
    
    const roomCodeInput = document.getElementById('roomCodeInput');
    roomCodeInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleJoinRoom();
    });

    window.initGame = handleNewGame;
    window.handleModeChange = handleModeChange;
    window.handleSettingsChange = handleSettingsChange;
    window.createRoom = handleCreateRoom;
    window.showJoinInput = () => ui.showElement('joinInput');
    window.hideJoinInput = () => ui.hideElement('joinInput');
    window.joinRoom = handleJoinRoom;
    window.cancelRoom = handleCancelRoom;
    window.copyRoomCode = handleCopyCode;
    window.copyScore = handleCopyScore;
}

function setupChatListeners() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatClose = document.getElementById('chat-close');
    const chatSend = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');

    chatToggle?.addEventListener('click', () => {
        ui.toggleChat();
        online.resetUnreadCount();
    });

    chatClose?.addEventListener('click', () => ui.hideChatWindow());

    chatSend?.addEventListener('click', () => {
        const text = chatInput?.value.trim();
        if (text) {
            online.sendChatMessage(text);
        }
    });

    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = chatInput.value.trim();
            if (text) {
                online.sendChatMessage(text);
            }
        }
    });
}

function handleModeChange() {
    const mode = document.getElementById('modeSelect')?.value;
    if (mode === 'vs-friend') {
        ui.showModal('roomModal');
    } else {
        onlineMode = false;
        handleNewGame();
    }
}

function handleSettingsChange() {
    if (!onlineMode) {
        handleNewGame();
    }
}

async function handleCreateRoom() {
    const gridSize = document.getElementById('sizeSelect')?.value;
    const theme = document.getElementById('themeSelect')?.value;
    const cards = game.initializeCards(gridSize, theme);

    await online.createOnlineRoom(gridSize, theme, cards);
    await online.startRoomListener(handleOnlineGameStart, handleOnlineGameUpdate);
}

async function handleJoinRoom() {
    const code = document.getElementById('roomCodeInput')?.value;
    if (!code) return;

    const result = await online.joinOnlineRoom(code);
    if (result) {
        await online.startRoomListener(handleOnlineGameStart, handleOnlineGameUpdate);
        await online.startChatListener((messages, playerRole) => {
            ui.updateChatMessages(messages, playerRole);
        });
    }
}

function handleCancelJoin() {
    ui.hideElement('joinInput');
    document.getElementById('roomCodeInput').value = '';
}

function handleCancelRoom() {
    online.leaveRoom();
    document.getElementById('modeSelect').value = 'solo';
    handleNewGame();
}

function handleCopyCode() {
    const state = online.getOnlineState();
    if (state.roomCode) {
        navigator.clipboard.writeText(state.roomCode).then(() => {
            const btn = document.getElementById('copyCodeBtn');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = '✓ Copied!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove('copied');
                }, 2000);
            }
        });
    }
}

function handleCopyScore() {
    const scoreText = document.getElementById('scoreText')?.textContent;
    if (scoreText) {
        navigator.clipboard.writeText(scoreText).then(() => {
            const btn = document.getElementById('copyBtn');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = '✓ Copied!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove('copied');
                }, 2000);
            }
        });
    }
}

function handleNewGame() {
    ui.hideChatToggle();
    ui.hideChatWindow();
    ui.hideModal('winMessage');
    ui.hideModal('waitingModal');

    if (onlineMode) {
        online.leaveRoom();
    }

    flippedCards = [];
    moves = 0;
    playerMatches = 0;
    opponentMatches = 0;
    computerMemory = {};
    computerMemoryTurns = {};
    turnNumber = 0;
    canFlip = true;
    stopTimer();

    const modeSelect = document.getElementById('modeSelect')?.value;

    if (modeSelect === 'solo') {
        gameMode = 'solo';
        difficulty = null;
        startSoloGame();
    } else if (modeSelect === 'vs-friend') {
        return;
    } else {
        gameMode = 'vs';
        if (modeSelect === 'vs-easy') difficulty = 'easy';
        else if (modeSelect === 'vs-medium') difficulty = 'medium';
        else if (modeSelect === 'vs-hard') difficulty = 'hard';
        startVsGame();
    }
}

function startSoloGame(gridSize = null, theme = null) {
    onlineMode = false;
    
    if (!gridSize) gridSize = document.getElementById('sizeSelect')?.value;
    if (!theme) theme = document.getElementById('themeSelect')?.value;

    cards = game.initializeCards(gridSize, theme);
    totalPairs = game.getGridSize(gridSize).pairs;
    currentPlayer = 'human';

    ui.showSoloStats();
    ui.updateMoves(0);
    ui.updateTimer(0);
    ui.renderBoard(cards, handleCardClick, gridSize);

    startTimer();
}

function startVsGame() {
    onlineMode = false;
    const gridSize = document.getElementById('sizeSelect')?.value;
    const theme = document.getElementById('themeSelect')?.value;

    cards = game.initializeCards(gridSize, theme);
    totalPairs = game.getGridSize(gridSize).pairs;
    currentPlayer = Math.random() < 0.5 ? 'human' : 'computer';

    ui.showVsStats();
    ui.updatePlayerScore(0);
    ui.updateOpponentScore(0);
    ui.renderBoard(cards, handleCardClick, gridSize);

    ui.updateTurnIndicator(gameMode, currentPlayer, null);

    if (currentPlayer === 'computer') {
        setTimeout(executeComputerTurn, 1000);
    }
}

function handleCardClick(card) {
    if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }

    if (gameMode === 'vs' && currentPlayer !== 'human') {
        return;
    }

    if (onlineMode) {
        handleOnlineCardClick(card);
        return;
    }

    handleLocalCardClick(card);
}

function handleLocalCardClick(card) {
    ui.flipCard(card);
    flippedCards.push(card);

    if (gameMode === 'vs') {
        const index = card.dataset.index;
        const symbol = card.dataset.symbol;
        computerMemory[index] = symbol;
        computerMemoryTurns[index] = turnNumber;
    }

    if (flippedCards.length === 2) {
        canFlip = false;
        checkMatch();
    }
}

async function handleOnlineCardClick(card) {
    const state = online.getOnlineState();
    const isMyTurn = (state.playerRole === 'player1' && currentPlayer === 'player1') ||
                    (state.playerRole === 'player2' && currentPlayer === 'player2');

    if (!isMyTurn) {
        return;
    }

    ui.flipCard(card);
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        canFlip = false;
        const [card1, card2] = flippedCards;
        const isMatch = game.checkForMatch(card1, card2);

        const roomData = { player1Score: playerMatches, player2Score: opponentMatches };
        const currentScore = state.playerRole === 'player1' ? roomData.player1Score : roomData.player2Score;

        await online.makeMove(
            parseInt(card1.dataset.index),
            parseInt(card2.dataset.index),
            isMatch,
            currentScore
        );
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = game.checkForMatch(card1, card2);

    if (isMatch) {
        setTimeout(() => {
            ui.markMatched(card1);
            ui.markMatched(card2);

            if (gameMode === 'solo') {
                moves++;
                ui.updateMoves(moves);
            } else if (gameMode === 'vs') {
                if (currentPlayer === 'human') {
                    playerMatches++;
                    ui.updatePlayerScore(playerMatches);
                } else {
                    opponentMatches++;
                    ui.updateOpponentScore(opponentMatches);
                }
            }

            flippedCards = [];
            canFlip = true;

            setTimeout(() => {
                const matchedPairs = game.getMatchedPairsCount();
                if (game.isGameOver(matchedPairs, totalPairs)) {
                    stopTimer();
                    handleWin();
                } else if (gameMode === 'vs' && currentPlayer === 'computer') {
                    setTimeout(executeComputerTurn, 800);
                }
            }, 300);
        }, 500);
    } else {
        turnNumber++;
        if (gameMode === 'solo') {
            moves++;
            ui.updateMoves(moves);
        }

        setTimeout(() => {
            ui.unflipCard(card1);
            ui.unflipCard(card2);
            flippedCards = [];
            canFlip = true;

            if (gameMode === 'vs') {
                currentPlayer = currentPlayer === 'human' ? 'computer' : 'human';
                ui.updateTurnIndicator(gameMode, currentPlayer, null);
                if (currentPlayer === 'computer') {
                    setTimeout(executeComputerTurn, 800);
                }
            }
        }, 1000);
    }
}

function executeComputerTurn() {
    if (currentPlayer !== 'computer' || !canFlip) return;

    let move;
    if (difficulty === 'hard') {
        move = computer.makeComputerMoveHard(computerMemory, computerMemoryTurns, turnNumber);
    } else {
        move = computer.makeComputerMove(difficulty, computerMemory, computerMemoryTurns, turnNumber);
    }

    const { card1, card2 } = move;

    setTimeout(() => {
        ui.flipCard(card1);
        flippedCards.push(card1);
        computer.executeComputerMove(card1, computerMemory, computerMemoryTurns, turnNumber);

        setTimeout(() => {
            ui.flipCard(card2);
            flippedCards.push(card2);
            computer.executeComputerMove(card2, computerMemory, computerMemoryTurns, turnNumber);

            canFlip = false;
            checkMatch();
        }, 600);
    }, 400);
}

function handleOnlineGameStart(roomData) {
    onlineMode = true;
    gameMode = 'vs-friend';
    flippedCards = [];

    ui.hideModal('waitingModal');
    ui.selectOption('sizeSelect', roomData.gridSize);
    ui.selectOption('themeSelect', roomData.theme);

    const size = game.getGridSize(roomData.gridSize);
    totalPairs = size.pairs;
    cards = roomData.cards;

    const state = online.getOnlineState();
    currentPlayer = roomData.currentPlayer;
    playerMatches = state.playerRole === 'player1' ? (roomData.player1Score || 0) : (roomData.player2Score || 0);
    opponentMatches = state.playerRole === 'player1' ? (roomData.player2Score || 0) : (roomData.player1Score || 0);

    ui.showVsStats();
    ui.updatePlayerScore(playerMatches);
    ui.updateOpponentScore(opponentMatches);
    ui.renderBoard(cards, handleCardClick, roomData.gridSize);

    ui.updateTurnIndicator(gameMode, currentPlayer, state.playerRole);
    ui.showChatToggle();

    online.startChatListener((messages, playerRole) => {
        ui.updateChatMessages(messages, playerRole);
    });
}

function handleOnlineGameUpdate(roomData) {
    if (!onlineMode) return;

    const state = online.getOnlineState();
    currentPlayer = roomData.currentPlayer;

    const myScore = state.playerRole === 'player1' ? (roomData.player1Score || 0) : (roomData.player2Score || 0);
    const theirScore = state.playerRole === 'player1' ? (roomData.player2Score || 0) : (roomData.player1Score || 0);

    ui.updatePlayerScore(myScore);
    ui.updateOpponentScore(theirScore);

    playerMatches = myScore;
    opponentMatches = theirScore;

    ui.updateTurnIndicator(gameMode, currentPlayer, state.playerRole);

    const lastMove = roomData.lastMove || null;
    const moveKey = lastMove ? `${lastMove.player}|${lastMove.cards?.join(',')}|${lastMove.matched}` : null;

    if (lastMove && lastMove.player !== state.playerId && moveKey !== online.getLastProcessedMove()) {
        online.setLastProcessedMove(moveKey);

        const [i1, i2] = lastMove.cards || [];
        const c1 = document.querySelector(`[data-index="${i1}"]`);
        const c2 = document.querySelector(`[data-index="${i2}"]`);

        if (c1 && c2) {
            ui.unmarkMatched(c1);
            ui.unmarkMatched(c2);
            ui.flipCard(c1);
            ui.flipCard(c2);

            if (lastMove.matched) {
                setTimeout(() => {
                    ui.markMatched(c1);
                    ui.markMatched(c2);
                    ui.unflipCard(c1);
                    ui.unflipCard(c2);
                }, 700);
            } else {
                setTimeout(() => {
                    ui.unflipCard(c1);
                    ui.unflipCard(c2);
                }, 1000);
            }
        }
    } else if (lastMove && lastMove.player === state.playerId && lastMove.matched) {
        lastMove.cards?.forEach(i => {
            const card = document.querySelector(`[data-index="${i}"]`);
            if (card) ui.markMatched(card);
        });
    }

    if (roomData.matchedCards && Array.isArray(roomData.matchedCards)) {
        roomData.matchedCards.forEach(idx => {
            if (lastMove?.matched && lastMove.cards?.includes(idx)) return;
            const card = document.querySelector(`[data-index="${idx}"]`);
            if (card && !card.classList.contains('matched')) ui.markMatched(card);
        });
    }

    const totalMatches = (roomData.player1Score || 0) + (roomData.player2Score || 0);
    if (totalMatches === totalPairs) {
        setTimeout(() => {
            ui.showOnlineWinMessage(state.playerRole, roomData);
            online.leaveRoom();
            onlineMode = false;
        }, 500);
    }
}

function handleWin() {
    const gridSize = document.getElementById('sizeSelect')?.value;
    const theme = document.getElementById('themeSelect')?.options[document.getElementById('themeSelect')?.selectedIndex]?.text;
    const elapsedTime = getElapsedTime();

    if (gameMode === 'solo') {
        ui.showWinMessage(gameMode, elapsedTime, gridSize, theme, moves, 0, 0, null);
    } else {
        ui.showWinMessage(gameMode, elapsedTime, gridSize, theme, 0, playerMatches, opponentMatches, difficulty);
    }
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        ui.updateTimer(elapsed);
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function getElapsedTime() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
