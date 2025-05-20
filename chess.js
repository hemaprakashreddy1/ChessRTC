const board = [];

const N = -10, S = 10, E = 1, W = -1, NW = -11, NE = -9, SW = 9, SE = 11;
const directionOffSets = [N, E, W, S, NE, NW, SE, SW];
const oppDirectionOffSets = [S, W, E, N, SW, SE, NW, NE];
const rookDirections = [N, E, W, S];
const bishopDirections = [NE, NW, SE, SW];
let whiteKingPosition = 74, blackKingPosition = 4;
let whiteMove = true;

let gameState = 0;
const gameStates = ["on", "check mate", "stale mate"];

const stepsToEdges = [];
function generateStepsToEdges() {
    let north, east, west, south, northEast, northWest, southEast, southWest;
    for(let row = 0; row < 8; row++) {
        stepsToEdges[row] = [];
        for(let col = 0; col < 8; col++) {
            stepsToEdges[row][col] = [];
            north = row;
            east = 7 - col;
            west = col;
            south = 7 - row;
            northEast = Math.min(north, east);
            northWest = Math.min(north, west);
            southEast = Math.min(south, east);
            southWest = Math.min(south, west);
            
            stepsToEdges[row][col][0] = north;
            stepsToEdges[row][col][1] = east;
            stepsToEdges[row][col][2] = west;
            stepsToEdges[row][col][3] = south;
            stepsToEdges[row][col][4] = northEast;
            stepsToEdges[row][col][5] = northWest;
            stepsToEdges[row][col][6] = southEast;
            stepsToEdges[row][col][7] = southWest;
        }
    }
}
generateStepsToEdges();

function initChessBoard() {
    for (let i = 0; i < 8; i++) {
        board[i] = Array(8);
        for (let j = 0; j < 8; j++) {
            board[i][j] = "";
        }
    }
    board[0][0] = "br", board[0][1] = "bn", board[0][2] = "bb", board[0][3] = "bq";
    board[0][4] = "bk", board[0][5] = "bb", board[0][6] = "bn", board[0][7] = "br";
    board[7][0] = "wr", board[7][1] = "wn", board[7][2] = "wb", board[7][3] = "wq";
    board[7][4] = "wk", board[7][5] = "wb", board[7][6] = "wn", board[7][7] = "wr";
    for (let i = 0; i < 8; i++) {
        board[1][i] = "bp";
        board[6][i] = "wp";
    } 
}
initChessBoard();

function row(x) {
    return Math.floor(x / 10);
}

function column(x) {
    return x % 10;
}

function isValidPos(x) {
    let r = row(x);
    let c = column(x);
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function getPiece(x) {
    return board[row(x)][column(x)];
}

function makeMove(from, to) {
    /*
    return type
    0 move failed
    1 move success
    2 move success and checkmate
    3 move success and stalemate
    */
    if (validateMove(from, to)) {
        whiteMove = !whiteMove;
        let fromPiece = getPiece(from);
        if (fromPiece[1] == 'k') {
            if (fromPiece[0] == 'b') {
                blackKingPosition = to;
            } else {
                whiteKingPosition = to;
            }
        }
        board[row(from)][column(from)] = "";
        board[row(to)][column(to)] = fromPiece;
        
        let oppositeColor = fromPiece[0] === 'b' ? 'w' : 'b';
        if (isCheckMate(oppositeColor)) {
            gameState = 1;
            return 2;
        } else if (isStaleMate(oppositeColor)) {
            gameState = 2;
            return 3;
        }
        return 1;
    }
    return 0;
}

function validateMove(from, to) {
    if (gameState >= 1) {
        return false;
    }
    if (isValidPos(from) == false || isValidPos(to) == false) {
        return false;
    }
    
    let fromPiece = getPiece(from);
    let toPiece = getPiece(to);
    if (fromPiece === "" || fromPiece[0] === toPiece[0]) {
        return false;
    }

    let color = fromPiece[0];
    if (color === 'w' && !whiteMove || color === 'b' && whiteMove) {
        return false;
    }

    let moves = generateMoves(color);
    let pieceMoves = moves[row(from)][column(from)];
    return pieceMoves.length > 0 && pieceMoves.includes(to);
}

function generateStraightMoves(position, color) {
    let moves = [];
    let startDir = 0, endDir = 3;
    for (let dir = startDir; dir <= endDir; dir++) {
        let directionOffSet = directionOffSets[dir];
        let totalSteps = stepsToEdges[row(position)][column(position)][dir];
        let currentPosition = position;
        for (let i = 1; i <= totalSteps; i++) {
            currentPosition += directionOffSet;
            let currentCoin = getPiece(currentPosition);
            if (currentCoin == "") {
                if (!isCheckAfterMove(position, currentPosition, color)) {
                    moves.push(currentPosition);
                }
            } else if (currentCoin[0] === color) {
                break;
            } else {
                if (!isCheckAfterMove(position, currentPosition, color)) {
                    moves.push(currentPosition);
                }
                break;
            }
        }
    }
    return moves;
}

function generateCrossMoves(position, color) {
    let moves = [];
    let startDir = 4, endDir = 7;
    for (let dir = startDir; dir <= endDir; dir++) {
        let directionOffSet = directionOffSets[dir];
        let totalSteps = stepsToEdges[row(position)][column(position)][dir];
        let currentPosition = position;
        for (let i = 1; i <= totalSteps; i++) {
            currentPosition += directionOffSet;
            let currentCoin = getPiece(currentPosition);
            if (currentCoin == "") {
                if (!isCheckAfterMove(position, currentPosition, color)) {
                    moves.push(currentPosition);
                }
            } else if (currentCoin[0] === color) {
                break;
            } else {
                if (!isCheckAfterMove(position, currentPosition, color)) {
                    moves.push(currentPosition);
                }
                break;
            }
        }
    }
    return moves;
}

function generateKnightMoves(position, color) {
    let t = [];
    t[0] = position + S + S + E;
    t[1] = position + N + N + E;
    t[2] = position + N + N + W;
    t[3] = position + S + S + W;
    t[4] = position + S + E + E;
    t[5] = position + N + E + E;
    t[6] = position + N + W + W;
    t[7] = position + S + W + W;

    let moves = [];
    for (let toPos of t) {
        if (isValidPos(toPos)) {
            let toPiece = getPiece(toPos);
            if ((toPiece === "" || toPiece[0] !== color) && !isCheckAfterMove(position, toPos, color)) {
                moves.push(toPos);
            }
        }
    }
    return moves;
}

function generateLooseKnightMoves(position, color) {
    let t = [];
    t[0] = position + S + S + E;
    t[1] = position + N + N + E;
    t[2] = position + N + N + W;
    t[3] = position + S + S + W;
    t[4] = position + S + E + E;
    t[5] = position + N + E + E;
    t[6] = position + N + W + W;
    t[7] = position + S + W + W;

    let moves = [];
    for (let toPos of t) {
        if (isValidPos(toPos)) {
            let toPiece = getPiece(toPos);
            if (toPiece === "" || toPiece[0] !== color) {
                moves.push(toPos);
            }
        }
    }
    return moves;
}

function generateKingMoves(position, color) {
    let moves = [];
    for (let dir = 0; dir < 8; dir++) {
        let directionOffSet = directionOffSets[dir];
        let totalSteps = Math.min(1, stepsToEdges[row(position)][column(position)][dir]);
        if (totalSteps === 1) {
            let currentPosition = position + directionOffSet;
            let currentCoin = getPiece(currentPosition);
            if (currentCoin === "") {
                if (!isCheckAfterMove(position, currentPosition, color)) {
                    moves.push(currentPosition);
                }
            } else if (currentCoin[0] !== color) {
                if (!isCheckAfterMove(position, currentPosition, color)) {
                    moves.push(currentPosition);
                }
            }
        }
    }
    return moves;
}

function generatePawnMoves(position, color) {
    let moves = [];
    let r = row(position);
    let c = column(position);
    if (color === 'w') {
        if (r === 6) {
            if (getPiece(position + N) === "" && getPiece(position + N + N) === "" && !isCheckAfterMove(position, position + N + N, color)) {
                moves.push(position + N + N);
            }
        }
        if (getPiece(position + N) === "" && !isCheckAfterMove(position, position + N, color)) {
            moves.push(position + N);
        }
        if (c > 0 && getPiece(position + NW) !== "" && getPiece(position + NW)[0] !== color && !isCheckAfterMove(position, position + NW, color)) {
            moves.push(position + NW);
        }
        if (c < 7 && getPiece(position + NE) !== "" && getPiece(position + NE)[0] !== color && !isCheckAfterMove(position, position + NE, color)) {
            moves.push(position + NE);
        }
    } else {
        if (r == 1) {
            if (getPiece(position + S) === "" && getPiece(position + S + S) === "" && !isCheckAfterMove(position, position + S + S, color)) {
                moves.push(position + S + S);
            }
        }
        if (getPiece(position + S) === "" && !isCheckAfterMove(position, position + S, color)) {
            moves.push(position + S);
        }
        if (c > 0 && getPiece(position + SW) !== "" && getPiece(position + SW)[0] !== color && !isCheckAfterMove(position, position + SW, color)) {
            moves.push(position + SW);
        }
        if (c < 7 && getPiece(position + SE) !== "" && getPiece(position + SE)[0] !== color && !isCheckAfterMove(position, position + SE, color)) {
            moves.push(position + SE);
        }
    }
    return moves;
}

function generateLoosePawnMoves(position, color) {
    let moves = [];
    let r = row(position);
    let c = column(position);
    if (color === 'w') {
        if (r === 6) {
            if (getPiece(position + N) === "" && getPiece(position + N + N) === "") {
                moves.push(position + N + N);
            }
        }
        if (getPiece(position + N) === "") {
            moves.push(position + N);
        }
        if (c > 0 && getPiece(position + NW) !== "" && getPiece(position + NW)[0] !== color) {
            moves.push(position + NW);
        }
        if (c < 7 && getPiece(position + NE) !== "" && getPiece(position + NE)[0] !== color) {
            moves.push(position + NE);
        }
    } else {
        if (r == 1) {
            if (getPiece(position + S) === "" && getPiece(position + S + S) === "") {
                moves.push(position + S + S);
            }
        }
        if (getPiece(position + S) === "") {
            moves.push(position + S);
        }
        if (c > 0 && getPiece(position + SW) !== "" && getPiece(position + SW)[0] !== color) {
            moves.push(position + SW);
        }
        if (c < 7 && getPiece(position + SE) !== "" && getPiece(position + SE)[0] !== color) {
            moves.push(position + SE);
        }
    }
    return moves;
}

function generateMoves(color) {
    let generatedMoves = [];
    for (let i = 0; i < 8; i++) {
        generatedMoves[i] = Array(8);
        for (let j = 0; j < 8; j++) {
            generatedMoves[i][j] = [];
            let piece = board[i][j];
            let currentPosition = i * 10 + j;
            if (piece !== '' && piece[0] === color) {
                if (piece[1] === 'k') {
                    generatedMoves[i][j] = generateKingMoves(currentPosition, color);
                } else if (piece[1] === 'q') {
                    generatedMoves[i][j] = [...generateStraightMoves(currentPosition, color), ...generateCrossMoves(currentPosition, color)];
                } else if (piece[1] === 'r') {
                    generatedMoves[i][j] = generateStraightMoves(currentPosition, color);
                } else if (piece[1] === 'b') {
                    generatedMoves[i][j] = generateCrossMoves(currentPosition, color);
                } else if (piece[1] === 'p') {
                    generatedMoves[i][j] = generatePawnMoves(currentPosition, color);
                } else if (piece[1] === 'n') {
                    generatedMoves[i][j] = generateKnightMoves(currentPosition, color);
                }
            }
        }
    }
    return generatedMoves;
}

function isCheck(position, color) {
    let oppositeColor = color === 'w' ? 'b' : 'w';
    for (let dir = 0; dir < 8; dir++) {
        let directionOffSet = directionOffSets[dir];
        let totalSteps = stepsToEdges[row(position)][column(position)][dir];
        let currentPosition = position;
        for (let i = 1; i <= totalSteps; i++) {
            currentPosition += directionOffSet;
            let currentPiece = getPiece(currentPosition);
            if (currentPiece !== "") {
                if (currentPiece[0] === color) {
                    break;
                } else if (currentPiece[1] === 'r' && rookDirections.includes(oppDirectionOffSets[dir])) {
                    return true;
                } else if (currentPiece[1] === 'b' && bishopDirections.includes(oppDirectionOffSets[dir])) {
                    return true;
                } else if (currentPiece[1] === 'q') {
                    return true;
                } else if (currentPiece[1] === 'k' && i == 1) {
                    return true;
                } else if (currentPiece[1] === 'p' && generateLoosePawnMoves(currentPosition, oppositeColor).includes(position)) {
                    return true;
                }
                break;
            }
        }
    }
    let moves = generateLooseKnightMoves(position, color);
    for (pos of moves) {
        let piece = getPiece(pos);
        if (piece === oppositeColor + 'n') {
            return true;
        }
    }
    return false;
}

function isCheckMate(color) {
    if (!isCheck(color === 'b' ? blackKingPosition : whiteKingPosition, color)) {
        return false;
    }
    let moves = generateMoves(color);
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (moves[i][j].length != 0) {
                return false;
            }
        }
    }
    return true;
}

function isStaleMate(color) {
    if (isCheck(color === 'b' ? blackKingPosition : whiteKingPosition, color)) {
        return false;
    }
    let moves = generateMoves(color);
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (moves[i][j].length != 0) {
                return false;
            }
        }
    }
    return true;    
}

function isCheckAfterMove(from, to, color) {
    let fromPiece = getPiece(from);
    let toPiece = getPiece(to);

    board[row(from)][column(from)] = "";
    board[row(to)][column(to)] = fromPiece;

    let kingPosition;
    if (fromPiece[1] === 'k') {
        kingPosition = to;
    } else {
        kingPosition = color === 'b' ? blackKingPosition : whiteKingPosition;
    }
    let check = isCheck(kingPosition, color);
    board[row(from)][column(from)] = fromPiece;
    board[row(to)][column(to)] = toPiece;
    return check;
}

function isCurrentMovePiece(position) {
    let piece = getPiece(position);
    if (piece === "") {
        return false;
    }
    let currentMove = whiteMove === true ? 'w' : 'b';
    return piece[0] === currentMove;
}

function getGameState() {
    return gameState;
}
