function undoMove(moves, state) {
    let [blackCastleState, whiteCastleState, enpassantTargetState, currentHalfMoves, currentFullMoves, currentGameState] = state;
    blackCastle = blackCastleState;
    whiteCastle = whiteCastleState;
    halfMoves = currentHalfMoves;
    fullMoves = currentFullMoves;
    gameState = currentGameState;
    let fromPiece = moves[0][3];
    let color = fromPiece[0];
    if (fromPiece[1] === 'k') {
        if (color === 'w') {
            whiteKingPosition = moves[0][0];
        } else {
            blackKingPosition = moves[0][0];
        }
    }
    enpassantTarget = enpassantTargetState;
    for (let move of moves) {
        let [from, to, capture, fromPiece, toPiece, capturePiece] = move;
        board[row(from)][column(from)] = fromPiece;
        board[row(to)][column(to)] = "";
        board[row(capture)][column(capture)] = capturePiece;
    }
}

function generateUndoState() {
    let blackCastleState = [...blackCastle];
    let whiteCastleState = [...whiteCastle];
    let enpassantTargetState = enpassantTarget;
    return [blackCastleState, whiteCastleState, enpassantTargetState, halfMoves, fullMoves, gameState];
}



function getAlgebraicNotation(x) {
    return String.fromCharCode(97 + column(x)) + (8 - row(x));
}

let searchDepth = 1;

function search(color, depth) {
    if (depth === 0) {
        return 1;
    }
    let movesCount = 0;
    let generatedMoves = generateMoves(color);
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            for (let move of generatedMoves[i][j]) {
                let state = generateUndoState();
                makeMove(move);
                let currentMoves = search(color === 'w' ? 'b' : 'w', depth - 1);
                // if (searchDepth === depth) {
                //     console.log(getAlgebraicNotation(move[0][0]) + getAlgebraicNotation(move[0][1]) + " : " + currentMoves);
                // }
                movesCount += currentMoves;
                undoMove(move, state);
            }
        }
    }
    return movesCount;
}

const args = process.argv.slice(2);
if (args.length) {
    searchDepth = Number(args[0]);
}
let movesCount = search(whiteMove ? 'w' : 'b', searchDepth);
console.log("moves count : ", movesCount);