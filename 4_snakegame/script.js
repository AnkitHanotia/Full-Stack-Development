class SnakeGame {
  constructor() {
    console.log("SnakeGame constructor called");
    this.canvas = document.getElementById("gameCanvas");
    console.log("Canvas found:", this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize;

    // Game state
    this.gameRunning = false;
    this.gamePaused = false;
    this.score = 0;
    this.highScore = localStorage.getItem("snakeHighScore") || 0;

    this.snake = [{ x: 10, y: 10 }];
    this.dx = 0;
    this.dy = 0;
    this.speed = 150;

    this.foodTypes = [
      { color: "#ff6b6b", points: 1, probability: 0.7 }, // Red bug
      { color: "#4ecdc4", points: 2, probability: 0.2 }, // Green bug
      { color: "#45b7d1", points: 3, probability: 0.1 }, // Blue bug
    ];
    this.currentFoodType = this.foodTypes[0];
    this.food = this.generateFood();

    this.updateHighScore();
    this.setupEventListeners();
    this.draw();
    console.log("SnakeGame initialization complete");
  }

  setupEventListeners() {
    console.log("Setting up event listeners...");

    document.addEventListener("keydown", (e) => {
      if (!this.gameRunning || this.gamePaused) return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (this.dy !== 1) {
            this.dx = 0;
            this.dy = -1;
          }
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (this.dy !== -1) {
            this.dx = 0;
            this.dy = 1;
          }
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (this.dx !== 1) {
            this.dx = -1;
            this.dy = 0;
          }
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (this.dx !== -1) {
            this.dx = 1;
            this.dy = 0;
          }
          break;
      }
    });

    const startBtn = document.getElementById("startBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const restartBtn = document.getElementById("restartBtn");
    const playAgainBtn = document.getElementById("playAgainBtn");

    console.log("Start button found:", startBtn);

    startBtn.addEventListener("click", () => {
      console.log("Start button clicked!");
      this.startGame();
    });
    pauseBtn.addEventListener("click", () => this.togglePause());
    restartBtn.addEventListener("click", () => this.restartGame());
    playAgainBtn.addEventListener("click", () => this.restartGame());
  }

  startGame() {
    console.log("startGame called, gameRunning:", this.gameRunning);
    if (!this.gameRunning) {
      console.log("Starting the game...");
      this.gameRunning = true;
      this.gamePaused = false;
      this.gameLoop();
      document.getElementById("startBtn").disabled = true;
      document.getElementById("pauseBtn").disabled = false;
      console.log("Game started successfully");
    }
  }

  togglePause() {
    if (this.gameRunning) {
      this.gamePaused = !this.gamePaused;
      if (!this.gamePaused) {
        this.gameLoop();
      }
      document.getElementById("pauseBtn").textContent = this.gamePaused
        ? "Resume"
        : "Pause";
    }
  }

  restartGame() {
    this.gameRunning = false;
    this.gamePaused = false;
    this.score = 0;
    this.snake = [{ x: 10, y: 10 }];
    this.dx = 0;
    this.dy = 0;
    this.food = this.generateFood();
    this.updateScore();
    this.hideGameOver();
    document.getElementById("startBtn").disabled = false;
    document.getElementById("pauseBtn").disabled = true;
    document.getElementById("pauseBtn").textContent = "Pause";
    this.draw();
  }

  gameLoop() {
    if (!this.gameRunning || this.gamePaused) return;

    this.update();
    this.draw();

    setTimeout(() => {
      if (this.gameRunning && !this.gamePaused) {
        this.gameLoop();
      }
    }, this.speed);
  }

  update() {
    if (this.dx === 0 && this.dy === 0) {
      return;
    }

    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

    if (
      head.x < 0 ||
      head.x >= this.tileCount ||
      head.y < 0 ||
      head.y >= this.tileCount
    ) {
      this.gameOver();
      return;
    }

    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        this.gameOver();
        return;
      }
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += this.currentFoodType.points;
      this.updateScore();
      this.food = this.generateFood();
      this.speed = Math.max(40, this.speed - 1);
    } else {
      this.snake.pop();
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = "#2d3748";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawSnake();
    this.drawFood();
  }

  drawGrid() {
    this.ctx.strokeStyle = "#4a5568";
    this.ctx.lineWidth = 0.5;

    for (let i = 0; i <= this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }
  }

  drawSnake() {
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        this.ctx.fillStyle = "#48bb78";
        this.ctx.fillRect(
          segment.x * this.gridSize,
          segment.y * this.gridSize,
          this.gridSize,
          this.gridSize
        );

        // Eyes
        this.ctx.fillStyle = "#2f855a";
        const eyeSize = 3;
        this.ctx.fillRect(
          segment.x * this.gridSize + 4,
          segment.y * this.gridSize + 4,
          eyeSize,
          eyeSize
        );
        this.ctx.fillRect(
          segment.x * this.gridSize + 13,
          segment.y * this.gridSize + 4,
          eyeSize,
          eyeSize
        );
      } else {
        // Body
        this.ctx.fillStyle = "#68d391";
        this.ctx.fillRect(
          segment.x * this.gridSize,
          segment.y * this.gridSize,
          this.gridSize,
          this.gridSize
        );
      }

      // Border
      this.ctx.strokeStyle = "#38a169";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(
        segment.x * this.gridSize,
        segment.y * this.gridSize,
        this.gridSize,
        this.gridSize
      );
    });
  }

  drawFood() {
    // Main food circle
    this.ctx.fillStyle = this.currentFoodType.color;
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * this.gridSize + this.gridSize / 2,
      this.food.y * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2,
      0,
      2 * Math.PI
    );
    this.ctx.fill();

    // Food border
    this.ctx.strokeStyle = "#2d3748";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Add some detail to make it look like a bug
    this.ctx.fillStyle = "#2d3748";
    this.ctx.fillRect(
      this.food.x * this.gridSize + 6,
      this.food.y * this.gridSize + 6,
      2,
      2
    );
    this.ctx.fillRect(
      this.food.x * this.gridSize + 12,
      this.food.y * this.gridSize + 6,
      2,
      2
    );
  }

  generateFood() {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount),
      };
    } while (
      this.snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );

    // Select food type based on probability
    const rand = Math.random();
    let cumulative = 0;
    for (const foodType of this.foodTypes) {
      cumulative += foodType.probability;
      if (rand <= cumulative) {
        this.currentFoodType = foodType;
        break;
      }
    }

    return newFood;
  }

  updateScore() {
    document.getElementById("score").textContent = this.score;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("snakeHighScore", this.highScore);
      this.updateHighScore();
    }
  }

  updateHighScore() {
    document.getElementById("highScore").textContent = this.highScore;
  }

  gameOver() {
    this.gameRunning = false;
    document.getElementById("finalScore").textContent = this.score;
    this.showGameOver();
    document.getElementById("startBtn").disabled = false;
    document.getElementById("pauseBtn").disabled = true;
  }

  showGameOver() {
    document.getElementById("gameOver").classList.add("show");
  }

  hideGameOver() {
    document.getElementById("gameOver").classList.remove("show");
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded, initializing SnakeGame...");
  new SnakeGame();
});
