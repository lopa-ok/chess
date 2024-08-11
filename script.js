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
}

function handleClick(row, col) {
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
        board[row][col] = board[selectedPiece.row][selectedPiece.col];
        board[selectedPiece.row][selectedPiece.col] = '';
        selectedPiece = null;
        turn = turn === 'white' ? 'black' : 'white';
        renderBoard();
    } else {
        selectedPiece = null;
    }
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

    switch (piece.toLowerCase()) {
        case 'p': // Pawn
            return validatePawnMove(piece, fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
        case 'r': // Rook
            return validateRookMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
        case 'n': // Knight
            return validateKnightMove(rowDiff, colDiff);
        case 'b': // Bishop
            return validateBishopMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
        case 'q': // Queen
            return validateQueenMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
        case 'k': // King
            return validateKingMove(rowDiff, colDiff);
        default:
            return false;
    }
}

function validatePawnMove(piece, fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    const direction = piece === 'P' ? -1 : 1;
    const startRow = piece === 'P' ? 6 : 1;
    if (colDiff === 0) { // Moving forward
        if (rowDiff === direction && board[toRow][toCol] === '') {
            return true;
        } else if (rowDiff === 2 * direction && fromRow === startRow && board[toRow][toCol] === '' && board[fromRow + direction][toCol] === '') {
            return true;
        }
    } else if (Math.abs(colDiff) === 1 && rowDiff === direction) { // Capturing
        if (board[toRow][toCol] !== '' && ((piece === 'P' && board[toRow][toCol] === board[toRow][toCol].toLowerCase()) || (piece === 'p' && board[toRow][toCol] === board[toRow][toCol].toUpperCase()))) {
            return true;
        }
    }
    return false;
}

function validateRookMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    if (rowDiff === 0 || colDiff === 0) { // Moving in a straight line
        return isPathClear(fromRow, fromCol, toRow, toCol);
    }
    return false;
}

function validateKnightMove(rowDiff, colDiff) {
    return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
}

function validateBishopMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    if (Math.abs(rowDiff) === Math.abs(colDiff)) { // Moving diagonally
        return isPathClear(fromRow, fromCol, toRow, toCol);
    }
    return false;
}

function validateQueenMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) {
    return validateRookMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff) || validateBishopMove(fromRow, fromCol, toRow, toCol, rowDiff, colDiff);
}

function validateKingMove(rowDiff, colDiff) {
    return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1; // Moving one square in any direction
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    while (currentRow !== toRow || currentCol !== toCol) {
        if (board[currentRow][currentCol] !== '') {
            return false;
        }
        currentRow += rowStep;
        currentCol += colStep;
    }
    return true;
}

renderBoard();
