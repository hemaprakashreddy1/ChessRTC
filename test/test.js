const N = -10, S = 10, E = 1, W = -1, NW = -11, NE = -9, SW = 9, SE = 11;
const directionOffSets = [N, E, W, S, NE, NW, SE, SW];
const oppDirectionOffSets = [S, W, E, N, SW, SE, NW, NE];
const rookDirections = [N, E, W, S];
const bishopDirections = [NE, NW, SE, SW];

let whiteMove;
let whiteCastle; // [queen castle, king castle]
let blackCastle;
let whiteKingPosition, blackKingPosition;
let enpassantTarget;
let halfMoves;
let fullMoves;

let gameState = 0;
const gameStates = ["on", "check mate", "stale mate"];

let stepsToEdges;
let board;
function generateStepsToEdges() {
    let stepsToEdges = new Array(8);
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
    return stepsToEdges;
}

function initChessBoard(piecePlacement) {
    let board = new Array(8);
    for (let i = 0; i < 8; i++) {
        board[i] = new Array(8);
        for (let j = 0; j < 8; j++) {
            board[i][j] = "";
        }
    }
    let i = 0, j = 0;
    for (let c of piecePlacement) {
        if (c == '/') {
            i++;
            j = 0;
        } else if (c >= '1' && c <= '9') {
            j += Number(c);
        } else if (c >= 'A' && c <= 'Z') {
            if (c === 'K') {
                whiteKingPosition = i * 10 + j;
            }
            board[i][j] = 'w' + c.toLowerCase();
            j++;
        } else if (c >= 'a' && c <= 'z') {
            if (c === 'k') {
                blackKingPosition = i * 10 + j;
            }
            board[i][j] = 'b' + c;
            j++;
        }
    }
    return board;
}

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
                blackCastle[0] = blackCastle[1] = false;
            } else {
                whiteKingPosition = to;
                whiteCastle[0] = whiteCastle[1] = false;
            }
        } else if (fromPiece[1] === 'r') {
            if (fromPieceColor === 'b') {
                if (from === 0) {
                    blackCastle[0] = false;
                } else if(from === 7) {
                    blackCastle[1] = false;
                }
            } else {
                if (from === 70) {
                    whiteCastle[0] = false;
                } else if (from === 77) {
                    whiteCastle[1] = false;
                }
            }
        }
        for (let move of moves) {
            let [from, to, capture, toPiece] = move;
            board[row(from)][column(from)] = "";
            board[row(capture)][column(capture)] = "";
            board[row(to)][column(to)] = toPiece;
        }

        if (fromPiece[1] === 'p') {
            if (fromPieceColor === 'w') {
                if (moves[0][0] === moves[0][1] + S + S) {
                    enpassantTarget = moves;
                } else {
                    enpassantTarget = null;
                }
            } else {
                if (moves[0][0] === moves[0][1] + N + N) {
                    enpassantTarget = moves;
                } else {
                    enpassantTarget = null;
                }
            }
        }

        let capturePiece = getPiece(moves[0][2]);
        if (fromPiece[1] === 'p' || capturePiece) {
            halfMoves = 0;
        }
        if (!whiteMove) {
            fullMoves++;
        }

        whiteMove = !whiteMove;
        
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
    
    let castle;
    if (color === 'b') {
        castle = blackCastle;
    } else {
        castle = whiteCastle;
    }
    if (castle[0] === true && getPiece(position + W) + getPiece(position + 2 * W) + getPiece(position + 3 * W) === "") {
        let possibleMoves = [
            [[position, position + W, position + W, piece]],
            [[position, position + 2 * W, position + 2 * W, piece], [position + 4 * W, position + W, position + W, color + 'r']]
        ];
        if (!isCheckAfterMove(possibleMoves[0], color) && !isCheckAfterMove(possibleMoves[1], color)) {
            moves.push(possibleMoves[1]);
        }
    }
    if (castle[1] === true && getPiece(position + E) + getPiece(position + 2 * E) === "") {
        let possibleMoves = [
            [[position, position + E, position + E, piece]],
            [[position, position + 2 * E, position + 2 * E, piece], [position + 3 * E, position + E, position + E, color + 'r']]
        ];
        if (!isCheckAfterMove(possibleMoves[0], color) && !isCheckAfterMove(possibleMoves[1], color)) {
            moves.push(possibleMoves[1]);
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
        if (r == 3 && enpassantTarget && enpassantTarget[0][3] === 'bp' && enpassantTarget[0][1] + N + N == enpassantTarget[0][0]) {
            if (position + E === enpassantTarget[0][1]) {
                move = [[position, position + NE, position + E, getPiece(position)]];
                if (!isCheckAfterMove(move, color)) {
                    moves.push(move);
                }
            } else if (position + W === enpassantTarget[0][1]) {
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
        if (r == 4 && enpassantTarget && enpassantTarget[0][3] === 'wp' && enpassantTarget[0][1] + S + S == enpassantTarget[0][0]) {
            if (position + E === enpassantTarget[0][1]) {
                move = [[position, position + SE, position + E, getPiece(position)]];
                if (!isCheckAfterMove(move, color)) {
                    moves.push(move);
                }
            } else if (position + W === enpassantTarget[0][1]) {
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

function initGame(fen) {
    stepsToEdges = generateStepsToEdges();
    let [piecePlacement, sideToMove, castling, enpassantTargetNotation, halfMoves, fullMoves] = fen.split(" ");
    board = initChessBoard(piecePlacement);
    if (sideToMove === 'w') {
        whiteMove = true;
    } else {
        whiteMove = false;
    }
    whiteCastle = [false,false];
    blackCastle = [false, false];
    for (c of castling) {
        if (c === 'K') {
            whiteCastle[1] = true;
        } else if(c === 'Q') {
            whiteCastle[0] = true;
        } else if (c === 'k') {
            blackCastle[1] = true;
        } else if (c === 'q') {
            blackCastle[0] = true;
        }
    }
    if (enpassantTargetNotation !== '-') {
        let to = (7 - (Number(enpassantTargetNotation[1]) - 1)) * 10 + (enpassantTargetNotation.charCodeAt(0) - "a".charCodeAt(0));
        if (whiteMove) {
            enpassantTarget = [[to + S + S, to, to, "wp"]];
        } else {
            enpassantTarget = [[to + N + N, to, to, "bp"]];
        }
    }
    halfMoves = Number(halfMoves);
    fullMoves = Number(fullMoves);
}

initGame("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");// testing starts here
let games = [];
let game = [];
let checkMates = 0;
function modifiedMakeMove(moves) {
    let castleState = null;
    let piecesBeforeMove = [];
    for (let move of moves) {
        let from = move[0];
        let capture = move[2];
        piecesBeforeMove.push([getPiece(from), getPiece(capture)]);
    }

    let from = moves[0][0];
    let to = moves[0][1];
    let fromPiece = getPiece(from);
    let fromPieceColor = fromPiece[0];
    if (fromPieceColor === 'w') {
        castleState = [...whiteCastle];
    } else {
        castleState = [...blackCastle];
    }
    if (fromPiece[1] === 'k') {
        if (fromPieceColor === 'b') {
            blackKingPosition = to;
            blackCastle[0] = blackCastle[1] = false;
        } else {
            whiteKingPosition = to;
            whiteCastle[0] = whiteCastle[1] = false;
        }
    } else if (fromPiece[1] === 'r') {
        if (fromPieceColor === 'b') {
            if (from === 0) {
                blackCastle[0] = false;
            } else if(from === 7) {
                blackCastle[1] = false;
            }
        } else {
            if (from === 70) {
                whiteCastle[0] = false;
            } else if (from === 77) {
                whiteCastle[1] = false;
            }
        }
    }
    for (let move of moves) {
        let [from, to, capture, toPiece] = move;
        board[row(from)][column(from)] = "";
        board[row(capture)][column(capture)] = "";
        board[row(to)][column(to)] = toPiece;
    }

    let enpassantTargetState = enpassantTarget;
    if (fromPiece[1] === 'p') {
        if (fromPieceColor === 'w') {
            if (moves[0][0] === moves[0][1] + S + S) {
                enpassantTarget = moves;
            } else {
                enpassantTarget = null;
            }
        } else {
            if (moves[0][0] === moves[0][1] + N + N) {
                enpassantTarget = moves;
            } else {
                enpassantTarget = null;
            }
        }
    }

    whiteMove = !whiteMove;
    if (isCheckMate(fromPieceColor === 'b' ? 'w' : 'b')) {
        checkMates++;
        let currentGame = [...game];
        games.push({checkMates, currentGame});
    }
    return [castleState, piecesBeforeMove, enpassantTargetState];
}

function undoMove(moves, state) {
    let [castleState, piecesBeforeMove, enpassantTargetState] = state;
    let fromPiece = piecesBeforeMove[0][0];
    let color = fromPiece[0];
    if (fromPiece[1] === 'k') {
        if (color === 'w') {
            whiteKingPosition = moves[0][0];
        } else {
            blackKingPosition = moves[0][0];
        }
    }
    enpassantTarget = enpassantTargetState;
    if (color === 'w') {
        whiteCastle = castleState;
    } else {
        blackCastle = castleState;
    }
    for (let i = 0; i < moves.length; i++) {
        let [from, to, capture, _] = moves[i];
        let [fromPiece, capturePiece] = piecesBeforeMove[i];
        board[row(from)][column(from)] = fromPiece;
        board[row(to)][column(to)] = "";
        board[row(capture)][column(capture)] = capturePiece;
    }
}

let movesCount = 0;
function search(color, depth) {
    if (depth === 0) {
        return;
    }
    let generatedMoves = generateMoves(color);
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            for (let move of generatedMoves[i][j]) {
                movesCount++;
                game.push(move);
                let state = modifiedMakeMove(move);
                search(color === 'w' ? 'b' : 'w', depth - 1);
                game.pop();
                undoMove(move, state);
            }
        }
    }
}

const args = process.argv.slice(2);
let depth = 3;
if (args.length) {
    depth = Number(args[0]);
}
search('w', depth);
// console.log(JSON.stringify({games}));
console.log("checkmates : ", games.length);
console.log("moves count : ", movesCount);