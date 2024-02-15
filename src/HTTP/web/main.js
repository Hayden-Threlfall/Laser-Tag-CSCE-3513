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

/* FUNCTIONS */
/* SPLASH SCREEN */
const splashScreen = () => {
    let width = 3487
    let height = 2221
    let logo = new Image(width, height)
    logo.src = "logo.jpg"

    document.body.appendChild(logo)

    setTimeout(() => {
        document.body.removeChild(logo)
        initializeEntryScreen()
    },3000)
}

/* PLAYER SCREEN */
const initializeEntryScreen = function() {
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

    // Event listeners
    document.addEventListener("keydown", function(event) {
        if (event.key === "3") {
            document.getElementById("editScreen").style.display = "none";
            acknowledgeGameStart();
        } else if (event.key === "1") {
            document.getElementById("editScreen").style.display = "block";
            document.getElementById("actionScreen").remove();
        } else if (event.key === "Delete") {
            // Clear selected entry
            clearSelectedEntry();
        } else if (event.key === "0") {
            // Clear all entries
            clearAllEntries();
        }
    });
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
        playerIdInput.maxLength = 5;
        playerIdInput.style.marginRight = "10px";
        entryRow.appendChild(playerIdInput);

        // Player code input
        const playerCodeInput = document.createElement("input");
        playerCodeInput.type = "text";
        playerCodeInput.maxLength = 10;
        entryRow.appendChild(playerCodeInput);

        entriesDiv.appendChild(entryRow);
    }

    teamDiv.appendChild(entriesDiv);

    return teamDiv;
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
        <select id="scoreWindowRed" size="8" style="float:left; width:500px"></select>
        <select id="scoreWindowGreen" size="8"  style="float:right; width:500px"></select>
    </div>
    <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
    <button id="returnButton" style="display:none">Back to input screen</button>`)

    document.body.innerHTML = body.join('')

    // Store the HTML element for the score menu
    scoreWindowRed = document.getElementById("scoreWindowRed")
    scoreWindowGreen = document.getElementById("scoreWindowGreen")
    
    DEBUG_FILL_PLAYER()
    displayScore()
    
    initializeTimer(30)
    DEBUG_CHANGE_SCORES()
    let checkBase = setTimeout(() => {
        acknowledgeBaseCapture(4, 1000)
    }, 10000)
}

// Initializes a timer. Input is the length of the timer in seconds.
const initializeTimer = (interval) => {
    //Insert HTML
    //Idea: Use a <pr> and write timer to it

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
const acknowledgeBaseCapture = (playerID, newScore) => {
    // Find the player and modify their username with the base change.
    RED_TEAM.forEach((element) => {
        if (element.id == playerID) {
            let newUsername = "[B] " + element.username
            element.username = newUsername
            element.score = newScore
        }
    })
    GREEN_TEAM.forEach((element) => {
        if (element.id == playerID) {
            let newUsername = "[B] " + element.username
            element.username = newUsername
            element.score = newScore
        }
    })

    // Call the displayScore function so the points change is reflected
    displayScore()
}

// Update player scores when UDP sends player ID.
const acknowledgeScore = (playerID, newScore) => {
    // Iterate through elements in both team arrays looking for desired player, and update their score when found
    RED_TEAM.forEach((element) => {
        if (element.id == playerID) {
            element.score = newScore
        }
    })
    GREEN_TEAM.forEach((element) => {
        if (element.id == playerID) {
            element.score = newScore
        }
    })

    // Call the displayScore function so the scores reflect the change.
    displayScore()
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

// DEBUG; Tests the various callback functions to make sure they work.
const DEBUG_CHANGE_SCORES = () => {
    let randNum = 0
    let randScore = 0
    let fillTimer = setInterval(() => {
        randNum = Math.floor(Math.random() * 11)
        randScore = Math.floor(Math.random() * 11)
        // console.log(randNum)
        // console.log(randScore)
        acknowledgeScore(randNum, randScore)
    },500)
}

splashScreen()