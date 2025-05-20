const offer_button = document.querySelector("#create-offer");
const answer_button = document.querySelector("#create-answer");
const set_answer_button = document.querySelector("#set-answer");

const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    iceCandidatePoolSize: 0,
};

let localConnection = new RTCPeerConnection(config);

let dataChannel = null;

function createMessage(message) {
    let p = document.createElement("p");
    p.innerText = message;
    return p;
}

function createDataChannel(channel) {
    dataChannel = channel;

    dataChannel.onopen = e => { 
        console.log("connection opened");
        document.querySelector("#signaling").remove();
        document.querySelector("#main").style.display = "block";
    };

    dataChannel.onclose = e => {
        console.log("connection closed");
    }
    
    dataChannel.onmessage = e => {
        let data = JSON.parse(e.data);
        if (data.type === "positionColor") {
            positionColor = data.message;
            if (positionColor === 'w') {
                setColorTurn('w', true);
            } else {
                setColorTurn('b', false);
            }
        } else if (data.type === "move") {
            if (myTurn === true) {
                dataChannel.send(JSON.stringify({type: "wait"}));
            } else {
                let from = data.message.from;
                let to = data.message.to;
                if (handleRemoteMove(Number(from), Number(to)) === true) {
                    dataChannel.send(JSON.stringify({type: "ack", message: "true"}));
                } else {
                    dataChannel.send(JSON.stringify({type: "ack", message: "false"}))
                }
            }
        } else if (data.type === "ack" && data.message === "false") {
            alert("remote move validation failed");
        }
    }
}

function handleRemoteMove(from, to) {
    let res = makeMove(from, to);
    if (res >= 1) {
        myTurn = !myTurn;
        let fromElem = document.querySelector(".cell-" + (from < 10 ? "0" + from : from + ""));
        let toElem = document.querySelector(".cell-" + (to < 10 ? "0" + to : to + ""));
        applyMove([fromElem, toElem]);
        if (res === 2) {
            addGameStatusMessage(false, "checkmate");
        } else if (res == 3) {
            addGameStatusMessage(false, "stalemate");
        }
        return true;
    }
    return false;
}

function handleLocalMove(from, to) {
    let res = makeMove(from, to);
    if (res >= 1) {
        myTurn = !myTurn;
        applyMove(moves);
        dataChannel.send(JSON.stringify({type: "move", message: {from, to}}));
        if (res === 2) {
            dataChannel.send(JSON.stringify({type: "state", message: "checkmate"}));
            addGameStatusMessage(true, "checkmate");
        } else if (res === 3) {
            dataChannel.send(JSON.stringify({type: "state", message: "stalemate"}));
            addGameStatusMessage(true, "stalemate");
        }
    }
    moves.length = 0;
}

function generatePositionColor() {
    let color = Math.floor(Math.random() * 2);
    if (color === 0) {
        setColorTurn('b', false);
        dataChannel.send(JSON.stringify({type: "positionColor", message: "w"}));
    } else {
        setColorTurn('w', true);
        dataChannel.send(JSON.stringify({type: "positionColor", message: "b"}));
    }
}

localConnection.ondatachannel = e => {
    createDataChannel(e.channel);
    generatePositionColor();
};

localConnection.onicegatheringstatechange = () => {
    if (localConnection.iceGatheringState === "complete") {
        document.querySelector("#sdp").textContent = JSON.stringify(localConnection.localDescription);
    }
};

offer_button.addEventListener("click", async () => {
    offer_button.disabled = true;
    answer_button.disabled = true;
    document.querySelector("#answer-input").disabled = true;
    createDataChannel(localConnection.createDataChannel("chat", {
        ordered: true,
        maxRetransmits: null
    }));
    let offer = await localConnection.createOffer();
    await localConnection.setLocalDescription(offer);
});

answer_button.addEventListener("click", async () => {
    answer_button.disabled = true;
    offer_button.disabled = true;
    set_answer_button.disabled = true;
    document.querySelector("#answer-input").disabled = true;
    document.querySelector("#set-answer-input").disabled = true;
    const answerInput = document.querySelector("#answer-input");
    const offer = JSON.parse(answerInput.value);
    answerInput.value = '';
    await localConnection.setRemoteDescription(offer);
    let answer = await localConnection.createAnswer();
    await localConnection.setLocalDescription(answer);
});

set_answer_button.addEventListener("click", async () => {
    set_answer_button.disabled = true;
    const setAnswerInput = document.querySelector("#set-answer-input");
    const answer = JSON.parse(setAnswerInput.value);
    setAnswerInput.value = '';
    await localConnection.setRemoteDescription(answer);
});