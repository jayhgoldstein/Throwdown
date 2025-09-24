//You'll need to compile this TypeScript file into JavaScript using tsc main.ts. A simple tsconfig.json file
//in your project directory with { "compilerOptions": { "outFile": "dist/main.js" } } will work. Then, run tsc in your terminal.

import { ThrowdownGame, Suit, Rank, Card, Player } from './game'; // Adjust the import path as needed

// Get DOM elements
const logElement = document.getElementById('log') as HTMLUListElement;
const currentPlayerNameElement = document.getElementById('current-player-name') as HTMLHeadingElement;
const playerHandDisplay = document.getElementById('player-hand-display') as HTMLDivElement;
const askPlayerSelect = document.getElementById('ask-player-select') as HTMLSelectElement;
const askSuitSelect = document.getElementById('ask-suit-select') as HTMLSelectElement;
const askButton = document.getElementById('ask-button') as HTMLButtonElement;
const guessButton = document.getElementById('guess-button') as HTMLButtonElement;
const guessInputsContainer = document.getElementById('guess-inputs') as HTMLDivElement;

let game: ThrowdownGame;
const playerNames = ['Alice', 'Bob', 'Charlie'];

function logMessage(message: string, isImportant = false) {
    const li = document.createElement('li');
    li.textContent = message;
    if (isImportant) {
        li.style.fontWeight = 'bold';
    }
    logElement.appendChild(li);
    logElement.scrollTop = logElement.scrollHeight; // Auto-scroll
}

function updateUI() {
    const currentPlayer = game.getCurrentPlayer();
    currentPlayerNameElement.textContent = `It's ${currentPlayer.name}'s turn!`;
    playerHandDisplay.textContent = `Your Hand: ${currentPlayer.hand.map(c => `${c.rank} of ${c.suit}`).join(', ')}`;

    // Update 'Ask Player' dropdown
    askPlayerSelect.innerHTML = '';
    const otherPlayers = game.getGameState().players.filter(p => p.name !== currentPlayer.name && !p.isOut);
    otherPlayers.forEach(p => {
        const option = document.createElement('option');
        option.value = p.name;
        option.textContent = p.name;
        askPlayerSelect.appendChild(option);
    });

    // Create dynamic guess inputs
    guessInputsContainer.innerHTML = '';
    const suits = Object.values(Suit);
    const ranks = Object.values(Rank);

    suits.forEach(suit => {
        const select = document.createElement('select');
        select.id = `guess-card-${suit}`;
        select.innerHTML = `<option value="">-- Select a ${suit} --</option>`;
        ranks.forEach(rank => {
            const option = document.createElement('option');
            option.value = rank;
            option.textContent = `${rank} of ${suit}`;
            select.appendChild(option);
        });
        guessInputsContainer.appendChild(select);
    });

    // Check for game over
    const gameState = game.getGameState();
    if (gameState.gameOver) {
        alert(`${gameState.winner} wins!`);
        askButton.disabled = true;
        guessButton.disabled = true;
    }
}

// Event Listeners
askButton.addEventListener('click', () => {
    const currentPlayer = game.getCurrentPlayer();
    const askedPlayerName = askPlayerSelect.value;
    const askedSuit = askSuitSelect.value as Suit;

    if (!askedPlayerName || !askedSuit) {
        logMessage('Please select a player and a suit to ask.');
        return;
    }

    const revealedCard = game.askQuestion(currentPlayer.name, askedPlayerName, askedSuit);
    if (revealedCard) {
        logMessage(`${askedPlayerName} revealed: ${revealedCard.rank} of ${revealedCard.suit}`);
    } else {
        logMessage(`${askedPlayerName} has no cards of the ${askedSuit} suit.`);
    }

    game.nextTurn();
    updateUI();
});

guessButton.addEventListener('click', () => {
    const currentPlayer = game.getCurrentPlayer();
    const guess: Card[] = [];
    const suits = Object.values(Suit);
    
    // Collect the user's guess from the dropdowns
    for (const suit of suits) {
        const select = document.getElementById(`guess-card-${suit}`) as HTMLSelectElement;
        const rank = select.value;
        if (!rank) {
            logMessage('Please select a card for each suit to make a guess.');
            return;
        }
        guess.push({ rank: rank as Rank, suit: suit as Suit });
    }

    const isCorrect = game.makeGuess(currentPlayer.name, guess);
    if (isCorrect) {
        logMessage(`${currentPlayer.name} guessed correctly and wins the game!`, true);
    } else {
        logMessage(`${currentPlayer.name} guessed incorrectly and is now out of the game.`, true);
    }

    game.nextTurn();
    updateUI();
});

// Initialize the game
function init() {
    game = new ThrowdownGame(playerNames);
    logMessage('Game started. The vault contains 3 secret cards.');
    logMessage(`Players: ${playerNames.join(', ')}`);
    updateUI();
}

init();
