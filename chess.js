const board = [];

const N = -10, S = 10, E = 1, W = -1, NW = -11, NE = -9, SW = 9, SE = 11;
const directionOffSets = [N, E, W, S, NE, NW, SE, SW];
const oppDirectionOffSets = [S, W, E, N, SW, SE, NW, NE];
const rookDirections = [N, E, W, S];
const bishopDirections = [NE, NW, SE, SW];
let whiteKingPosition = 74, blackKingPosition = 4;
let whiteMove = true;

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
    if (validate_move(from, to)) {
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

        return true;
    }
    return false;
}

function validate_move(from, to) {
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
    if(fromPiece[1] === 'r') {
        let moves = generateStraightMoves(from, color);
        return moves.includes(to) && !isCheckAfterMove(from, to, color);
    } else if (fromPiece[1] === 'b') {
        let moves = generateCrossMoves(from, color);
        return moves.includes(to) && !isCheckAfterMove(from, to, color);
    } else if (fromPiece[1] === 'q') {
        let moves = [...generateStraightMoves(from, color), ...generateCrossMoves(from, color)];
        return moves.includes(to) && !isCheckAfterMove(from, to, color);
    } else if (fromPiece[1] === 'k') {
        let moves = generateKingMoves(from, color);
        return moves.includes(to) && !isCheckAfterMove(from, to, color);
    } else if (fromPiece[1] === 'n') {
        let moves = generateKnightMoves(from, color);
        return moves.includes(to) && !isCheckAfterMove(from, to, color);
    } else {
        let moves = generatePawnMoves(from,color);
        return moves.includes(to) && !isCheckAfterMove(from, to, color);
    }
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
                moves.push(currentPosition);
            } else if (currentCoin[0] === color) {
                break;
            } else {
                moves.push(currentPosition);
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
                moves.push(currentPosition);
            } else if (currentCoin[0] === color) {
                break;
            } else {
                moves.push(currentPosition);
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
    for (toPos of t) {
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
                moves.push(currentPosition);
            } else if (currentCoin[0] !== color) {
                moves.push(currentPosition);
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
                    console.log("check piece : rook");
                    return true;
                } else if (currentPiece[1] === 'b' && bishopDirections.includes(oppDirectionOffSets[dir])) {
                    console.log("check piece : bishop")
                    return true;
                } else if (currentPiece[1] === 'q') {
                    console.log("check piece : queen");
                    return true;
                } else if (currentPiece[1] === 'k' && i == 1) {
                    console.log("check piece : king");
                    return true;
                } else if (currentPiece[1] === 'p' && generatePawnMoves(currentPosition, oppositeColor).includes(position)) {
                    console.log("check piece : pawn");
                    return true;
                }
                break;
            }
        }
    }
    let moves = generateKnightMoves(position, color);
    for (pos of moves) {
        let piece = getPiece(pos);
        if (piece === oppositeColor + 'n') {
            console.log("check piece : knight, position : ", pos, "color : ", piece[0]);
            return true;
        }
    }
    return false;
}

function isCheckAfterMove(from, to, color) {
    let fromPiece = getPiece(from);
    let toPiece = getPiece(to);

    console.log("before move from piece : ", fromPiece, "to piece : ", toPiece);
    board[row(from)][column(from)] = "";
    board[row(to)][column(to)] = fromPiece;
    console.log("After move from piece : ", getPiece(from), "to piece : ", getPiece(to));

    let kingPosition;
    if (fromPiece[1] === 'k') {
        kingPosition = to;
    } else {
        kingPosition = color === 'b' ? blackKingPosition : whiteKingPosition;
    }
    let check = isCheck(kingPosition, color);
    console.log("check : ", check, "color : ", color);
    board[row(from)][column(from)] = fromPiece;
    board[row(to)][column(to)] = toPiece;
    console.log("king pos : ", kingPosition);
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


/*
get input from, to position
validate input
check if same col or row for straight moves, same diagonal for cross moves
check if piece can go to that position
check for checks after moving to that position
make move

for later
store the rook and king moves for the castle
store previous move for the enpassant
three fold repetition
*/

