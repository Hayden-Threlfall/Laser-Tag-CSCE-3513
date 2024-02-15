import UDP.UDPReceive;
import UDP.UDPSend;
import UDP.Scoring;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.UnknownHostException;
import java.io.IOException;

import DATABASE.Database;
import SOCKETS.Sockets;
//import HTTP.HTTPServer;

public class Main extends Thread{
    public static void main(String[] args) throws UnknownHostException,IOException{
        Scoring Scores = new Scoring();
        UDPReceive UDPServer = new UDPReceive(Scores);
        Database database = new Database();
        
        UDPServer.start();

        Sockets socketServer = new Sockets(8001, Scores);
        socketServer.start();

        Scores.Sockets(socketServer);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try {
                socketServer.stop();
            } catch (Exception e) {
                //throw new Exception(e);
                System.out.println("Failed to stop server!");
            }
        }));
        // while(true){
        //     test(Scores);
        // }
    }

    public static void test(Scoring Scores) throws IOException {
        String input = "";
        String username;
        int id;
        String team;
        BufferedReader reader = new BufferedReader(
            new InputStreamReader(System.in));
        System.out.println("Welcome to laser tag test suite to go to the game start stage please type in `f5`");
        while(input != "f5") {
            System.out.print("Enter a Player `Username:Gear ID:Team color(green or red)` No more than 15 per team");
            input  = reader.readLine();
            username = input.split(":")[0];
            id = Integer.valueOf(input.split(":")[1]);
            team = input.split(":")[2];
            //Insert Send Data to Communication Layer, should post to postgress and save data to serve //
        }
        input = "";
        UDPSend.startGame();
        long endTime = System.currentTimeMillis() + 36000; 

        while(System.currentTimeMillis() <= endTime || input != "f5") {
            System.out.print("Enter a valid hit UDP message ect: `ID:ID`, `ID:Base_Code`, `ID` (`f5` to quit early)");
            input  = reader.readLine();
            Scores.update(input);
            // Insert Print the hashmap from scores //
        }
        input = "";

        UDPSend.endGame();

        while(input != "f5") {
            System.out.print("Type `f5` to reset");
            input  = reader.readLine();
        }

        // Insert Reset Method //
    }

    public static void run(Scoring Scores){
        // while(!false) { // Replace false with some sort of bool for starting
        //     // Backend does nothing here this could be some sort of callback
        // }
        try {
            Thread.sleep(30000);
        } catch (Exception e) {
            e.printStackTrace();
        }
        

        UDPSend.startGame();

        long endTime = System.currentTimeMillis() + 36000; 

        while(System.currentTimeMillis() <= endTime) {
            
        }

        UDPSend.endGame();

        while(!false) { // Replace false with some sort of bool for resting
            System.out.print("Reseting tables");
            // Scores.resetTable() // cleares table should be all this does
            // Send the scoes to communication then sent to the front end
        }
    }
}
