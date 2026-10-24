
HUMAN = "X"
AI = "O"


def check_winner(board):
    winning_lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]

    for line in winning_lines:
        a, b, c = line

        if board[a] and board[a] == board[b] == board[c]:
            return board[a]

    if "" not in board:
        return "draw"

    return None


def minimax(board, is_maximizing):
    result = check_winner(board)

    if result == AI:
        return 1
    if result == HUMAN:
        return -1
    if result == "draw":
        return 0

    if is_maximizing:
        best_score = -float("inf")

        for i in range(9):
            if board[i] == "":
                board[i] = AI
                score = minimax(board, False)
                board[i] = ""
                best_score = max(best_score, score)

        return best_score

    best_score = float("inf")

    for i in range(9):
        if board[i] == "":
            board[i] = HUMAN
            score = minimax(board, True)
            board[i] = ""
            best_score = min(best_score, score)

    return best_score


def get_ai_move(board):
    best_score = -float("inf")
    best_move = None

    for i in range(9):
        if board[i] == "":
            board[i] = AI
            score = minimax(board, False)
            board[i] = ""

            if score > best_score:
                best_score = score
                best_move = i

    return best_move
