const N = -10, S = 10, E = 1, W = -1, NW = -11, NE = -9, SW = 9, SE = 11;
const directionOffSets = [N, E, W, S, NE, NW, SE, SW];
const oppDirectionOffSets = [S, W, E, N, SW, SE, NW, NE];
const rookDirections = [N, E, W, S];
const bishopDirections = [NE, NW, SE, SW];

let whiteKingPosition = 74, blackKingPosition = 4;
let whiteMove = true;
let lastMove;
let whiteCastlePieceMoved = [false, false, false]; // order : left rook, king, right rook
let blackCastlePieceMoved = [false, false, false];

let gameState = 0;
const gameStates = ["on", "check mate", "stale mate"];

let stepsToEdges;
function generateStepsToEdges() {
    stepsToEdges = new Array(8);
    for(let row = 0; row < 8; row++) {
        stepsToEdges[row] = new Array(8);
        for(let col = 0; col < 8; col++) {
            stepsToEdges[row][col] = new Array(8);
            let north = row;
            let east = 7 - col;
            let west = col;
            let south = 7 - row;
            let northEast = Math.min(north, east);
            let northWest = Math.min(north, west);
            let southEast = Math.min(south, east);
            let southWest = Math.min(south, west);
            
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

let board;
function initChessBoard() {
    board = new Array(8);
    for (let i = 0; i < 8; i++) {
        board[i] = new Array(8);
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

function makeMove(from, to, promotionPiece) {
    /*
    return type
    0 move failed
    1 move success
    2 move success and checkmate
    3 move success and stalemate
    */
    let [isValid, moves] = validateMove(from, to, promotionPiece);
    if (isValid) {
        let fromPiece = getPiece(from);
        let fromPieceColor = fromPiece[0];
        if (fromPiece[1] === 'k') {
            if (fromPieceColor === 'b') {
                blackKingPosition = to;
                blackCastlePieceMoved[1] = true;
            } else {
                whiteKingPosition = to;
                whiteCastlePieceMoved[1] = true;
            }
        } else if (fromPiece[1] === 'r') {
            if (fromPieceColor === 'b') {
                if (from === 0) {
                    blackCastlePieceMoved[0] = true;
                } else if(from === 7) {
                    blackCastlePieceMoved[2] = true;
                }
            } else {
                if (from === 70) {
                    whiteCastlePieceMoved[0] = true;
                } else if (from === 77) {
                    whiteCastlePieceMoved[2] = true;
                }
            }
        }
        for (let move of moves) {
            let [from, to, capture, toPiece] = move;
            board[row(from)][column(from)] = "";
            board[row(capture)][column(capture)] = "";
            board[row(to)][column(to)] = toPiece;
        }
        whiteMove = !whiteMove;
        lastMove = moves;
        
        let oppositeColor = fromPieceColor === 'b' ? 'w' : 'b';
        if (isCheckMate(oppositeColor)) {
            gameState = 1;
            return [2, moves];
        } else if (isStaleMate(oppositeColor)) {
            gameState = 2;
            return [3, moves];
        }
        return [1, moves];
    }
    return [0, moves];
}

function validateMove(from, to, promotionPiece) {
    if (gameState >= 1) {
        return [false, null];
    }
    if (isValidPos(from) == false || isValidPos(to) == false) {
        return [false, null];
    }
    
    let fromPiece = getPiece(from);
    let fromPieceColor = fromPiece[0];
    let toPieceColor = getPiece(to)[0];
    if (fromPiece === "" || fromPieceColor === toPieceColor) {
        return [false, null];
    }
    if (fromPieceColor === 'w' && !whiteMove || fromPieceColor === 'b' && whiteMove) {
        return [false, null];
    }

    let moves = generateMoves(fromPieceColor);
    if (promotionPiece) {
        for (let move of moves[row(from)][column(from)]) {
            if (move[0][1] === to && move[0][3] === promotionPiece) {
                return [true, move];
            }
        }
    } else {
        for (let move of moves[row(from)][column(from)]) {
            if (move[0][1] === to) {
                return [true, move];
            }
        }
    }
    return [false, null];
}

function generateStraightMoves(position, color) {
    let moves = [];
    let startDir = 0, endDir = 3;
    let piece = getPiece(position);
    for (let dir = startDir; dir <= endDir; dir++) {
        let directionOffSet = directionOffSets[dir];
        let totalSteps = stepsToEdges[row(position)][column(position)][dir];
        let currentPosition = position;
        for (let i = 1; i <= totalSteps; i++) {
            currentPosition += directionOffSet;
            let currentPiece = getPiece(currentPosition);
            let move = [[position, currentPosition, currentPosition, piece]];
            if (currentPiece == "") {
                if (!isCheckAfterMove(move, color)) {
                    moves.push(move);
                }
            } else {
                let currentPieceColor = currentPiece[0];
                if (currentPieceColor !== color && !isCheckAfterMove(move, color)) {
                    moves.push(move);
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
            let currentPiece = getPiece(currentPosition);
            let move = [[position, currentPosition, currentPosition, getPiece(position)]];
            if (currentPiece == "") {
                if (!isCheckAfterMove(move, color)) {
                    moves.push(move);
                }
            } else {
                let currentPieceColor = currentPiece[0];
                if (currentPieceColor !== color && !isCheckAfterMove(move, color)) {
                    moves.push(move);
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
            let move = [[position, toPos, toPos, getPiece(position)]];
            if ((toPiece === "" || toPiece[0] !== color) && !isCheckAfterMove(move, color)) {
                moves.push(move);
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
    let piece = getPiece(position);
    for (let dir = 0; dir < 8; dir++) {
        let directionOffSet = directionOffSets[dir];
        let totalSteps = Math.min(1, stepsToEdges[row(position)][column(position)][dir]);
        if (totalSteps === 1) {
            let currentPosition = position + directionOffSet;
            let currentPiece = getPiece(currentPosition);
            let currentPieceColor = currentPiece[0];
            if (currentPiece === "" || currentPieceColor !== color) {
                let move = [[position, currentPosition, currentPosition, piece]];
                if (!isCheckAfterMove(move, color)) {
                    moves.push(move);
                }
            }
        }
    }
    
    let castlePieceMoved;
    if (color === 'b') {
        castlePieceMoved = blackCastlePieceMoved;
    } else {
        castlePieceMoved = whiteCastlePieceMoved;
    }
    if (castlePieceMoved[1] === false) {
        if (castlePieceMoved[0] === false && getPiece(position + W) + getPiece(position + 2 * W) + getPiece(position + 3 * W) === "") {
            let possibleMoves = [
                [[position, position + W, position + W, piece]],
                [[position, position + 2 * W, position + 2 * W, piece], [position + 4 * W, position + W, position + W, color + 'r']]
            ];
            if (!isCheckAfterMove(possibleMoves[0], color) && !isCheckAfterMove(possibleMoves[1], color)) {
                moves.push(possibleMoves[1]);
            }
        }
        if (castlePieceMoved[2] === false && getPiece(position + E) + getPiece(position + 2 * E) === "") {
            let possibleMoves = [
                [[position, position + E, position + E, piece]],
                [[position, position + 2 * E, position + 2 * E, piece], [position + 3 * E, position + E, position + E, color + 'r']]
            ];
            if (!isCheckAfterMove(possibleMoves[0], color) && !isCheckAfterMove(possibleMoves[1], color)) {
                moves.push(possibleMoves[1]);
            }
        }
    }
    return moves;
}

function generatePromotionMoves(color, move) {
    let promotionMoves = [];
    let promotionPieces = ['q', 'r', 'b', 'n'];
    for (let piece of promotionPieces) {
        let currentMove = [[move[0][0], move[0][1], move[0][2], color + piece]];
        promotionMoves.push(currentMove);
    }
    return promotionMoves;
}

function generatePawnMoves(position, color) {
    let moves = [];
    let r = row(position);
    let c = column(position);
    let move;
    if (color === 'w') {
        if (r === 6) {
            move = [[position, position + N + N, position + N + N, getPiece(position)]];
            if (getPiece(position + N) === "" && getPiece(position + N + N) === "" && !isCheckAfterMove(move, color)) {
                moves.push(move);
            }
        }
        move = [[position, position + N, position + N, getPiece(position)]];
        if (getPiece(position + N) === "" && !isCheckAfterMove(move, color)) {
            if (r === 1) {
                moves.push(...generatePromotionMoves(color, move));
            } else {
                moves.push(move);
            }
        }
        move = [[position, position + NW, position + NW, getPiece(position)]];
        if (c > 0 && getPiece(position + NW) !== "" && getPiece(position + NW)[0] !== color && !isCheckAfterMove(move, color)) {
            if (r === 1) {
                moves.push(...generatePromotionMoves(color, move));
            } else {
                moves.push(move);
            }
        }
        move = [[position, position + NE, position + NE, getPiece(position)]];
        if (c < 7 && getPiece(position + NE) !== "" && getPiece(position + NE)[0] !== color && !isCheckAfterMove(move, color)) {
            if (r === 1) {
                moves.push(...generatePromotionMoves(color, move));
            } else {
                moves.push(move);
            }
        }
        if (r == 3 && lastMove && lastMove[0][3] === 'bp' && lastMove[0][1] + N + N == lastMove[0][0]) {
            if (position + E === lastMove[0][1]) {
                move = [[position, position + NE, position + E, getPiece(position)]];
                if (!isCheckAfterMove(move, color)) {
                    moves.push(move);
                }
            } else if (position + W === lastMove[0][1]) {
                move = [[position, position + NW, position + W, getPiece(position)]];
                if (!isCheckAfterMove(move, color)) {
                    moves.push(move);
                }
            }
        }
    } else {
        if (r == 1) {
            move = [[position, position + S + S, position + S + S, getPiece(position)]];
            if (getPiece(position + S) === "" && getPiece(position + S + S) === "" && !isCheckAfterMove(move, color)) {
                moves.push(move);
            }
        }
        move = [[position, position + S, position + S, getPiece(position)]];
        if (getPiece(position + S) === "" && !isCheckAfterMove(move, color)) {
            if (r === 6) {
                moves.push(...generatePromotionMoves(color, move));
            } else {
                moves.push(move);
            }
        }
        move = [[position, position + SW, position + SW, getPiece(position)]];
        if (c > 0 && getPiece(position + SW) !== "" && getPiece(position + SW)[0] !== color && !isCheckAfterMove(move, color)) {
            if (r === 6) {
                moves.push(...generatePromotionMoves(color, move));
            } else {
                moves.push(move);
            }
        }
        move = [[position, position + SE, position + SE, getPiece(position)]];
        if (c < 7 && getPiece(position + SE) !== "" && getPiece(position + SE)[0] !== color && !isCheckAfterMove(move, color)) {
            if (r === 6) {
                moves.push(...generatePromotionMoves(color, move));
            } else {
                moves.push(move);
            }
        }
        if (r == 4 && lastMove && lastMove[0][3] === 'wp' && lastMove[0][1] + S + S == lastMove[0][0]) {
            if (position + E === lastMove[0][1]) {
                move = [[position, position + SE, position + E, getPiece(position)]];
                if (!isCheckAfterMove(move, color)) {
                    moves.push(move);
                }
            } else if (position + W === lastMove[0][1]) {
                move = [[position, position + SW, position + W, getPiece(position)]];
                if (!isCheckAfterMove(move, color)) {
                    moves.push(move);
                }
            }
        }
    }
    return moves;
}

function generateLooseCrossPawnMoves(position, color) {
    let r = row(position);
    let c = column(position);
    let moves = [];
    if (color === 'w') {
        if (r > 0) {
            if (c > 0) {
                moves.push(position + NW);
            }
            if (c < 7) {
                moves.push(position + NE);
            }
        }
    } else {
        if (r < 7) {
            if (c > 0) {
                moves.push(position + SW);
            }
            if (c < 7) {
                moves.push(position + SE);
            }
        }
    }
    return moves;
}

/*
    move = {from, to, capture, toPiece}
    from, to for normal move
    capture position for en passant
    toPiece for promotion piece
 */
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
                } else if (currentPiece[1] === 'r') {
                    if(rookDirections.includes(oppDirectionOffSets[dir])) {
                        return true;
                    }
                } else if (currentPiece[1] === 'b') {
                    if(bishopDirections.includes(oppDirectionOffSets[dir])) {
                        return true;
                    }
                } else if (currentPiece[1] === 'q') {
                    return true;
                } else if (currentPiece[1] === 'k') {
                    if (i == 1) {
                        return true;
                    }
                } else if (currentPiece[1] === 'p') {
                    if (generateLooseCrossPawnMoves(currentPosition, oppositeColor).includes(position)) {
                        return true;
                    }
                }
                break;
            }
        }
    }
    let moves = generateLooseKnightMoves(position, color);
    for (let pos of moves) {
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

function isCheckAfterMove(moves, color) {
    let piecesBeforeMove = [];
    for (let move of moves) {
        let [from, to, capture, toPiece] = move;
        piecesBeforeMove.push([getPiece(from), getPiece(capture)]);
        board[row(from)][column(from)] = "";
        board[row(capture)][column(capture)] = "";
        board[row(to)][column(to)] = toPiece;
    }

    let kingPosition;
    if (piecesBeforeMove[0][0][1] === 'k') {
        kingPosition = moves[0][1];
    } else {
        kingPosition = color === 'b' ? blackKingPosition : whiteKingPosition;
    }

    let check = isCheck(kingPosition, color);

    for (let i = 0; i < moves.length; i++) {
        let [from, to, capture, _] = moves[i];
        let [fromPiece, capturePiece] = piecesBeforeMove[i];
        board[row(from)][column(from)] = fromPiece;
        board[row(to)][column(to)] = "";
        board[row(capture)][column(capture)] = capturePiece;
    }
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
