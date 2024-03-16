# People
* Hayden Threlfall: https://github.com/Hayden-Threlfall/
* Johnathon Gaines: https://github.com/JohnDog3112
* Lei Taylor: https://github.com/LeiTay
* Grace Harding: https://github.com/gharding04/
* Frederick Bumgarner: https://github.com/FrederickThemar
* Jonas Brown: jonasbrown5: https://github.com/Jonas-Brown 


# Execution
Project runs on Linux and Windows via powershell 

Requires a java development kit (jdk)

In order to run with the database, the password environmental variable must be set

(linux)
```
export password=<password>
```

(windows)
```
$env:password = <password>
```

To run, execute "./run.sh" in the main folder for linux or ./run.ps1 for powershell.


# Use
Once running, a link to a the website hosting the front end is provided. On this website, you can input all of your player's in each box. The first box is the player_id and the second their equipment_id. If their player_id isn't in the database, it will ask you for their name at the bottom. Please use a vpn that is not Global Protect (we recomend Cloudflare WARP) when trying to run this project if you are on campus wifi.
