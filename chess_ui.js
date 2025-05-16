let positionColor;
let myTurn;

function setColorTurn(color, turn) {
    initializeBoard(color);
    positionColor = color;
    myTurn = turn;
}

function createSquareClass(className) {
    let div = document.createElement("div");
    div.classList.add(className);
    return div;
}
const fromOverlaySquare = createSquareClass("overlay-square");
const toOverlaySquare = createSquareClass("overlay-square");
const highlightSquare = createSquareClass("highlight-square");

let moves = [];
function createAllSquares(color) {
    let squares = [];
    const blackHole = document.querySelector("#black-hole");
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = createSquareClass("square");
            if ((i + j) % 2 === 0) {
                square.classList.add("white");
            } else {
                square.classList.add("black");
            }
            square.classList.add(`cell-${i}${j}`);
            square.dataset.position = `${i}${j}`;
            square.addEventListener("click", () => {
                if (isCurrentMovePiece(i * 10 + j)) {
                    square.appendChild(highlightSquare);
                } else {
                    blackHole.appendChild(highlightSquare);
                }
                if(moves.length === 0) {
                    if (isCurrentMovePiece(i * 10 + j)) {
                        moves.push(square);
                    }
                } else if (moves.length === 1) {
                    if (myTurn === false) {
                        blackHole.appendChild(highlightSquare);
                        moves.length = 0;
                        return;
                    }
                    if (isCurrentMovePiece(i * 10 + j)) {
                        moves[0] = square;
                    } else {
                        moves.push(square);
                        handleLocalMove(Number(moves[0].dataset.position), i * 10 + j);
                    }
                }
            });
            squares.push(square);
        }
    }
    const board = document.querySelector("#board"); 
    if (color === 'b') {
        squares.reverse();
    }
    board.append(...squares);
}

function applyMove(moves) {
    if (moves[1].firstChild) {
        moves[1].removeChild(moves[1].firstChild);
    }
    moves[1].appendChild(moves[0].firstChild);
    moves[0].appendChild(fromOverlaySquare);
    moves[1].appendChild(toOverlaySquare);
}

function initializePieces(positions, pieces, color) {
    for (let i = 0; i < positions.length; i++) {
        const square = document.querySelector(".cell-" + positions[i]);
        const img = document.createElement("img");
        img.src = "pieces/" + pieces[i] + "-" + color + ".svg";
        square.appendChild(img);
    }
}

function initializeBoard(color) {
    createAllSquares(color);
    const whitePositions = ["60", "61", "62", "63", "64", "65", "66", "67", "70", "71", "72", "73", "74", "75", "76", "77"];
    const blackPositions = ["10", "11", "12", "13", "14", "15", "16", "17", "00", "01", "02", "03", "04", "05", "06", "07"];
    const pieces = ["pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn",
        "rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
    initializePieces(whitePositions, pieces, "w");
    initializePieces(blackPositions, pieces, "b");
}