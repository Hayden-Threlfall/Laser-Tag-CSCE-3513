//per entry box1=userID, box2=equipmentID. press ENTER to send to backend
/* GLOBAL VARIABLES */
// List of players. Stores dicts for each player, containing their name, ID, and current score.
let GREEN_TEAM = []
let RED_TEAM = []
/* JSON Format: 
    username:'str',
    playerID:int,
    score:int,
    team:int  
*/
let scoreWindowRed
let scoreWindowGreen
let eventWindow

/* FUNCTIONS */
/* SPLASH SCREEN */
const splashScreen = () => {
    let width = 3487
    let height = 2221
    let logo = new Image()
    logo.src = "https://github.com/jstrother123/photon-main/blob/main/logo.jpg?raw=true"
    logo.style.height = "100%"
    logo.style.width = "100%"
    logo.style.objectFit = "cover"

    document.body.appendChild(logo)

    setTimeout(() => {
        document.body.removeChild(logo)
        initializeEntryScreen()
    },3000)
}

let playerName = ""; // Initialize playerName variable

/* FUNCTIONS */

// Function to create and display the popup
const createPlayerNamePopup = () => {
    //promise to return name/cancel
    return new Promise((resolve, reject) => {
        // Create elements
        const modal = document.createElement("div");
        modal.classList.add("modal");

        const modalContent = document.createElement("div");
        modalContent.classList.add("modal-content");

        const modalHeader = document.createElement("div");
        modalHeader.classList.add("modal-header");

        const closeBtn = document.createElement("span");
        closeBtn.classList.add("close");
        closeBtn.innerHTML = "&times;"; // Unicode for 'x' symbol
        closeBtn.addEventListener("click", () => {
            //should probably reformat to not use errors as control flow
            reject("cancelled");
            closeModal(modal);
        });

        const headerText = document.createElement("h2");
        headerText.textContent = "No player found, please enter player name";

        modalHeader.appendChild(closeBtn);
        modalHeader.appendChild(headerText);

        const modalBody = document.createElement("div");
        modalBody.classList.add("modal-body");

        const playerNameInput = document.createElement("input");
        playerNameInput.setAttribute("type", "text");
        playerNameInput.setAttribute("id", "playerNameInput");
        playerNameInput.setAttribute("maxlength", "10");
        playerNameInput.setAttribute("placeholder", "Enter player name (max 10 characters)");

        modalBody.appendChild(playerNameInput);

        const modalFooter = document.createElement("div");
        modalFooter.classList.add("modal-footer");

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.addEventListener("click", () => {
            reject("cancelled");
            closeModal(modal);
        });

        const okButton = document.createElement("button");
        okButton.textContent = "OK";
        okButton.addEventListener("click", () => {
            playerName = playerNameInput.value.trim();
            console.log("Player name entered:", playerName);
            //return playerName
            resolve(playerName);
            closeModal(modal);
        });

        modalFooter.appendChild(cancelButton);
        modalFooter.appendChild(okButton);

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);

        modal.appendChild(modalContent);

        // Append modal to body
        document.body.appendChild(modal);
    });
};

// Function to close the modal
const closeModal = (modal) => {
    modal.style.display = "none";
};

/* PLAYER SCREEN */
const initializeEntryScreen = function() {
    let body = []
    body.push('<br>')
    document.body.innerHTML = body.join('')
    const editScreenDiv = document.createElement("div");
    editScreenDiv.id = "editScreen";

    // Header
    const header = document.createElement("h1");
    header.style.color = "purple";
    header.style.textAlign = "center";
    header.textContent = "Player Entry";
    editScreenDiv.appendChild(header);

    // Chart
    const chartDiv = document.createElement("div");
    chartDiv.style.display = "flex";
    chartDiv.style.justifyContent = "space-around";
    chartDiv.style.marginTop = "20px";

    const redTeamDiv = createTeamDiv("Red Team");
    const greenTeamDiv = createTeamDiv("Green Team");

    chartDiv.appendChild(redTeamDiv);
    chartDiv.appendChild(greenTeamDiv);

    editScreenDiv.appendChild(chartDiv);

    // Buttons
    const buttonsDiv = document.createElement("div");
    buttonsDiv.style.display = "flex";
    buttonsDiv.style.justifyContent = "space-around";
    buttonsDiv.style.marginTop = "20px";

    const buttonLabels = [
        "F1 Edit Game",
        "F2 Game Parameters",
        "F3 Start Game",
        "F5 PreEntered Games",
        "F7",
        "F8 View Game",
        "F10 Flick Sync",
        "F12 Clear Game"
    ];

    buttonLabels.forEach(label => {
        const button = document.createElement("button");
        button.textContent = label;
        buttonsDiv.appendChild(button);
    });

    editScreenDiv.appendChild(buttonsDiv);

    document.body.appendChild(editScreenDiv);

    // Event listeners for buttons
    const buttons = document.querySelectorAll("#editScreen button");
    buttons.forEach(button => {
        button.addEventListener("click", handleButtonClick);
    });

// Add event listeners to all input fields to capture Enter key press
const inputFields = document.querySelectorAll("#editScreen input[type='text']");
inputFields.forEach(input => {
    input.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            const entryRow = this.parentElement;
            const playerIdInput = entryRow.querySelector("input[type='text'][maxlength='10']:nth-child(2)"); // Select the first input for player ID
            const equipmentIdInput = entryRow.querySelector("input[type='text'][maxlength='10']:nth-child(3)"); // Select the second input for equipment ID
            
            const playerId = playerIdInput.value.trim();
            const equipmentId = equipmentIdInput.value.trim();
           
            handleEnterPress(equipmentId, playerId);
        }
    });
});
};

const handleEnterPress = async function (equipmentId, playerId) {
    try {
        await sendPlayerEntryById(equipmentId, playerId);
    } catch (error) {
        // Handle error
        console.error(error);
        // Get player name somehow
        createPlayerNamePopup().then(async (playerName) => {
            await sendPlayerEntryByName(equipmentId, playerId, playerName);
        }).catch((err) => {
            //do nothing, only error is cancelation
        })
        
    }
};

const createTeamDiv = function(teamName) {
    const teamDiv = document.createElement("div");
    teamDiv.style.backgroundColor = teamName === "Red Team" ? "darkred" : "darkgreen";
    teamDiv.style.width = "45%";
    teamDiv.style.padding = "10px";

    // Header
    const header = document.createElement("h2");
    header.style.color = "white";
    header.textContent = teamName;
    teamDiv.appendChild(header);

    // Entries
    const entriesDiv = document.createElement("div");

    for (let i = 1; i <= 15; i++) {
        const entryRow = document.createElement("div");
        entryRow.style.display = "flex";
        entryRow.style.marginTop = "5px";

        // Number label
        const numberLabel = document.createElement("div");
        numberLabel.textContent = i;
        entryRow.appendChild(numberLabel);

        // Player ID input
        const playerIdInput = document.createElement("input");
        playerIdInput.type = "text";
        playerIdInput.maxLength = 10;
        playerIdInput.style.marginRight = "10px";
        entryRow.appendChild(playerIdInput);

        // Player code input
        const equipmentIDInput = document.createElement("input");
        equipmentIDInput.type = "text";
        equipmentIDInput.maxLength = 10;
        entryRow.appendChild(equipmentIDInput);

        entriesDiv.appendChild(entryRow);
    }

    teamDiv.appendChild(entriesDiv);

    return teamDiv;
};

const handleButtonClick = function(event) {
    const buttonText = event.target.textContent;
    if (buttonText === "F1 Edit Game") {
        document.getElementById("editScreen").style.display = "block";
        document.getElementById("actionScreen").remove();
    } else if (buttonText === "F3 Start Game") {
        document.getElementById("editScreen").style.display = "none";
        acknowledgeGameStart();
    }else if (buttonText === "F12 Clear Game") {
        // Clear all entries
        clearAllEntries();
    }
};

const clearSelectedEntry = function() {
    const selectedEntry = document.querySelector(".selected");
    if (selectedEntry) {
        selectedEntry.querySelector("input[type='text']").value = "";
    }
};

const clearAllEntries = function() {
    const allInputs = document.querySelectorAll("#editScreen input[type='text']");
    allInputs.forEach(input => {
        input.value = "";
    });
};


/* ACTION SCREEN */
const initializeActionScreen = () => {
    let body = []
    body.push(`
    <div id="timerParent" style="text-align:center;">
        <pr id="timer"></pr>
    </div>
    <br><br>
    <div style="text-align:center;">
        <select id="scoreWindowRed" size="15" style="float:left; width:500px"></select>
        <select id="scoreWindowGreen" size="15"  style="float:right; width:500px"></select>
    </div>
    <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
    <div style="margin:auto;text-align:center;">
        <select id="eventWindow" size="15" style="width:50%;"></select>
    </div>
    <button id="returnButton" onclick="initializeEntryScreen()" style="display:none">Back to input screen</button>`)

    document.body.innerHTML = body.join('')

    // Store the HTML element for the score menu
    scoreWindowRed = document.getElementById("scoreWindowRed")
    scoreWindowGreen = document.getElementById("scoreWindowGreen")
    eventWindow = document.getElementById("eventWindow")
    
    DEBUG_FILL_PLAYER()
    displayScore()
    
    initializeTimer(30, acknowledgeGameEnd)
    DEBUG_CHANGE_SCORES()
    DEBUG_FILL_EVENT()
    let checkBase = setTimeout(() => {
        acknowledgeBaseCapture("Makoto", 1000)
    }, 10000)
}

// Initializes a timer. Input is the length of the timer in seconds.
const initializeTimer = (interval, func) => {

    //Track current time for timer.
    let start = Date.now()
    let seconds = 0
    let displayTime = 30

    //Begin with 30s countdown until game begins, then 6 minute timer.
    //Have <pr> display diff messages. Use functions.
    let preGameTimer = setInterval(() => {
        document.getElementById("timer").innerHTML =   `00:${displayTime}`

        // Get the number of seconds that have passed.
        let diff = Date.now() - start
        let secondsInMS = diff % (1000 * 60) //Get the number of seconds in milliseconds
        seconds = Math.floor(secondsInMS / 1000) //Isolate number of seconds. Will be decimal, so must floor it.
        displayTime = 30 - seconds //seconds is counting up, so have displayTime count down

        if(seconds > interval) {
            clearInterval(preGameTimer)
            // DEBUG_gameTimer()
            // acknowledgeGameEnd()
            // console.log('adsf')
        }
    },100)

    let funcCall = setTimeout(() => {
        func()
    },interval*1000)
}

//DEBUG: Displays when timer runs out.
const DEBUG_gameTimer = () => {
    document.getElementById("timer").innerHTML = "finished timer"
    console.log("finished timer")
}

// Takes the current team arrays, sorts them, and writes out their contents into the HTML element.
const displayScore = () => {
    // Empty current scores.
    scoreWindowRed.innerHTML = ""
    scoreWindowGreen.innerHTML = ""

    // Sort the scores in each array.

    // Iterate through each sorted array, writing their contents to the HTLM selects.
    RED_TEAM.forEach((element) => {
        let option = document.createElement('option')
        display = element.username + " ---------- " + element.score
        option.value = display
        option.innerHTML = display
        scoreWindowRed.appendChild(option)
    })
    GREEN_TEAM.forEach((element) => {
        let option = document.createElement('option')
        display = element.username + " ---------- " + element.score
        option.value = display
        option.innerHTML = display
        scoreWindowGreen.appendChild(option)
    })
}

//End game. Stay on screen, but display a button that lets the user get back to the entry screen.
const acknowledgeGameEnd = () => {
    //Modify the inner HTML to display the exit button.
    //When pressed, it needs to reset to input screen!
    let returnButton = document.getElementById("returnButton")
    returnButton.style.display = "block"
}

// Player has their username modified to add [B] to the front
const acknowledgeBaseCapture = (username, newScore) => {
    // Find the player and modify their username with the base change.
    RED_TEAM.forEach((element) => {
        if (element.username == username) {
            let newUsername = "[B] " + element.username
            element.username = newUsername
            element.score = newScore
        }
    })
    GREEN_TEAM.forEach((element) => {
        if (element.username == username) {
            let newUsername = "[B] " + element.username
            element.username = newUsername
            element.score = newScore
        }
    })

    // Call the displayScore function so the points change is reflected
    displayScore()
}

// Update player scores when UDP sends player ID.
// OUTDATED, only kept for testing. UDP sends username instead.
// const updateScoreID = (playerID, newScore) => {
//     // Iterate through elements in both team arrays looking for desired player, and update their score when found
//     RED_TEAM.forEach((element) => {
//         if (element.id == playerID) {
//             element.score = newScore
//         }
//     })
//     GREEN_TEAM.forEach((element) => {
//         if (element.id == playerID) {
//             element.score = newScore
//         }
//     })

//     // Call the displayScore function so the scores reflect the change.
//     displayScore()
// }

// Updates score when UDP sends username.
const updateScore = (username, newScore) => {
    RED_TEAM.forEach((element) => {
        if (element.username == username) {
            element.score = newScore
        }
    })
    GREEN_TEAM.forEach((element) => {
        if (element.username == username) {
            element.score = newScore
        }
    })

    // Call the displayScore function so the scores reflect the change.
    displayScore()
}

// Posts an event to the event window. Takes in usernames of attacker and hit player.
const postEvent = (hitPlayer, attacker) => {
    let event = `Player ${attacker} hit ${hitPlayer}!`
    
    let option = document.createElement('option')
    option.value = event
    option.innerHTML = event
    eventWindow.appendChild(option)
    option.scrollIntoView()
}

// When backend sends game start permession
const acknowledgeGameStart = () => {
    //Initialize the action screen
    initializeActionScreen()
}

// DEBUG: Fills arrays 
const DEBUG_FILL_PLAYER = () => {
    RED_TEAM.push({username:'John', score:0, id:1})
    RED_TEAM.push({username:'Andrew', score:0, id:2})
    RED_TEAM.push({username:'Sarah', score:0, id:3})
    RED_TEAM.push({username:'Makoto', score:0, id:4})
    RED_TEAM.push({username:'George', score:0, id:5})

    GREEN_TEAM.push({username:'Stagg', score:0, id:6})
    GREEN_TEAM.push({username:'Leigh', score:0, id:7})
    GREEN_TEAM.push({username:'Chopper', score:0, id:8})
    GREEN_TEAM.push({username:'Kuma', score:0, id:9})
    GREEN_TEAM.push({username:'Keigh', score:0, id:10})
}

// DEBUG: Tests the various callback functions to make sure they work.
const DEBUG_CHANGE_SCORES = () => {
    let randNum = 0
    let randScore = 0
    let fillTimer = setInterval(() => {
        randNum = Math.floor(Math.random() * 10)
        randScore = Math.floor(Math.random() * 11)
        // console.log(randNum)
        // console.log(randScore)

        if(randNum >= 5) {
            randNum-=5
            // console.log(randNum)
            updateScore(GREEN_TEAM[randNum].username, randScore)
        }
        else {
            // console.log(randNum)
            updateScore(RED_TEAM[randNum].username, randScore)
        }
    },500)
}

// DEBUG: Puts random messages into the event queue to see if it works.
const DEBUG_FILL_EVENT = () => {
    let eventTimer = setInterval(() => {
        let randP1 = Math.floor(Math.random() * 10)
        let randP2 = Math.floor(Math.random() * 10)
        let P1
        let P2

        if(randP1 >= 5) {
            randP1-=5
            // console.log(randNum)
            P1 = GREEN_TEAM[randP1]
        }
        else {
            // console.log(randNum)
            P1 = RED_TEAM[randP1]
        }
        if(randP2 >= 5) {
            randP2-=5
            // console.log(randNum)
            P2 = GREEN_TEAM[randP2]
        }
        else {
            // console.log(randNum)
            P2 = RED_TEAM[randP2]
        }

        postEvent(P1.username, P2.username)
    },500)
}


/* BACKEND CONNECTION */
//connect to websocket API
const SOCKET = new WebSocket("ws://localhost:8001");

SOCKET.onmessage = messageHandler;

let nextID = 0;
let requests = {};

//two main types of messages recieved
//response and event
//response is formated as: RESPONSE; <id>; <data...>
//event is just: <event>; <timestamp>; <data...>
function messageHandler(msg) {
    //lastMessage = msg;
    msgParts = msg.data.split(";");
    switch (msgParts[0].toLowerCase()) {
        case "score_update":
            handleScoreUpdate(msgParts);
            break;
        case "base_capture":
            handleBaseCapture(msgParts);
            break;
        
        case "start_game":
            handleEndGame(msgParts);
            break;
        case "end_game":
            handleEndGame(msgParts);
            break;
        case "response":
            requests[msgParts[1].trim()](msgParts);
            delete requests[msgParts[1].trim()];
            break;
    }
    console.log("new message: " + msg.data);
}

//score_update; <timestamp>; <name>; <score>; <player_hit>
function handleScoreUpdate(msgParts) {
    let timestamp = Number(msgParts[1]);
    let name = msgParts[2];
    let score = Number(msgParts[3]);
    let player_hit = msgParts[4];

    //do_something
    updateScore(name, score)
    postEvent(player_hit, name)
}

//or base_capture; <timestamp>; <name>; <score>
function handleBaseCapture(msgParts) {
    let timestamp = Number(msgParts[1]);
    let name = msgParts[2];
    let score = Number(msgParts[3]);

    acknowledgeBaseCapture(name, score)
}

//end_game; <timestamp>
function handleEndGame(msgParts) {
    let timestamp = Number(msgParts[1]);

    acknowledgeGameEnd()
}
//start_game; <timestamp>
function handleStartGame(msgParts) {
    let timestamp = Number(msgParts[1]);
}

//request is what is wanted (like get_status)
//msg is a string of the paremeters (must be seperate)
function sendRequest(request, msg) {
    return new Promise((resolve, reject) => {
        requests[nextID] = (msg) => {
            resolve(msg.slice(2));
        };
        SOCKET.send(request + "; " + nextID + "; " + msg);
        nextID += 1;
    })
}

async function getStatus() {
    let status = await sendRequest("get_status","");
    return status[0].trim();
}

//request_start
//<success/fail>; optional<fail_message>
async function requestStart() {
    let request = await sendRequest("request_start", "");

    if (request[0].trim() == "fail") {
        throw new Error(request[1]);
    }
}

//get_scores
//<timestamp>; GREEN; <name1>:<score1>, ... <name_n>:<score_n>; RED; same...
async function getScores() {
    let scores = await sendRequest("get_scores", "");

    let green_scores = {};
    if (scores[2].trim() != "") {
        for (var player of scores[2].split(",")) {
            let parts = player.split(":");
            let name = parts[0].trim();
            let score = Number(parts[1].trim());
    
            green_scores[name] = score;
        }
    }

    let red_scores = {};

    if (scores[4].trim() != "") {
        for (var player of scores[4].split(",")) {
            let parts = player.split(":");
            let name = parts[0].trim();
            let score = Number(parts[1].trim());
    
            red_scores[name] = score;
        }
    }
    
    return {
        green_scores: green_scores,
        red_scores: red_scores,
        timestamp: Number(scores[0])
    };
}


//add_player_id; <equipmentID>; <playerID>
//<success/fail>; result<player_name, failure_message>
async function sendPlayerEntryById(equipmentID, playerID) {
    let result = await sendRequest("add_player_id", equipmentID + "; " + playerID);

    if (result[0].trim() == "fail") {
        throw new Error(result[1].trim());
    } else {
        //name
        return result[1].trim();
    }

}

//add_player_name; <equipmentID>; <playerID>; <playerName>
//<success/fail>; result<player_id, failure_message>
async function sendPlayerEntryByName(equipmentID, playerID, playerCodeName) {
    let result = await sendRequest("add_player_name", equipmentID + "; " + + playerID + "; " + playerCodeName);

    if (result[0].trim() == "fail") {
        throw new Error(result[1].trim());
    }
}


SOCKET.onopen = async () => {
    switch (await getStatus()) {
        case "waiting_for_start":
            splashScreen()
            //waiting for start
            break;
        case "in_play":
            break;
        case "game_over":
            break;
    }
}




//splashScreen()
