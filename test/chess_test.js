function undoMove(moves, state) {
    let [castleState, enpassantTargetState] = state;
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
    if (color === 'w') {
        whiteCastle = castleState;
    } else {
        blackCastle = castleState;
    }
    for (let i = 0; i < moves.length; i++) {
        let [from, to, capture, fromPiece, toPiece, capturePiece] = moves[i];
        board[row(from)][column(from)] = fromPiece;
        board[row(to)][column(to)] = "";
        board[row(capture)][column(capture)] = capturePiece;
    }
}

function generateUndoState(moves) {
    let fromPieceColor = moves[0][3][0];
    let castleState;
    if (fromPieceColor === 'w') {
        castleState = [...whiteCastle];
    } else {
        castleState = [...blackCastle];
    }
    let enpassantTargetState = enpassantTarget;
    return [castleState, enpassantTargetState];
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
                makeMove(move);
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