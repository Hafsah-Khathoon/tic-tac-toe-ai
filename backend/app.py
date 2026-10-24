
from flask import Flask, request, jsonify, send_from_directory
from pathlib import Path
from game_logic import check_winner, get_ai_move

# Get the project and frontend folders
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

# Configure Flask to serve CSS and JavaScript from frontend
app = Flask(
    __name__,
    static_folder=str(FRONTEND_DIR),
    static_url_path="/static"
)


# Display the game page
@app.route("/")
def home():
    return send_from_directory(str(FRONTEND_DIR), "index.html")


# Handle AI moves
@app.route("/api/move", methods=["POST"])
def make_move():
    data = request.get_json(silent=True) or {}
    board = data.get("board")

    # Validate the board
    if not isinstance(board, list) or len(board) != 9:
        return jsonify({"error": "Invalid board"}), 400

    # Validate cell values
    if any(cell not in ("X", "O", "") for cell in board):
        return jsonify({"error": "Invalid cell value"}), 400

    # Human must have just played X
    if board.count("X") != board.count("O") + 1:
        return jsonify({"error": "Invalid turn order"}), 400

    # Validate move counts
    if board.count("X") > 5 or board.count("O") > 4:
        return jsonify({"error": "Invalid move count"}), 400

    # Reject a finished game
    if check_winner(board) is not None:
        return jsonify({"error": "Game has already ended"}), 400

    # Calculate the AI's best move using Minimax
    move = get_ai_move(board)

    if move is None:
        return jsonify({"error": "No available moves"}), 400

    board[move] = "O"

    # Return the updated board and result
    return jsonify({
        "board": board,
        "winner": check_winner(board)
    })


if __name__ == "__main__":
    app.run(debug=True)
