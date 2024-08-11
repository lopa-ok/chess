const chessboard = document.getElementById('chessboard');
const pieces = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

let board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let selectedPiece = null;
let turn = 'white';
let kingPositions = { 'white': [7, 4], 'black': [0, 4] };
let canCastle = { 'white': { 'kingSide': true, 'queenSide': true }, 'black': { 'kingSide': true, 'queenSide': true } };
let enPassantTarget = null;
let moveHistory = [];
let isGameOver = false;

function renderBoard() {
    chessboard.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((i + j) % 2 === 0 ? 'white' : 'black');
            square.dataset.row = i;
            square.dataset.col = j;
            if (board[i][j]) {
                square.innerText = pieces[board[i][j]];
            }
            square.addEventListener('click', () => handleClick(i, j));
            chessboard.appendChild(square);
        }
    }

    if (isGameOver) {
        displayGameOverMessage();
    }
}

function handleClick(row, col) {
    if (isGameOver) return;

    if (selectedPiece) {
        movePiece(row, col);
    } else {
        selectPiece(row, col);
    }
}

function selectPiece(row, col) {
    const piece = board[row][col];
    if (piece && ((turn === 'white' && piece === piece.toUpperCase()) || (turn === 'black' && piece === piece.toLowerCase()))) {
        selectedPiece = { piece, row, col };
    }
}

function movePiece(row, col) {
    if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
        const [fromRow, fromCol] = [selectedPiece.row, selectedPiece.col];
        const piece = board[fromRow][fromCol];
        const capturedPiece = board[row][col];

        // Handle special moves
        if (piece.toLowerCase() === 'k' && Math.abs(fromCol - col) === 2) {
            // Castling
            if (col === 6) { // King-side castling
                board[fromRow][5] = board[fromRow][7];
                board[fromRow][7] = '';
            } else if (col === 2) { // Queen-side castling
                board[fromRow][3] = board[fromRow][0];
                board[fromRow][0] = '';
            }
        } else if (piece.toLowerCase() === 'p' && col !== fromCol && board[row][col] === '') {
            // En Passant
            board[fromRow][col] = '';
        }

        // Move the piece
        board[row][col] = board[fromRow][fromCol];
        board[fromRow][fromCol] = '';

        // Update king position
        if (piece.toLowerCase() === 'k') {
            kingPositions[turn] = [row, col];
            canCastle[turn].kingSide = false;
            canCastle[turn].queenSide = false;
        } else if (piece.toLowerCase() === 'r') {
            if (fromCol === 0) {
                canCastle[turn].queenSide = false;
            } else if (fromCol === 7) {
                canCastle[turn].kingSide = false;
            }
        }

        // Pawn promotion
        if (piece === 'P' && row === 0) {
            promotePawn(row, col);
        } else if (piece === 'p' && row === 7) {
            promotePawn(row, col);
        }

        // Handle en passant target
        if (piece.toLowerCase() === 'p' && Math.abs(row - fromRow) === 2) {
            enPassantTarget = [row - Math.sign(row - fromRow), col];
        } else {
            enPassantTarget = null;
        }

        // Save the move to history
        moveHistory.push({ fromRow, fromCol, toRow, toCol, capturedPiece });

        // Check for checkmate or stalemate
        if (isCheckmate()) {
            isGameOver = true;
            renderBoard();
        } else if (isStalemate()) {
            isGameOver = true;
            renderBoard();
        } else {
            turn = turn === 'white' ? 'black' : 'white';
            renderBoard();
        }
    } else {
        selectedPiece = null;
    }
}

function promotePawn(row, col) {
    const promotionChoice = prompt("Promote to (Q/R/B/N):");
    const promotionPiece = { 'Q': 'Q', 'R': 'R', 'B': 'B', 'N': 'N' }[promotionChoice.toUpperCase()] || 'Q';
    board[row][col] = turn === 'white' ? promotionPiece : promotionPiece.toLowerCase();
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const target = board[toRow][toCol];

    // Ensure the move is within the board limits
    if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) {
        return false;
    }

    // Ensure the target square is empty or occupied by an opponent's piece
    if (target !== '' && ((piece === piece.toUpperCase() && target === target.toUpperCase()) || (piece === piece.toLowerCase() && target === target.toLowerCase()))) {
        return false;
    }

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    // Check for specific piece movement
    let valid = false;
    switch (piece.toLowerCase()) {
        case 'p': // Pawn
            valid = validatePawnMove(piece, fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
            break;
        case 'r': // Rook
            valid = validateRookMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
            break;
        case 'n': // Knight
            valid = validateKnightMove(rowDiff, colDiff);
            break;
        case 'b': // Bishop
            valid = validateBishopMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
            break;
        case 'q': // Queen
            valid = validateQueenMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
            break;
        case 'k': // King
            valid = validateKingMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
            break;
        default:
            valid = false;
    }

    // Prevent moving into check
    if (valid && !isInCheckAfterMove(fromRow, fromCol, toRow, toCol)) {
        return true;
    }

    return false;
}

function validatePawnMove(piece, fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    const direction = piece === 'P' ? -1 : 1;
    const startRow = piece === 'P' ? 6 : 1;

    if (colDiff === 0) { // Moving forward
        if (rowDiff === direction && board[toRow][toCol] === '') {
            return true;
        } else if (rowDiff === 2 * direction && fromRow === startRow && board[toRow][toCol] === '' && board[fromRow + direction][fromCol] === '') {
            return true;
        }
    } else if (Math.abs(colDiff) === 1 && rowDiff === direction && board[toRow][toCol] !== '') { // Capturing
        return true;
    } else if (enPassantTarget && toRow === enPassantTarget[0] && toCol === enPassantTarget[1]) { // En passant
        return true;
    }

    return false;
}

function validateRookMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    if (rowDiff === 0 || colDiff === 0) { // Moving in a straight line
        for (let i = 1; i < Math.abs(rowDiff || colDiff); i++) {
            if (board[fromRow + i * Math.sign(rowDiff)][fromCol + i * Math.sign(colDiff)] !== '') {
                return false;
            }
        }
        return true;
    }
    return false;
}

function validateKnightMove(rowDiff, colDiff) {
    return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
}

function validateBishopMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    if (Math.abs(rowDiff) === Math.abs(colDiff)) { // Moving diagonally
        for (let i = 1; i < Math.abs(rowDiff); i++) {
            if (board[fromRow + i * Math.sign(rowDiff)][fromCol + i * Math.sign(colDiff)] !== '') {
                return false;
            }
        }
        return true;
    }
    return false;
}

function validateQueenMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    return validateRookMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) || validateBishopMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
}

function validateKingMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) { // Moving one square in any direction
        return true;
    }

    // Castling
    if (fromRow === toRow && Math.abs(colDiff) === 2) {
        if (colDiff === 2 && canCastle[turn].kingSide) { // King-side castling
            return board[fromRow][5] === '' && board[fromRow][6] === '' && !isInCheck() && !isInCheckAfterMove(fromRow, fromCol, fromRow, 5) && !isInCheckAfterMove(fromRow, fromCol, toRow, toCol);
        } else if (colDiff === -2 && canCastle[turn].queenSide) { // Queen-side castling
            return board[fromRow][3] === '' && board[fromRow][2] === '' && board[fromRow][1] === '' && !isInCheck() && !isInCheckAfterMove(fromRow, fromCol, fromRow, 3) && !isInCheckAfterMove(fromRow, fromCol, toRow, toCol);
        }
    }

    return false;
}

function isInCheck() {
    const [kingRow, kingCol] = kingPositions[turn];
    return isSquareUnderAttack(kingRow, kingCol);
}

function isInCheckAfterMove(fromRow, fromCol, toRow, toCol) {
    const tempBoard = board.map(row => row.slice());
    const tempKingPositions = { ...kingPositions };

    const piece = tempBoard[fromRow][fromCol];
    tempBoard[toRow][toCol] = piece;
    tempBoard[fromRow][fromCol] = '';

    if (piece.toLowerCase() === 'k') {
        tempKingPositions[turn] = [toRow, toCol];
    }

    const [kingRow, kingCol] = tempKingPositions[turn];
    return isSquareUnderAttack(kingRow, kingCol, tempBoard);
}

function isSquareUnderAttack(row, col, tempBoard = board) {
    const opponent = turn === 'white' ? 'black' : 'white';

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = tempBoard[i][j];
            if (piece && ((opponent === 'white' && piece === piece.toUpperCase()) || (opponent === 'black' && piece === piece.toLowerCase()))) {
                if (isValidMove(i, j, row, col)) {
                    return true;
                }
            }
        }
    }

    return false;
}

function isCheckmate() {
    const [kingRow, kingCol] = kingPositions[turn];
    if (!isInCheck()) return false;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j] && ((turn === 'white' && board[i][j] === board[i][j].toUpperCase()) || (turn === 'black' && board[i][j] === board[i][j].toLowerCase()))) {
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        if (isValidMove(i, j, row, col)) {
                            return false;
                        }
                    }
                }
            }
        }
    }

    return true;
}

function isStalemate() {
    const [kingRow, kingCol] = kingPositions[turn];
    if (isInCheck()) return false;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j] && ((turn === 'white' && board[i][j] === board[i][j].toUpperCase()) || (turn === 'black' && board[i][j] === board[i][j].toLowerCase()))) {
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        if (isValidMove(i, j, row, col)) {
                            return false;
                        }
                    }
                }
            }
        }
    }

    return true;
}

function displayGameOverMessage() {
    const message = isCheckmate() ? (turn === 'white' ? 'Black wins by checkmate!' : 'White wins by checkmate!') : 'Game ends in a draw (stalemate).';
    alert(message);
}

function undoMove() {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory.pop();
    const { fromRow, fromCol, toRow, toCol, capturedPiece } = lastMove;
    const piece = board[toRow][toCol];

    board[fromRow][fromCol] = piece;
    board[toRow][toCol] = capturedPiece;

    // Update king position if needed
    if (piece.toLowerCase() === 'k') {
        kingPositions[turn] = [fromRow, fromCol];
    }

    // Revert castling rights
    if (piece.toLowerCase() === 'r') {
        if (fromCol === 0) {
            canCastle[turn].queenSide = true;
        } else if (fromCol === 7) {
            canCastle[turn].kingSide = true;
        }
    }

    // Handle en passant target revert
    if (enPassantTarget && enPassantTarget[0] === toRow && enPassantTarget[1] === toCol) {
        board[toRow][toCol] = '';
    }

    turn = turn === 'white' ? 'black' : 'white';
    renderBoard();
}

renderBoard();
