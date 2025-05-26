function setColorTurn(color) {
    initializeBoard(color);
}

function createSquareClass(className) {
    let div = document.createElement("div");
    div.classList.add(className);
    return div;
}
const fromOverlaySquare = createSquareClass("overlay-square");
const toOverlaySquare = createSquareClass("overlay-square");
const highlightSquare = createSquareClass("highlight-square");

function createAllSquares(color) {
    let squares = [];
    const board = document.querySelector("#board");
    board.innerHTML = "";
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
            squares.push(square);
        }
    }
    if (color === 'b') {
        squares.reverse();
    }
    board.append(...squares);
}

let piecesBeforeMove = [];
function handleMove(moves, pos) {
    let currentPiecesBeforeMove = [];
    for (let move of moves) {
        let [fromPosition, toPosition, capturePosition, toPiece] = move;
        let moveElems = [getSquareByPosition(fromPosition), getSquareByPosition(toPosition), getSquareByPosition(capturePosition), generatePiece(toPiece)];
        currentPiecesBeforeMove.push([moveElems[0].firstChild.dataset.piece, moveElems?.[2]?.firstChild?.dataset?.value]);
        applyMove(moveElems);
    }
    piecesBeforeMove[pos] = currentPiecesBeforeMove;
}

function undoMove(moves, pos) {
    for (let i = 0; i < moves.length; i++) {
        let [fromPosition, toPosition, capturePosition, _] = moves[i];
        let [fromPieceBeforeMove, capturePieceBeforeMove] = piecesBeforeMove[pos][i];
        let moveElems = [getSquareByPosition(fromPosition), getSquareByPosition(toPosition), getSquareByPosition(capturePosition)];
        let fromElem = generatePiece(fromPieceBeforeMove);
        let captureElem = generatePiece(capturePieceBeforeMove);
        if (capturePieceBeforeMove) {
            moveElems[2].appendChild(captureElem);
        }
        moveElems[1].replaceChildren();
        moveElems[0].appendChild(fromElem);
    }
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
}

function getSquareByPosition(position) {
    return document.querySelector(".cell-" + (position < 10 ? "0" + position : position + ""));
}

function generatePiece(piece) {
    const img = document.createElement("img");
    img.dataset.piece = piece;
    img.src = "../piece/" + piece + ".svg";
    return img;
}

function initializePieces(positions, pieces, color) {
    for (let i = 0; i < positions.length; i++) {
        const square = document.querySelector(".cell-" + positions[i]);
        square.appendChild(generatePiece(color + pieces[i]));
    }
}

function initializeBoard(color) {
    piecesBeforeMove = [];
    createAllSquares(color);
    const whitePositions = ["60", "61", "62", "63", "64", "65", "66", "67", "70", "71", "72", "73", "74", "75", "76", "77"];
    const blackPositions = ["10", "11", "12", "13", "14", "15", "16", "17", "00", "01", "02", "03", "04", "05", "06", "07"];
    const pieces = ["p", "p", "p", "p", "p", "p", "p", "p", "r", "n", "b", "q", "k", "b", "n", "r"];
    initializePieces(whitePositions, pieces, "w");
    initializePieces(blackPositions, pieces, "b");
}