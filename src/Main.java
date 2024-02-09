import UDP.UDPReceive;
import UDP.UDPSend;
import UDP.Scoring;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.UnknownHostException;
import java.io.IOException;

import DATABASE.Test;
import SOCKETS.Sockets;
//import HTTP.HTTPServer;

public class Main {
    public static void main(String[] args) throws UnknownHostException,IOException{
        Scoring Scores = new Scoring();
        UDPReceive UDPServer = new UDPReceive(Scores);
        
        UDPServer.start();
        
        Test.database();

        Sockets socketServer = new Sockets(8001);

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
        // Insert UDP Start Method //
        long startTime = System.currentTimeMillis();
        long endTime = startTime + 36000;

        while(startTime <= endTime || input != "f5") {
            System.out.print("Enter a valid hit UDP message ect: `ID:ID`, `ID:Base_Code`, `ID` (`f5` to quit early)");
            input  = reader.readLine();
            Scores.update(input);
            // Insert Print the hashmap from scores //
        }
        input = "";

        // Insert UDP End Method //

        while(input != "f5") {
            System.out.print("Type `f5` to reset");
            input  = reader.readLine();
        }

        // Insert Reset Method //
    }
}
