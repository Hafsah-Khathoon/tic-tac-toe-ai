
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const gameState = document.getElementById("game-state");

const humanScore = document.getElementById("human-score");
const aiScore = document.getElementById("ai-score");
const drawScore = document.getElementById("draw-score");

const newGameButton = document.getElementById("new-game");
const resetScoreButton = document.getElementById("reset-score");

let board = Array(9).fill("");
let gameOver = false;
let busy = false;

let scores = JSON.parse(
    localStorage.getItem("ticTacToeScores") ||
    '{"human":0,"ai":0,"draw":0}'
);

function updateScores() {
    humanScore.textContent = scores.human;
    aiScore.textContent = scores.ai;
    drawScore.textContent = scores.draw;

    localStorage.setItem(
        "ticTacToeScores",
        JSON.stringify(scores)
    );
}

function renderBoard() {
    cells.forEach((cell, index) => {
        cell.textContent = board[index];
        cell.classList.toggle("o-mark", board[index] === "O");
        cell.classList.remove("winning");

        cell.disabled = gameOver || busy || board[index] !== "";
    });
}

function getWinningLine() {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    return lines.find(([a, b, c]) =>
        board[a] &&
        board[a] === board[b] &&
        board[b] === board[c]
    );
}

function finishGame(result) {
    gameOver = true;

    if (result === "X") {
        statusText.textContent = "You win!";
        gameState.textContent = "You won";
        scores.human++;
    } else if (result === "O") {
        statusText.textContent = "AI wins!";
        gameState.textContent = "AI won";
        scores.ai++;
    } else {
        statusText.textContent = "It's a draw!";
        gameState.textContent = "Draw";
        scores.draw++;
    }

    const winningLine = getWinningLine();

    if (winningLine) {
        winningLine.forEach(index => {
            cells[index].classList.add("winning");
        });
    }

    updateScores();
    renderBoard();
}

async function playMove(index) {
    if (gameOver || busy || board[index] !== "") {
        return;
    }

    board[index] = "X";

    let result = getWinner(board);

    if (result) {
        finishGame(result);
        return;
    }

    renderBoard();
    busy = true;
    statusText.textContent = "AI is thinking...";
    gameState.textContent = "Thinking";
    renderBoard();

    try {
        const response = await fetch("/api/move", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ board })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "AI request failed");
        }

        board = data.board;

        result = data.winner;

        if (result) {
            finishGame(result);
        } else {
            statusText.textContent = "Your turn — X";
            gameState.textContent = "Playing";
        }
    } catch (error) {
        console.error(error);
        statusText.textContent = "Connection error. Try again.";
        gameState.textContent = "Error";
    } finally {
        busy = false;
        renderBoard();
    }
}

function getWinner(currentBoard) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of lines) {
        if (
            currentBoard[a] &&
            currentBoard[a] === currentBoard[b] &&
            currentBoard[b] === currentBoard[c]
        ) {
            return currentBoard[a];
        }
    }

    if (currentBoard.every(cell => cell !== "")) {
        return "draw";
    }

    return null;
}

function startNewGame() {
    board = Array(9).fill("");
    gameOver = false;
    busy = false;

    statusText.textContent = "Your turn — X";
    gameState.textContent = "Playing";

    renderBoard();
}

cells.forEach((cell, index) => {
    cell.addEventListener("click", () => playMove(index));
});

newGameButton.addEventListener("click", startNewGame);

resetScoreButton.addEventListener("click", () => {
    scores = { human: 0, ai: 0, draw: 0 };
    updateScores();
});

updateScores();
renderBoard();
