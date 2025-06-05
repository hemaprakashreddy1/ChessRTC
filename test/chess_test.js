function modifiedMakeMove(moves) {
    let from = moves[0][0];
    let to = moves[0][1];
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
    }

    if (from === 0 || to === 0) {
        blackCastle[0] = false;
    } else if(from === 7 || to === 7) {
        blackCastle[1] = false;
    } else if (from === 70 || to == 70) {
        whiteCastle[0] = false;
    } else if (from === 77 || to == 77) {
        whiteCastle[1] = false;
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

function generateUndoState(moves) {
    let piecesBeforeMove = [];
    for (let move of moves) {
        let from = move[0];
        let capture = move[2];
        piecesBeforeMove.push([getPiece(from), getPiece(capture)]);
    }
    let fromPieceColor = getPiece(moves[0][0])[0];
    let castleState;
    if (fromPieceColor === 'w') {
        castleState = [...whiteCastle];
    } else {
        castleState = [...blackCastle];
    }
    let enpassantTargetState = enpassantTarget;
    return [castleState, piecesBeforeMove, enpassantTargetState];
}

function search(color, depth) {
    if (depth === 0) {
        return 1;
    }
    let movesCount = 0;
    let generatedMoves = generateMoves(color);
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            for (let move of generatedMoves[i][j]) {
                let state = generateUndoState(move);
                modifiedMakeMove(move);
                movesCount += search(color === 'w' ? 'b' : 'w', depth - 1);
                undoMove(move, state);
            }
        }
    }
    return movesCount;
}

const args = process.argv.slice(2);
let depth = 1;
if (args.length) {
    depth = Number(args[0]);
}
let movesCount = search('w', depth);
console.log("moves count : ", movesCount);