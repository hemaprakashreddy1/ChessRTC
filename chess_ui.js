let positionColor;
let myTurn;
let selectedPromotionMove;
let selectedPromotionPiece;

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
    const board = document.querySelector("#board"); 
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
                    } else if (isCurrentMovePiece(i * 10 + j)) {
                        moves[0] = square;
                    } else {
                        let moveOnePosition = Number(moves[0].dataset.position);
                        if (getPiece(moveOnePosition) === positionColor + 'p') {
                            if (positionColor === 'w') {
                                if (row(moveOnePosition) === 1 && i === 0) {
                                    selectedPromotionMove = [moveOnePosition, i * 10 + j];
                                    board.appendChild(createPawnPromotionWindow(positionColor));
                                } else {
                                    handleLocalMove(moveOnePosition, i * 10 + j, "");
                                }
                            } else {
                                if (row(moveOnePosition) === 6 && i === 7) {
                                    selectedPromotionMove = [moveOnePosition, i * 10 + j];
                                    board.appendChild(createPawnPromotionWindow(positionColor));
                                } else {
                                    handleLocalMove(moveOnePosition, i * 10 + j, "");
                                }
                            }
                        } else {
                            handleLocalMove(Number(moves[0].dataset.position), i * 10 + j, "");
                        }
                        moves.length = 0;
                    }
                }
            });
            squares.push(square);
        }
    }
    if (color === 'b') {
        squares.reverse();
    }
    board.append(...squares);
}

function applyMove(moves) {
    if (moves[1].firstChild) {
        moves[1].removeChild(moves[1].firstChild);
    }
    if (moves[2].firstChild) {
        moves[2].removeChild(moves[2].firstChild);
    }
    moves[0].removeChild(moves[0].firstChild);
    moves[1].appendChild(moves[3]);
    moves[0].appendChild(fromOverlaySquare);
    moves[1].appendChild(toOverlaySquare);
}

function addGameStatusMessage(fromLocal, message) {
    let color, oppositeColor;
    if (positionColor === 'w') {
        color = "white";
        oppositeColor = "black";
    } else {
        color = "black";
        oppositeColor = "white";
    }
    if (message === "checkmate") {
        if (fromLocal) {
            message = color + " won by checkmate";
        } else {
            message = oppositeColor + " won by checkmate";
        }
    }
    const game = document.querySelector("#game");
    const h3 = document.createElement("h3");
    h3.innerText = message;
    game.appendChild(h3);
}

function getSquareByPosition(position) {
    return document.querySelector(".cell-" + (position < 10 ? "0" + position : position + ""));
}

function generatePiece(piece) {
    const img = document.createElement("img");
    img.src = "piece/" + piece + ".svg";
    return img;
}

function initializePieces(positions, pieces, color) {
    for (let i = 0; i < positions.length; i++) {
        const square = document.querySelector(".cell-" + positions[i]);
        square.appendChild(generatePiece(color + pieces[i]));
    }
}

function createPawnPromotionWindow(color) {
    let transparentWindow = document.createElement('div');
    transparentWindow.className = 'transparent-window';
    let flexContainer = document.createElement('div');
    flexContainer.className = 'flex-container';
    let pieces = ['q', 'r', 'b', 'n'];
    for (let piece of pieces) {
        let square = createSquareClass('square');
        square.addEventListener('click', () => {
            selectedPromotionPiece = color + piece;
        });

        let img = generatePiece(color + piece);
        square.appendChild(img);
        flexContainer.appendChild(square);
    }
    transparentWindow.appendChild(flexContainer);
    transparentWindow.addEventListener('click', function() {
        if (selectedPromotionPiece) {
            handleLocalMove(selectedPromotionMove[0], selectedPromotionMove[1], selectedPromotionPiece);
        }
        selectedPromotionMove = null;
        selectedPromotionPiece = null;
        this.remove();
    });
    return transparentWindow;
}

function initializeBoard(color) {
    createAllSquares(color);
    const whitePositions = ["60", "61", "62", "63", "64", "65", "66", "67", "70", "71", "72", "73", "74", "75", "76", "77"];
    const blackPositions = ["10", "11", "12", "13", "14", "15", "16", "17", "00", "01", "02", "03", "04", "05", "06", "07"];
    const pieces = ["p", "p", "p", "p", "p", "p", "p", "p", "r", "n", "b", "q", "k", "b", "n", "r"];
    initializePieces(whitePositions, pieces, "w");
    initializePieces(blackPositions, pieces, "b");
}