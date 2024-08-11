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
    // Basic validation: Move to an empty square or capture an opponent's piece
    const piece = board[fromRow][fromCol];
    const target = board[toRow][toCol];
    if (target === '' || (piece === piece.toUpperCase() && target === target.toLowerCase()) || (piece === piece.toLowerCase() && target === target.toUpperCase())) {
        return true;
    }
    return false;
}

renderBoard();
