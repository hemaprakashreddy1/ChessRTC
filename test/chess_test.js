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