package SOCKETS;

import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map.Entry;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import DATABASE.Database;
import SCORING.Scoring;
import SCORING.Players.PlayerScore;
import UDP.UDPSend;
import SCORING.Players;


public class Sockets extends WebSocketServer{
    private Players players;
    private Database database;
    private final Runnable gameStartMain;
    private final Runnable gameResetFunc;
    private long startTime = 0;

    enum GameState {
        SETUP,
        RUNNING,
        ENDED
    }
    private GameState gameState = GameState.SETUP;

    public Sockets(int port, Scoring scores, Database database, Players players, Runnable gameStartMain, Runnable gameResetFunc) throws UnknownHostException {
        super(new InetSocketAddress(port));
        this.gameStartMain = gameStartMain;
        this.gameResetFunc = gameResetFunc;
        this.players = players;
        this.database = database;
    }

    HashSet<WebSocket> connections = new HashSet<>();

    @Override
    public void onClose(WebSocket arg0, int arg1, String arg2, boolean arg3) {
    }

    @Override
    public void onError(WebSocket socket, Exception err) {
        System.out.println("error??");
    }

    @Override
    public void onMessage(WebSocket socket, String message) {
        System.out.println("message: " + message);
        String[] messageParts = message.split(";");
        System.out.println("request: " + messageParts[0].toLowerCase());
        
        switch (messageParts[0].toLowerCase()) {
            case "get_status":
                this.getStatus(socket, messageParts);
                break;
            case "request_start":
                this.requestStart(socket, messageParts);
                break;
            case "get_scores":
                this.getScores(socket, messageParts);
                break;
            case "add_player_id":
                this.addPlayerByID(socket, messageParts);
                break;
            case "add_player_name":
                this.addPlayerByName(socket, messageParts);
                break;
            case "clear_players":
                this.clearPlayers(socket, messageParts);
                break;
            default:
                //socket.send("RESPONSE; " + messageParts[1] + "; UNKNOWN_REQUEST");
                this.sendResponse(socket, messageParts[1], "unknown request");
        }
    }

    @Override
    public void onOpen(WebSocket arg0, ClientHandshake arg1) {
    }

    @Override
    public void onStart() {
        System.out.println("Started connection!");
    }


    private void sendResponse(WebSocket socket, String id, String message) {
        socket.send("response; " + id + "; " + message);
    }

    //get_status;
    //returns:
    //  response; <status>; optional<start_time>
    //where status = waiting_for_start, in_play, or game_over
    //and start_time is present if the game is in_play
    public void getStatus(WebSocket socket, String[] message) {

        String responseMsg;
        switch (gameState) {
            case SETUP:
                responseMsg = "waiting_for_start";
                break;
            case RUNNING:
                responseMsg = "in_play; " + this.startTime;
                break;
            case ENDED:
                responseMsg = "game_over";
                break;
            
            default:
                responseMsg = "waiting_for_start";
                break;
        }

        this.sendResponse(socket, message[1], responseMsg);
        //socket.send("RESPONSE; " + message[1] + "; waiting_for_start");
    }

    //(recieve)
    //request_start; <request_id>
    //response; <request_id>; <sucess/fail>; optional<fail_message>
    private void requestStart(WebSocket socket, String[] message) {
        //this.broadcast("acknowledged");
        if (gameState != GameState.RUNNING) {
            this.gameStartMain.run();
            this.sendResponse(socket, message[1], "success");
        } else {
            this.sendResponse(socket, message[1], "fail; game is already running");
        }
    }

    //clear_players; <request_id>
    //response; <request_id>; <success/fail>; optional<fail_message>
    private void clearPlayers(WebSocket socket, String[] message) {
        if (gameState == GameState.RUNNING) {
            this.sendResponse(socket, message[1], "fail; Game is currently running");
        } else {
            this.gameResetFunc.run();
            this.sendResponse(socket, message[1], "success");
        }
    }

    //get_scores; <request_id>
    //response; <request_id>; <timestamp>; GREEN; <name1>:<score1>:<captured1?>, ... <name_n>:<score_n>:<captured_n?>; RED; same...
    private void getScores(WebSocket socket, String[] message) {
        ArrayList<String> green = new ArrayList<>();
        ArrayList<String> red = new ArrayList<>();

        for (PlayerScore score : this.players.getAllScores()) {
            String entry = score.codeName + ":" + Integer.toString(score.score)
                + ":" + (score.capturedBase ? "true" : "false");
            
            if (score.isRedTeam) {
                red.add(entry);
            } else {
                green.add(entry);
            }
        }

        String greenString = String.join(",", green);
        String redString = String.join(",", red);

        Date now = new Date();

        this.sendResponse(socket, message[1], now.getTime() + "; GREEN; " + greenString + "; RED; " + redString);
    }

    //add_player_id; <request_id>; <equipmentID>; <playerID>
    //<success/fail>; result<player_name, failure_message>
    private void addPlayerByID(WebSocket socket, String[] message) {
        int equipmentID = Integer.parseInt(message[2].trim());
        long playerID = Long.parseLong(message[3].trim());
        //do something

        String codeName = database.searchPlayer(playerID);

        if (codeName == "NOT FOUND") {
            this.sendResponse(socket, message[1], "fail; missing_id");
        } else {
            this.players.setPlayer(playerID, equipmentID, codeName);

            UDPSend.send(Integer.toString(equipmentID));

            this.sendResponse(socket, message[1], "success; " + codeName);
        }
    }


    //add_player_id; <request_id>; <equipmentID>; <player_id>; <playerName>
    //<success/fail>; optional<failure_message>
    private void addPlayerByName(WebSocket socket, String[] message) {
        int equipmentID = Integer.parseInt(message[2].trim());
        long playerID = Long.parseLong(message[3].trim());
        String codeName = message[4].trim();
        //do something

        database.addPlayer(playerID, codeName);
        
        this.players.setPlayer(playerID,equipmentID, codeName);

        UDPSend.send(Integer.toString(equipmentID));

        this.sendResponse(socket, message[1], "success");
    }


    //events:


    //start_game; <timestamp>
    public void startGame(long startTime) {
        this.gameState = GameState.RUNNING;
        this.startTime = startTime;
        this.broadcast("start_game; " + startTime);
    }
    
    //end_game; <timestamp>
    public void end() {
        this.gameState = GameState.ENDED;
        Date now = new Date();
        this.broadcast("end_game; " + now.getTime());
    }

    //score_update; <timestamp>; <name>; <score>; <player_hit>
    //or base_capture; <timestamp>; <name>; <score>
    public void update(int equipmentID, int score, int hitID) {
        Date now = new Date();
        String playerName = players.getCodeName(equipmentID);
        

        //base capture
        if (hitID == -1) {
            this.broadcast("base_capture; " + now.getTime() + "; " + playerName + "; " + score);
        } else {
            String hitName = players.getCodeName(hitID);
            this.broadcast("score_update; " + now.getTime() + "; " + playerName + "; " + score + "; " + hitName);
        }   
    }


}
