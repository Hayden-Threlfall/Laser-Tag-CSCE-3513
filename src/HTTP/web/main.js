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
        "F5 Start Game",
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

    //Click Event listeners for buttons
    const buttons = document.querySelectorAll("#editScreen button");
    buttons.forEach(button => {
        button.addEventListener("click", handleButtonClick);
    });

    // Button Press Event listeners
    document.addEventListener("keydown", function(event) {
        if (event.key === "F5") {
            document.getElementById("editScreen").style.display = "none";
            requestStart();
        } else if (event.key === "F1") {
            document.getElementById("editScreen").style.display = "block";
            document.getElementById("actionScreen").remove();
        } else if (event.key === "DEL") {
            // Clear selected entry
            clearSelectedEntry();
        } else if (event.key === "F12") {
            // Clear all entries
            clearAllEntries();
        }
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

const handleEnterPress = async function (equipmentId, playerId, team) {
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

    //If successful 
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
        if (i < 10) {
            numberLabel.textContent = `0${i}`;    
        }
        else {
            numberLabel.textContent = `${i} `;
        }
        // numberLabel.textContent = `${i}`;
        entryRow.appendChild(numberLabel);

        // Player ID input
        const playerIdInput = document.createElement("input");
        playerIdInput.type = "text";
        playerIdInput.maxLength = 10;
        playerIdInput.style.marginRight = "10px";
        playerIdInput.addEventListener("input", function(event) {
            this.value = this.value.replace(/\D/g, ''); // Allow only numeric input
        });
        entryRow.appendChild(playerIdInput);

        // Equipment ID input
        const equipmentIDInput = document.createElement("input");
        equipmentIDInput.type = "text";
        equipmentIDInput.maxLength = 10;
        equipmentIDInput.addEventListener("input", function(event) {
            this.value = this.value.replace(/\D/g, ''); // Allow only numeric input
        });
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
    } else if (buttonText === "F5 Start Game") {
        document.getElementById("editScreen").style.display = "none";
        frontendGameStart();
    } else if (buttonText === "F12 Clear Game") {
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
async function initializeActionScreen() {
    let body = []
    body.push(`
    <div id="timerParent" style="text-align:center;">
        <pr id="timer"></pr>
    </div>
    <br><br>
    <div style="text-align:center;">
        <table id="scoreWindowRed" style="float:left;">
            <tr>
                <th scope="col">Username</th>
                <th scope="col">Score</th>
            </tr>
        </table>
        <table id="scoreWindowGreen" style="float:right;">
            <tr>
                <th >Username</th>
                <th >Score</th>
            </tr>
        </table>
    </div>
    <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
    <div style="margin:auto;text-align:center;">
        <select id="eventWindow" size="15" style="width:50%;"></select>
    </div>
    <button id="returnButton" onclick="initializeEntryScreen()" style="display:none">Back to input screen</button>`)

    // <select id="scoreWindowRed" size="15" style="float:left; width:500px; background:#900; color:#fff"></select>
    // <select id="scoreWindowGreen" size="15"  style="float:right; width:500px; background:#060; color:#fff"></select>
    document.body.innerHTML = body.join('')

    // Store the HTML element for the score menu
    scoreWindowRed = document.getElementById("scoreWindowRed")
    scoreWindowGreen = document.getElementById("scoreWindowGreen")
    eventWindow = document.getElementById("eventWindow")
    
    // Get the player names to store in the arrays
    playerNames = await getScores() //Returns a dict containins two dicts with usernames separated by team
    console.log(playerNames)
    for (const [name, info] of Object.entries(playerNames['red_scores'])) {
        //green_scores[name] = {
        //     score: score,
        //     base_captured: base_captured
        // };
        if (info.base_captured === 'true')
            name = "{B} " + name
        RED_TEAM.push({'username':name, 'score':info.score})
    }
    for (const [name, info] of Object.entries(playerNames['green_scores'])) {
        GREEN_TEAM.push({'username':name, 'score':info.score})
    }
    // playerNames['red_scores'].forEach(user => {
    //     // user is a dict. Each key is a username and each value is a score.
    //     // Append usernames to team array.
    //     RED_TEAM.push({'username':user.key, 'score':user[user.key]})
    // })
    // playerNames['green_scores'].forEach(user => {
    //     GREEN_TEAM.push({'username':user.key, 'score':user[user.key]})
    // })

    // DEBUG_FILL_PLAYER()
    displayScore()
    
    // After 30 second timer, starts another one that calls acknowledgeGameEnd.
    initializePreGameTimer()
    DEBUG_CHANGE_SCORES()
    // DEBUG_FILL_EVENT()
    let checkBase = setTimeout(() => {
        acknowledgeBaseCapture("Makoto", 1000)
    }, 10000)
}

// Initializes the 30s pregame timer. After, calls initializeGameTimer.
// Input is when the timer began
const initializePreGameTimer = (timePassed) => {
    let interval = 30

    //Track current time for timer.
    let start = Date.now()
    let seconds = 0
    let displayTime = 30

    //Begin with 30s countdown until game begins, then 6 minute timer.
    //Have <pr> display diff messages. Use functions.
    let preGameTimer = setInterval(() => {
        document.getElementById("timer").innerHTML =   `00:${String(displayTime).padStart(2,"0")}`
        // if (displayTime > 9)
        //     document.getElementById("timer").innerHTML =   `00:${displayTime}`
        // else if (displayTime > 0 && displayTime < 10)
        //     document.getElementById("timer").innerHTML =   `00:0${displayTime}`
        // else
        //     document.getElementById("timer").innerHTML =   `00:00`
        // Get the number of seconds that have passed.
        let diff = Date.now() - start
        let secondsInMS = diff % (1000 * 60) //Get the number of seconds in milliseconds
        seconds = Math.floor(secondsInMS / 1000) //Isolate number of seconds. Will be decimal, so must floor it.
        displayTime = 30 - seconds //seconds is counting up, so have displayTime count down
        // displayTime = String(temp)

        if(seconds > interval) {
            clearInterval(preGameTimer)
            initializeGameTimer()
            // DEBUG_gameTimer()
            // acknowledgeGameEnd()
            // console.log('adsf')
        }
    },100)

    // let funcCall = setTimeout(() => {
    //     // Call next timer function
    //     initializeGameTimer()
    // },interval*1000)
}

// Creates 6 minute timer. After, calls acknowledgeGameEnd() to print the return to entry screen button.
const initializeGameTimer = () => {
    let interval = 360

    //Track current time for timer.
    let start = Date.now()
    let seconds = 0
    let minutes = 0
    let displaySeconds = 0
    let displayMinutes = 6

    //Begin with 30s countdown until game begins, then 6 minute timer.
    //Have <pr> display diff messages. Use functions.
    let GameTimer = setInterval(() => {
        document.getElementById("timer").innerHTML =   `0${displayMinutes}:${String(displaySeconds).padStart(2,"0")}`
        // if (displaySeconds > 9 && displaySeconds < 60)
        //     document.getElementById("timer").innerHTML =   `0${displayMinutes}:${displaySeconds}`
        // else if (displaySeconds > 0 && displaySeconds < 10)
        //     document.getElementById("timer").innerHTML =   `0${displayMinutes}:0${displaySeconds}`
        // else if (displayMinutes > 0)
        //     document.getElementById("timer").innerHTML =   `0${displayMinutes}:00`
        // else
        //     document.getElementById("timer").innerHTML =   `00:00`
        // Get the number of seconds that have passed.
        let diff = Date.now() - start
        let secondsInMS = diff % (1000 * 60 * 60) //Get the number of seconds in milliseconds
        seconds = Math.floor(secondsInMS / 1000) //Isolate number of seconds. Will be decimal, so must floor it.
        minutes = Math.floor(seconds / 60)
        // console.log(minutes)
        displayMinutes = 5 - minutes
        displaySeconds = (60 - (seconds % 60)) % 60 //seconds is counting up, so have displayTime count down      

        if (displaySeconds === 0)
            displayMinutes++

        if(seconds > interval) {
            clearInterval(GameTimer)
            acknowledgeGameEnd()
            // DEBUG_gameTimer()
            // acknowledgeGameEnd()
            // console.log('adsf')
        }
    },100)
}

//DEBUG: Displays when timer runs out.
const DEBUG_gameTimer = () => {
    document.getElementById("timer").innerHTML = "finished timer"
    console.log("finished timer")
}

// Takes the current team arrays, sorts them, and writes out their contents into the HTML element.
const displayScore = () => {
    // Empty current scores.
    let redTable = "`<tr><th >Username</th><th >Score</th></tr>"
    let greenTable = "`<tr><th >Username</th><th >Score</th></tr>"

    // Sort the scores in each array.
    RED_TEAM.sort(function(a,b) {
        return b.score - a.score
    })
    GREEN_TEAM.sort(function(a,b) {
        return b.score - a.score
    })

    // Iterate through each sorted array, writing their contents to the HTLM selects.
    RED_TEAM.forEach((element) => {
        let row = `<tr><td>${element.username}</td><td>${element.score}</td></tr>`
        redTable += row
    })
    GREEN_TEAM.forEach((element) => {
        let row = `<tr><td>${element.username}</td><td>${element.score}</td></tr>`
        greenTable += row
    })

    scoreWindowRed.innerHTML = redTable
    scoreWindowGreen.innerHTML = greenTable
    // RED_TEAM.forEach((element) => {
    //     let option = document.createElement('option')
        // display = element.username + " ---------- " + element.score
    //     option.value = display
    //     option.innerHTML = display
    //     scoreWindowRed.appendChild(option)
    // })
    // GREEN_TEAM.forEach((element) => {
    //     let option = document.createElement('option')
    //     display = element.username + " ---------- " + element.score
    //     option.value = display
    //     option.innerHTML = display
    //     scoreWindowGreen.appendChild(option)
    // })
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

const postBaseEvent = (playerName) => {
    let event = `Player ${playerName} captured the base!`
    
    let option = document.createElement('option')
    option.value = event
    option.innerHTML = event
    eventWindow.appendChild(option)
    option.scrollIntoView()
}

// When backend sends game start permession
const frontendGameStart = () => {
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
    },1500)
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
    console.log("new message: " + msg.data);
    switch (msgParts[0].toLowerCase()) {
        case "score_update":
            handleScoreUpdate(msgParts);
            break;
        case "base_capture":
            handleBaseCapture(msgParts);
            break;
        
        case "start_game":
            handleGame(msgParts);
            break;
        case "end_game":
            handleEndGame(msgParts);
            break;
        case "response":
            requests[msgParts[1].trim()](msgParts);
            delete requests[msgParts[1].trim()];
            break;
    }
}

//score_update; <timestamp>; <name>; <score>; <player_hit>
function handleScoreUpdate(msgParts) {
    let timestamp = Number(msgParts[1]);
    let name = msgParts[2].trim();
    let score = Number(msgParts[3]);
    let player_hit = msgParts[4].trim();


    //updateScore(GREEN_TEAM[randNum].username, randScore)

    //do_something
    updateScore(name, score)
    postEvent(player_hit, name)
}

//or base_capture; <timestamp>; <name>; <score>
function handleBaseCapture(msgParts) {
    let timestamp = Number(msgParts[1]);
    let name = msgParts[2].trim();
    let score = Number(msgParts[3]);

    acknowledgeBaseCapture(name, score)
    postBaseEvent(name)
}

//end_game; <timestamp>
function handleEndGame(msgParts) {
    let timestamp = Number(msgParts[1]);

    acknowledgeGameEnd()
}
//start_game; <timestamp>
function handleStartGame(msgParts) {
    let timestamp = Number(msgParts[1]);
    frontendGameStart();
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
    let status_val = status[0].trim();
    if (status_val == "in_play") {
        return {
            status: status_val,
            start_time: Number(status[1].trim())
        };
    }
    return {
        status: status_val,
    };
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
//<timestamp>; GREEN; <name1>:<score1>:<captured1?>, ... <name_n>:<score_n>:<captured2?>; RED; same...
async function getScores() {
    let scores = await sendRequest("get_scores", "");

    let green_scores = {};
    if (scores[2].trim() != "") {
        for (var player of scores[2].split(",")) {
            let parts = player.split(":");
            let name = parts[0].trim();
            let score = Number(parts[1].trim());
            let base_captured = parts[2].trim() == "true";
    
            green_scores[name] = {
                score: score,
                base_captured: base_captured
            };
        }
    }

    let red_scores = {};

    if (scores[4].trim() != "") {
        for (var player of scores[4].split(",")) {
            let parts = player.split(":");
            let name = parts[0].trim();
            let score = Number(parts[1].trim());
            let base_captured = parts[2].trim() == "true";
    
            red_scores[name] = {
                score: score,
                base_captured: base_captured
            };
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
    let status = await getStatus();
    switch (status.status) {
        case "waiting_for_start":
            splashScreen()
            //waiting for start
            break;
        case "in_play":
            frontendGameStart(/*status.start_time*/);
            break;
        case "game_over":
            initializeEntryScreen();
            break;
    }
}