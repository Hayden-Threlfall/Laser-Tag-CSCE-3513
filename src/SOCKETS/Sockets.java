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


public class Sockets extends WebSocketServer{
    private class PlayerInfo {
        public final String codeName;
        public final long playerID;
        public PlayerInfo(String codeName, long playerID) {
            this.codeName = codeName;
            this.playerID = playerID;
        }
    }

    private Scoring scores;
    private Database database;
    private HashMap<Integer, PlayerInfo> players;

    public Sockets(int port, Scoring scores, Database database) throws UnknownHostException {
        super(new InetSocketAddress(port));

        //actual values
        this.scores = scores;
        players = new HashMap<>();
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
        this.sendResponse(socket, message[1], "waiting_for_start");
        //socket.send("RESPONSE; " + message[1] + "; waiting_for_start");
    }

    //(recieve)
    //request_start; <request_id>
    //response; <request_id>; <sucess/fail>; optional<fail_message>
    private void requestStart(WebSocket socket, String[] message) {
        //this.broadcast("acknowledged");

        this.sendResponse(socket, message[1], "fail; not implemented");
    }

    //get_scores; <request_id>
    //response; <request_id>; <timestamp>; GREEN; <name1>:<score1>, ... <name_n>:<score_n>; RED; same...
    private void getScores(WebSocket socket, String[] message) {
        ArrayList<String> green = new ArrayList<>();
        ArrayList<String> red = new ArrayList<>();

        for (Entry<Integer, Integer> player : scores.players.entrySet()) {
            int key = player.getKey();
            int score = player.getValue();
            PlayerInfo playerInfo = players.get(key);

            String entry = playerInfo.codeName + ":" + score;
            //green
            if (key % 2 == 0) {
                green.add(entry);
            } else {
                red.add(entry);
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

        String name = database.searchPlayer(playerID);


        //System.out.println("Found id: " + name);
        
        //this.sendResponse(socket, message[1], "fail; not setup yet");

        if (name == "NOT FOUND") {
            this.sendResponse(socket, message[1], "fail; missing_id");
        } else {
            this.scores.players.put(equipmentID, 0);
            this.players.put(equipmentID, new PlayerInfo(name, playerID));

            UDPSend.send(Integer.toString(equipmentID));

            this.sendResponse(socket, message[1], "success; " + name);
        }
    }


    //add_player_id; <request_id>; <equipmentID>; <player_id>; <playerName>
    //<success/fail>; optional<failure_message>
    private void addPlayerByName(WebSocket socket, String[] message) {
        int equipmentID = Integer.parseInt(message[2].trim());
        long playerID = Long.parseLong(message[3].trim());
        String playerName = message[4].trim();
        //do something

        database.addPlayer(playerID, playerName);
        
        //System.out.println("added player: " + id);
        //this.sendResponse(socket, message[1], "fail; not setup yet");

        this.scores.players.put(equipmentID, 0);
        this.players.put(equipmentID, new PlayerInfo(playerName, playerID));

        UDPSend.send(Integer.toString(equipmentID));

        this.sendResponse(socket, message[1], "success");
    }


    //events:


    //start_game; <timestamp>
    public void startGame(long startTime) {
        this.broadcast("start_game; " + startTime);
    }
    
    //end_game; <timestamp>
    public void end() {
        Date now = new Date();
        this.broadcast("end_game; " + now.getTime());
    }

    //score_update; <timestamp>; <name>; <score>; <player_hit>
    //or base_capture; <timestamp>; <name>; <score>
    public void update(int equipmentID, int score, int hitID) {
        Date now = new Date();
        PlayerInfo playerInfo = players.get(equipmentID);

        //base capture
        if (hitID == -1) {
            this.broadcast("base_capture; " + now.getTime() + "; " + playerInfo.codeName + "; " + score);
        } else {
            PlayerInfo hitInfo = players.get(hitID);
            this.broadcast("score_update; " + now.getTime() + "; " + playerInfo.codeName + "; " + score + "; " + hitInfo.codeName);
        }   
    }


}
