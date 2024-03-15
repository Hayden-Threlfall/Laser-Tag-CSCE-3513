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
import UDP.Scoring;
import UDP.UDPSend;
import UDP.Players;


public class Sockets extends WebSocketServer{
    // private class PlayerInfo {
    //     public final String codeName;
    //     public final long playerID;
    //     public PlayerInfo(String codeName, long playerID) {
    //         this.codeName = codeName;
    //         this.playerID = playerID;
    //     }
    // }

    // private Scoring scores;
    private Players players;
    private Database database;
    private final Runnable gameStartMain;

    enum GameState {
        SETUP,
        RUNNING,
        ENDED
    }
    private GameState gameState = GameState.SETUP;
    // private HashMap<Integer, PlayerInfo> players;

    public Sockets(int port, Scoring scores, Database database, Players players, Runnable gameStartMain) throws UnknownHostException {
        super(new InetSocketAddress(port));

        this.gameStartMain = gameStartMain;

        //actual values
        // this.scores = scores;
        // players = new HashMap<>();
        this.players = players;
        this.database = database;


        //testing values
        /*scores = new Scoring();
        players = new HashMap<>();

        scores.players.put(0, 10);
        players.put(0, new PlayerInfo("A", 1));

        scores.players.put(1, 1092);
        players.put(1, new PlayerInfo("B", 10));

        scores.players.put(2, 92);
        players.put(2, new PlayerInfo("C", 13));

        scores.players.put(15, 53);
        players.put(15, new PlayerInfo("D", 14));

        scores.players.put(16, 84);
        players.put(16, new PlayerInfo("E", 9));*/

        
        
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
    //  response; <status>
    //where status = waiting_for_start, in_play, or game_over
    public void getStatus(WebSocket socket, String[] message) {

        String responseMsg;
        switch (gameState) {
            case SETUP:
                responseMsg = "waiting_for_start";
                break;
            case RUNNING:
                responseMsg = "in_play";
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

    //get_scores; <request_id>
    //response; <request_id>; <timestamp>; GREEN; <name1>:<score1>:<captured1?>, ... <name_n>:<score_n>:<captured_n?>; RED; same...
    private void getScores(WebSocket socket, String[] message) {
        ArrayList<String> green = new ArrayList<>();
        ArrayList<String> red = new ArrayList<>();

        for (int i = 1; i < 31; i++) {
            if(players.getCodeName(i) != null) {
                String entry = players.getCodeName(i) + ":" + Integer.toString(players.getScore(i))
                    + ":" + (players.getBase(i) ? "true" : "false");
                //green
                if (i % 2 == 0) {
                    green.add(entry);
                } else {
                    red.add(entry);
                }
            }
        }

        String greenString = String.join(",", green);
        String redString = String.join(",", red);

        Date now = new Date();

        this.sendResponse(socket, message[1], now.getTime() + "; GREEN; " + greenString + "; RED; " + redString);
        //socket.send("response; " + message[1] + "; " + );
    }

    //add_player_id; <request_id>; <equipmentID>; <playerID>
    //<success/fail>; result<player_name, failure_message>
    private void addPlayerByID(WebSocket socket, String[] message) {
        int equipmentID = Integer.parseInt(message[2].trim());
        long playerID = Long.parseLong(message[3].trim());
        //do something

        String codeName = database.searchPlayer(playerID);


        //System.out.println("Found id: " + name);
        
        //this.sendResponse(socket, message[1], "fail; not setup yet");

        if (codeName == "NOT FOUND") {
            this.sendResponse(socket, message[1], "fail; missing_id");
        } else {
            // this.scores.players.put(equipmentID, 0);
            // this.players.put(equipmentID, new PlayerInfo(codeName, playerID));
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
        
        //System.out.println("added player: " + id);
        //this.sendResponse(socket, message[1], "fail; not setup yet");

        // this.scores.players.put(equipmentID, 0);
        // this.players.put(equipmentID, new PlayerInfo(playerName, playerID));
        this.players.setPlayer(playerID,equipmentID, codeName);

        UDPSend.send(Integer.toString(equipmentID));

        this.sendResponse(socket, message[1], "success");
    }


    //events:


    //start_game; <timestamp>
    public void startGame(long startTime) {
        this.gameState = GameState.RUNNING;
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
