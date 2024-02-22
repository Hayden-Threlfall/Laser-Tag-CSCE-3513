package SOCKETS;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map.Entry;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import UDP.Scoring;


public class Sockets extends WebSocketServer{
    private class PlayerInfo {
        public final String codeName;
        public final int playerID;
        public PlayerInfo(String codeName, int playerID) {
            this.codeName = codeName;
            this.playerID = playerID;
        }
    }

    private Scoring scores;
    private HashMap<Integer, PlayerInfo> players;

    public Sockets(int port, Scoring Scores) throws UnknownHostException {
        super(new InetSocketAddress(port));

        //actual values
        scores = Scores;
        players = new HashMap<>();

        //testing values
        scores = new Scoring();
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
        players.put(16, new PlayerInfo("E", 9));

        
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
            case "get_scores":
                this.getScores(socket, messageParts);
                break;
            case "get_status":
                this.getStatus(socket, messageParts);
                break;
            case "add_player_id":
                this.addPlayeByID(socket, messageParts);
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

    //message format
    //<command>; <timestamp>; ...

    //responses:

    //get_status;
    //returns:
    //  response; <status>
    //where status = waiting_for_start, in_play, or game_over
    public void getStatus(WebSocket socket, String[] message) {
        this.sendResponse(socket, message[1], "waiting_for_start");
        //socket.send("RESPONSE; " + message[1] + "; waiting_for_start");
    }

    //events:

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

    //start_game; <timestamp>
    public void startGame(long startTime) {
        this.broadcast("start_game; " + startTime);
    }

    //(recieve)
    //request_start
    public void requestStart(WebSocket socket) {
        this.broadcast("acknowledged");
    }
    
    //end_game; <timestamp>
    public void end() {
        Date now = new Date();
        this.broadcast("end_game; " + now.getTime());
    }

    private void sendResponse(WebSocket socket, String id, String message) {
        socket.send("response; " + id + "; " + message);
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
            if (key < 15) {
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
    //<success/fail>; optional<failure_message>
    private void addPlayeByID(WebSocket socket, String[] message) {
        int equipmentID = Integer.parseInt(message[2].trim());
        int playerID = Integer.parseInt(message[3].trim());
        //do something

        this.sendResponse(socket, message[1], "fail; not setup yet");
    }


    //add_player_id; <request_id>; <equipmentID>; <playerName>
    //<success/fail>; result<player_id, failure_message>
    private void addPlayerByName(WebSocket socket, String[] message) {
        int equipmentID = Integer.parseInt(message[2].trim());
        String playerName = message[3].trim();
        //do something

        this.sendResponse(socket, message[1], "fail; not setup yet");
    }
}
