class SnakeAndLadder {
    constructor() {
        this.boardSize = 100;
        this.currentPlayer = 1;
        this.players = {
            1: { position: 1, name: 'Player 1' },
            2: { position: 1, name: 'Player 2' }
        };
        this.gameOver = false;
        this.diceRolling = false;
        
        // Snake positions (from -> to)
        this.snakes = {
            16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
        };
        
        // Ladder positions (from -> to)
        this.ladders = {
            1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100
        };
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.createBoard();
        this.updateDisplay();
    }
    
    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        // Create board from 100 to 1 (bottom to top)
        for (let row = 9; row >= 0; row--) {
            for (let col = 0; col < 10; col++) {
                const cellNumber = row % 2 === 0 ? 
                    (row * 10 + col + 1) : 
                    (row * 10 + (10 - col));
                
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.textContent = cellNumber;
                cell.dataset.number = cellNumber;
                
                // Add snake or ladder styling
                if (this.snakes[cellNumber]) {
                    cell.classList.add('snake');
                    cell.innerHTML = `${cellNumber}<br>🐍`;
                } else if (this.ladders[cellNumber]) {
                    cell.classList.add('ladder');
                    cell.innerHTML = `${cellNumber}<br>🪜`;
                }
                
                gameBoard.appendChild(cell);
            }
        }
    }
    
    setupEventListeners() {
        document.getElementById('rollDice').addEventListener('click', () => this.rollDice());
        document.getElementById('newGame').addEventListener('click', () => this.newGame());
        document.getElementById('rules').addEventListener('click', () => this.showRules());
        document.querySelector('.close').addEventListener('click', () => this.hideRules());
        document.getElementById('rulesModal').addEventListener('click', (e) => {
            if (e.target.id === 'rulesModal') this.hideRules();
        });
        
        // Allow clicking on dice to roll
        document.getElementById('dice').addEventListener('click', () => this.rollDice());
    }
    
    async rollDice() {
        if (this.gameOver || this.diceRolling) return;
        
        this.diceRolling = true;
        const dice = document.getElementById('dice');
        const rollBtn = document.getElementById('rollDice');
        const diceResult = document.getElementById('diceResult');
        
        // Disable button and add rolling animation
        rollBtn.disabled = true;
        dice.classList.add('rolling');
        diceResult.textContent = '';
        
        // Simulate dice rolling
        const rollDuration = 600;
        const rollInterval = 100;
        const rolls = Math.floor(rollDuration / rollInterval);
        
        for (let i = 0; i < rolls; i++) {
            const randomNumber = Math.floor(Math.random() * 6) + 1;
            dice.querySelector('.dice-face').textContent = randomNumber;
            await this.sleep(rollInterval);
        }
        
        // Final roll
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        dice.querySelector('.dice-face').textContent = finalRoll;
        
        // Remove rolling animation
        dice.classList.remove('rolling');
        rollBtn.disabled = false;
        this.diceRolling = false;
        
        // Show result and move player
        diceResult.textContent = `You rolled a ${finalRoll}!`;
        this.movePlayer(finalRoll);
    }
    
    movePlayer(diceNumber) {
        const player = this.players[this.currentPlayer];
        const newPosition = player.position + diceNumber;
        
        // Check if player can move (can't exceed 100)
        if (newPosition > this.boardSize) {
            this.showMessage(`${player.name} needs exactly ${this.boardSize - player.position} to win!`);
            this.switchPlayer();
            return;
        }
        
        // Update position
        player.position = newPosition;
        
        // Check for snake
        if (this.snakes[newPosition]) {
            const oldPosition = newPosition;
            player.position = this.snakes[newPosition];
            this.showMessage(`${player.name} hit a snake! 🐍 Moved from ${oldPosition} to ${player.position}`);
        }
        
        // Check for ladder
        if (this.ladders[newPosition]) {
            const oldPosition = newPosition;
            player.position = this.ladders[newPosition];
            this.showMessage(`${player.name} climbed a ladder! 🪜 Moved from ${oldPosition} to ${player.position}`);
        }
        
        // Check for win
        if (player.position === this.boardSize) {
            this.gameOver = true;
            this.showMessage(`🎉 ${player.name} wins the game! 🎉`);
            document.getElementById('rollDice').disabled = true;
        } else {
            this.switchPlayer();
        }
        
        this.updateDisplay();
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Update player positions
        document.querySelector('.player1 .player-position').textContent = `Position: ${this.players[1].position}`;
        document.querySelector('.player2 .player-position').textContent = `Position: ${this.players[2].position}`;
        
        // Update active player
        document.querySelector('.player1').classList.toggle('active', this.currentPlayer === 1);
        document.querySelector('.player2').classList.toggle('active', this.currentPlayer === 2);
        
        // Update game status
        const gameStatus = document.getElementById('gameStatus');
        if (this.gameOver) {
            gameStatus.textContent = `Game Over! ${this.players[this.currentPlayer === 1 ? 2 : 1].name} wins!`;
            gameStatus.style.background = '#dc3545';
        } else {
            gameStatus.textContent = `${this.players[this.currentPlayer].name}'s turn`;
            gameStatus.style.background = '#28a745';
        }
        
        // Update board display
        this.updateBoardDisplay();
    }
    
    updateBoardDisplay() {
        // Remove all player tokens from board
        document.querySelectorAll('.player-token').forEach(token => token.remove());
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('player1-here', 'player2-here', 'both-players');
        });
        
        // Add player tokens to current positions
        const player1Cell = document.querySelector(`[data-number="${this.players[1].position}"]`);
        const player2Cell = document.querySelector(`[data-number="${this.players[2].position}"]`);
        
        if (player1Cell && player2Cell && this.players[1].position === this.players[2].position) {
            // Both players on same cell
            player1Cell.classList.add('both-players');
            this.addPlayerToken(player1Cell, 1);
            this.addPlayerToken(player1Cell, 2);
        } else {
            // Separate positions
            if (player1Cell) {
                player1Cell.classList.add('player1-here');
                this.addPlayerToken(player1Cell, 1);
            }
            if (player2Cell) {
                player2Cell.classList.add('player2-here');
                this.addPlayerToken(player2Cell, 2);
            }
        }
    }
    
    addPlayerToken(cell, playerNumber) {
        const token = document.createElement('div');
        token.className = `player-token player${playerNumber}`;
        token.style.left = playerNumber === 1 ? '25%' : '75%';
        cell.appendChild(token);
    }
    
    showMessage(message) {
        const diceResult = document.getElementById('diceResult');
        diceResult.textContent = message;
        
        // Clear message after 3 seconds
        setTimeout(() => {
            if (diceResult.textContent === message) {
                diceResult.textContent = '';
            }
        }, 3000);
    }
    
    newGame() {
        this.currentPlayer = 1;
        this.players = {
            1: { position: 1, name: 'Player 1' },
            2: { position: 1, name: 'Player 2' }
        };
        this.gameOver = false;
        this.diceRolling = false;
        
        document.getElementById('rollDice').disabled = false;
        document.getElementById('diceResult').textContent = '';
        document.getElementById('dice').querySelector('.dice-face').textContent = '1';
        
        this.updateDisplay();
    }
    
    showRules() {
        document.getElementById('rulesModal').style.display = 'block';
    }
    
    hideRules() {
        document.getElementById('rulesModal').style.display = 'none';
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeAndLadder();
}); 