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
        System.out.println("hello there");
        scores = Scores;

        players = new HashMap<>();
        System.out.println("hi?");
        
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
        System.out.println("request: " + messageParts[0]);
        switch (messageParts[0].toLowerCase()) {
            case "get_scores":
                this.getScores(socket, messageParts);
                break;
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

    //score_reset; <timestamp>; GREEN; <name1>:<score1>, ... <name_n>:<score_n>; RED; same...
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

        socket.send("score_reset; " + now.getTime() + "; GREEN; " + greenString + "; RED; " + redString);
        
    }
}
