import UDP.UDPReceive;
import UDP.UDPSend;
import UDP.Scoring;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.UnknownHostException;
import java.util.Scanner;
import java.util.function.Consumer;
import java.io.IOException;

import DATABASE.Database;
import HTTP.HTTPServer;
import SOCKETS.Sockets;
import UDP.Players;
//import HTTP.HTTPServer;

public class Main extends Thread{
    static Scoring Scores = new Scoring();
    static long endTime = 0;
    static Players playerInfo;
    static Database database; 
    static UDPReceive UDPServer;
    static Sockets socketServer;
    static HTTPServer httpServer;

    public static boolean running = true;
    public static void main(String[] args) throws UnknownHostException,IOException, InterruptedException{    
        playerInfo = new Players();    
        database = new Database();
        UDPServer = new UDPReceive(Scores);
        UDPServer.start();

        Runnable gameStartFunc = () -> {
            gameStart();
        };
        socketServer = new Sockets(8001, Scores, database, playerInfo, gameStartFunc);
        socketServer.start();

        httpServer = new HTTPServer();
        httpServer.start("HTTP/web");

        Scores.Sockets(socketServer);
        Scores.Players(playerInfo);


        
        Thread hook = new Thread(() -> {
            try {
                socketServer.stop(1);
                httpServer.stop(1);
                UDPServer.stop_processing();
                running = false;
                //System.exit(0);
            } catch (Exception e) {
                //throw new Exception(e);
                System.out.println("Failed to stop server!");
            }
        });
        
        Runtime.getRuntime().addShutdownHook(hook);        

        while (running) {
            try {
                Thread.sleep(1000);
            } catch (Exception e){
                e.printStackTrace();
            }
            if (startGame) {
                // 30 second setup timer1
                startGame = false;
                startTime();
                gameStartHelper();
            }
        }
        

    }

    public static void startTime() {
        endTime = System.currentTimeMillis() + 36000 + 3000;
        socketServer.startGame(System.currentTimeMillis());
    }

    public static void begin() {
        UDPSend.startGame();
    }

    public static void end() {
        UDPSend.endGame();
        socketServer.end();
    }

    public static void reset() {
        
        Scores.resetTable();
    }

    private static boolean startGame = false;
    public static void gameStart(){
        startGame = true;
    }

    private static void gameStartHelper() { 
        try {
            Thread.sleep(30000);
        } catch (Exception e) {
            e.printStackTrace();
        }

        begin();
        while(System.currentTimeMillis() <= endTime) {
            if (endTime - System.currentTimeMillis() > 1000) {
                try {
                    Thread.sleep(1000);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        end();
    }


    
}
