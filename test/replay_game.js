let games;

let totalGames;
let currentGame = -1;
let currentPos = -1;
let totalMoves;
let moves;
let gameNo = document.querySelector("#game-no");

function initGame(game) {
    moves = game["currentGame"];
    totalMoves = moves.length;
    currentPos = -1;
    setColorTurn('w');
    gameNo.innerText = "game " + (currentGame + 1) + " / " + totalGames;
}

document.querySelector("#start-game").addEventListener("click", () => {
    let gameInput = document.querySelector("#game-input");
    games = JSON.parse(gameInput.value);
    gameInput.value = "";
    document.querySelector("#input-handling").remove();
    document.querySelector("#main").style.display = "block";
    totalGames = games["games"].length;
    currentGame++;
    initGame(games["games"][currentGame]);
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
        if (currentPos == totalMoves - 1) {
            return;
        }
        currentPos++;
        handleMove(moves[currentPos], currentPos);
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        if (currentPos == -1) {
            return;
        }
        undoMove(moves[currentPos], currentPos);
        currentPos--;
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'n') {
        if (currentGame == totalGames - 1) {
            return;
        }
        currentGame++;
        initGame(games["games"][currentGame]);
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'b') {
        if (currentGame == 0) {
            return;
        }
        currentGame--;
        initGame(games["games"][currentGame]);
    }
});
