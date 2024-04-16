//press ENTER to send to backend
/* GLOBAL VARIABLES */
// List of players. Stores dicts for each player, containing their name, ID, and current score.
let GREEN_TEAM = []
let RED_TEAM = []
/* JSON Format: 
    username:'str',
    playerID:int,
    score:int,
    team:int */
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
    // const background = document.getElementById("body");
    // background.style.backgroundImage = "background.jpg";

    document.body.appendChild(logo)

    setTimeout(() => {
        document.body.removeChild(logo)
        initializeEntryScreen()
    },3000)
}

let playerName = ""; // Initialize playerName variable

/* FUNCTIONS */

/* PLAYER SCREEN */
const initializeEntryScreen = function() {
    let body = []
    body.push('<br>')
    document.body.innerHTML = body.join('')
    const editScreenDiv = document.createElement("div");
    editScreenDiv.id = "editScreen";

    // Header
    const header = document.createElement("h1");
    header.style.color = "yellow";
    header.style.fontSize = "70px"
    header.style.textAlign = "center";
    header.style.textShadow = "0 0 12px white";
    header.style.webkitTextStrokeWidth = "2px";
    header.style.webkitTextStrokeColor = "black";
    header.style.margin = "0";
    header.style.padding = "0";
    header.style.fontFamily = "Courier";
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
        if (event.ctrlKey && event.shiftKey) {
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
                const playerIdInput = entryRow.getElementsByClassName("playerID")[0]; // Player ID input is the current input field
                const playerId = playerIdInput.value.trim();

                // Determine the equipment ID based on the row label and team color
                const equipmentIdLabel = entryRow.querySelector("div:first-child"); // Select the first child (label) of the entry row
                const equipmentId = equipmentIdLabel.textContent.padStart(2, '0'); // Extract the equipment ID from the label

                handleEnterPress(equipmentId, playerId);
            }
        });
    });
};

const handleEnterPress = async function (equipmentId, playerId, team) {
    const codenameInput = document.getElementById("codename-" + Number(equipmentId));
    if (codenameInput.disabled) {
        const playerIDInput = document.getElementById("playerID-" + Number(equipmentId));
        playerIDInput.disabled = true;
        playerIDInput.style.backgroundColor = "white";
        try {
            await sendPlayerEntryById(Number(equipmentId), Number(playerId));
        } catch (error) {
            // Handle error
            console.error(error);
            // Enable the Codename input associated with the failed entry
            enableCodenameInput(equipmentId);
            
        }
    } else {
        await sendPlayerEntryByName(Number(equipmentId), playerId, codenameInput.value);
        codenameInput.disabled = true;
    }

    //If successful 
};

const enableCodenameInput = function (equipmentId) {
    //const codenameInput = document.querySelector(`#editScreen input[type='text'][value='${equipmentId}'] + input[type='text']`);
    const codenameInput = document.getElementById("codename-" + Number(equipmentId));
    codenameInput.disabled = false;
    codenameInput.style.backgroundColor = "white";
};

const codenameInputs = {};
const createTeamDiv = function(teamName) {
    const teamDiv = document.createElement("div");
    teamDiv.style.backgroundColor = teamName === "Red Team" ? "red" : "rgb(31,207,49)";
    teamDiv.style.width = "45%";
    teamDiv.style.padding = "10px";
    teamDiv.style.boxShadow = teamName === "Red Team" ? "0 0 50px red" : "0 0 50px rgb(31,207,49)";

    // Header
    const header = document.createElement("h2");
    header.style.color = "white";
    header.style.textShadow = "0 0 20px white";
    header.style.fontSize = "40px";
    header.style.margin = "15px";
    header.style.padding = "2px";
    header.textContent = teamName;
    header.style.fontFamily = "Courier";
    teamDiv.appendChild(header);

    // Entries
    const entriesDiv = document.createElement("div");

    // Column labels
    const labelsRow = document.createElement("div");
    labelsRow.style.display = "flex";
    labelsRow.style.marginTop = "5px";
    labelsRow.style.color = "white"; // Set text color to white

    const labels = ["HID", "Player ID", "Codename"];
    const flexValues = ["0.09", "0.3", "0.5"]; // Adjust flex values here for different spacing

    labels.forEach((labelText, index) => {
        const label = document.createElement("div");
        label.textContent = labelText;
        label.style.flex = flexValues[index]; // Apply flex values to each label column
        labelsRow.appendChild(label);
    });

    teamDiv.appendChild(labelsRow);

    for (let i = 1; i <= 30; i++) {
        if ((teamName === "Red Team" && i % 2 !== 0) || (teamName === "Green Team" && i % 2 === 0)) {
            const entryRow = document.createElement("div");
            entryRow.style.display = "flex";
            entryRow.style.marginTop = "5px";

            // Number label
            const numberLabel = document.createElement("div");
            numberLabel.textContent = i < 10 ? `0${i}` : `${i}`;
            entryRow.appendChild(numberLabel);

            // Player ID input
            const playerIdInput = document.createElement("input");
            playerIdInput.type = "text";
            playerIdInput.maxLength = 10;
            playerIdInput.style.marginRight = "10px";
            playerIdInput.setAttribute("id", "playerID-" + i);
            playerIdInput.setAttribute("class", "playerID");
            playerIdInput.addEventListener("input", function(event) {
                this.value = this.value.replace(/\D/g, ''); // Allow only numeric input
            });
            entryRow.appendChild(playerIdInput);

            // Codename input
            const codenameInput = document.createElement("input");
            codenameInput.type = "text";
            codenameInput.maxLength = 10;
            codenameInput.style.marginRight = "10px";
            codenameInput.disabled = true; // Initially disabled
            codenameInput.setAttribute("id", "codename-" + i);
            entryRow.appendChild(codenameInput);
            // Store reference to Codename input
            codenameInputs[i] = codenameInput;

            entriesDiv.appendChild(entryRow);
        }
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
        requestStart();
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

function startMusic(){
    var trackNum = parseint((Math.random()*8)% 8, 10);
    var track = new Audio('Track0'+ trackNum + '.mp3');
    track.play()
}

/* ACTION SCREEN */
async function initializeActionScreen() {
    let body = []
    body.push(`
    <div id="timerParent" style="text-align:center; color:#fff">
        <pr id="timer"></pr>
    </div>
    <br><br>
    <div style="text-align:center;">
        <table id="redTable" class="head" style="float:left; width:45%; background-color:#900; color:#fff; border-spacing:0px">
            <thead>
                <tr class="head">
                    <th style="width:80%">Username</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody id="scoreWindowRed">
            </tbody>
        </table>
        <table id="greenTable" style="float:right; width:45%; background-color:#060; color:#fff; border-spacing:0px">
            <thead>    
                <tr style="top:5px;">
                    <th style="width:80%">Username</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody id="scoreWindowGreen">
            </tbody>
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
    // console.log(playerNames)
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
        if (info.base_captured === 'true')
            name = "{B} " + name
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
    // updateScore("Hayden", 100)
    //startMusic()
    // After 30 second timer, starts another one that calls acknowledgeGameEnd.
    initializePreGameTimer()
    // DEBUG_CHANGE_SCORES()
    // DEBUG_FILL_EVENT()
    // let checkBase = setTimeout(() => {
    //     acknowledgeBaseCapture("Makoto", 1000)
    // }, 10000)
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

// const animateSort = (team_array) => {
//     let rowTop = 0
//     $.each(team_array, (index) => {
//         let username = team_array[index].username
//         let $tableCell = $('tbody tr#'+username)

//         $(`#${username}Score`).text(`${team_array[index].score}`)
        
//         // Animate cell to scroll to correct position
//         $tableCell.animate({
//             backgroundColor: '#900',
//             position: 'absolute',
//             top: rowTop+'px',
//         }, 500)

//         rowTop += $tableCell.outerHeight()
//     })
// }

// Fills the scoreboard. Sorts it in case it is mid-game.
const displayScore = () => {
    // Empty current scores.
    let redTable = ''
    let greenTable = ''
    
    // Sort the scores in each array.
    RED_TEAM.sort(function(a,b) {
        return b.score - a.score
    })
    GREEN_TEAM.sort(function(a,b) {
        return b.score - a.score
    })

    // Iterate through each sorted array, writing their contents to the HTLM selects.
    RED_TEAM.forEach((element) => {
        let row = `<tr id="${element.username}"><td style="width:80%">${element.username}</td><td id="${element.username}Score">${element.score}</td></tr>`
        redTable += row
        element.$html = $(`${row}`)
    })
    GREEN_TEAM.forEach((element) => {
        let row = `<tr id="${element.username}"><td style="width:80%">${element.username}</td><td id="${element.username}Score">${element.score}</td></tr>`
        greenTable += row
        element.$html = $(`${row}`)
    })

    scoreWindowRed.innerHTML = redTable
    scoreWindowGreen.innerHTML = greenTable
}

// Takes the current team arrays, sorts them, and writes out their contents into the HTML element.
// const displayScore = () => {
//     // Empty current scores.
//     // let redTable = '<tr><th style="width:80%">Username</th><th>Score</th></tr>'
//     // let greenTable = '<tr><th style="width:80%">Username</th><th>Score</th></tr>'
//     // let tableTop = document.getElementById("scoreWindowRed").getBoundingClientRect().top

//     // console.log(`${tableTop}`)

//     // Sort the scores in each array.
//     // let redTable = ''
//     // let greenTable = ''
    
//     // Sort the scores in each array.
//     RED_TEAM.sort(function(a,b) {
//         return b.score - a.score
//     })
//     GREEN_TEAM.sort(function(a,b) {
//         return b.score - a.score
//     })

//     animateSort(RED_TEAM)

//     // Iterate through each sorted array, writing their contents to the HTLM selects.
//     // let rowHeight = $(`#redTable`).height()
//     // // let y = rowHeight
//     // // // for (let i = 0; i<RED_TEAM.length; i++) {
//     // // //     // $(`#${RED_TEAM[i].username}`).css("top", y+"px")
//     // // //     // $(`#${RED_TEAM[i].username}`)
//     // // //     // .find('div')
//     // // //     // .animate({top:y+"px"}, 500, () => {
//     // // //     //     $(this).parent().parent().remove()
//     // // //     // })
//     // // //     // console.log(y)
//     // // //     y += rowHeight
//     // // // }
//     // RED_TEAM.forEach((element) => {
//     //     let row = `<tr id="${element.username}"><td>${element.username}</td><td>${element.score}</td></tr>`
//     //     redTable += row
//     // })
//     // GREEN_TEAM.forEach((element) => {
//     //     let row = `<tr id="${element.username}"><td>${element.username}</td><td>${element.score}</td></tr>`
//     //     greenTable += row
//     // })

//     // scoreWindowRed.innerHTML = redTable
//     // scoreWindowGreen.innerHTML = greenTable

//     // let j = 2
//     // RED_TEAM.forEach((element) => {
//     //     let height = document.getElementsByTagName("table")[0].rows.height
//     //     console.log(height)
//     //     for (let i = 0; i < redRows.length; i++) {
//     //         // const line = redRows[i]
//     //         const line = document.getElementById(`${element.username}`)
//     //         if(element.username === line.id) {
//     //             line.innerHTML = `<td>${element.username}</td><td>${element.score}</td>`
//     //             const rowHeight = line.getBoundingClientRect().height
//     //             line.style = `top: ${rowHeight*j}px`
//     //             j++
//     //         }
//     //     }
//     // })

//     // for (let i = 0; i < redRows.length; i++) {
//     //     const line = redRows[i]
//     //     const rowTop = line.getBoundingClientRect().top
//     //     console.log(line.id)

//     //     //IDEA: Go through each item in RED_TEAM, and check if they match. If so, do "top: rowHeight*y"
//     //     // if(line.id === "") continue
//     //     let j = 1
//     //     RED_TEAM.forEach((element) => {
//     //         if(element.username === line.id) {
                
//     //         }
//     //         j++
//     //     })

//     //     // line.style.transform = `translateY(${position * line.offsetHeight})`
//     // }

//     // RED_TEAM.forEach((element) => {
//     //     let option = document.createElement('option')
//         // display = element.username + " ---------- " + element.score
//     //     option.value = display
//     //     option.innerHTML = display
//     //     scoreWindowRed.appendChild(option)
//     // })
//     // GREEN_TEAM.forEach((element) => {
//     //     let option = document.createElement('option')
//     //     display = element.username + " ---------- " + element.score
//     //     option.value = display
//     //     option.innerHTML = display
//     //     scoreWindowGreen.appendChild(option)
//     // })
// }

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
            let newUsername = "[ℬ] " + element.username
            element.username = newUsername
            element.score = newScore
        }
    })
    GREEN_TEAM.forEach((element) => {
        if (element.username == username) {
            let newUsername = "[ℬ] " + element.username
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
            handleStartGame(msgParts);
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
        /*name
        return result[1].trim();*/
        //new part
        // If successful, extract the returned Codename
        const codename = result[1].trim();
        // Find the corresponding Codename input and set its value
        //const codenameInput = document.querySelector(`#editScreen input[type='text'][value='${equipmentID}'] + input[type='text']`);
        const codenameInput = document.getElementById("codename-" + Number(equipmentID));
        codenameInput.value = codename;
        // Disable and style the Codename input
        codenameInput.disabled = true;
        codenameInput.style.backgroundColor = "white";
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
