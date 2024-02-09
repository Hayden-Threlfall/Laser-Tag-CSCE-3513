import UDP.UDPReceive;
import UDP.UDPSend;
import UDP.Scoring;

import java.net.UnknownHostException;

import DATABASE.Test;
import SOCKETS.Sockets;
//import HTTP.HTTPServer;

public class Main {
    public static void main(String[] args) throws UnknownHostException {
        Scoring Scores = new Scoring();
        UDPReceive UDPServer = new UDPReceive(Scores);
        
        UDPServer.start();
        
        Test.database();

        Sockets socketServer = new Sockets(8001);

        
        // for( int i = 0; i < 5; i++){
        //     try {
        //         Thread.sleep(1000);
        //     } catch (Exception e){
        //         System.out.print(e);
        //     }
        //     UDPSend.send("TEST");
        // }
        
        // while (true) {}
    }
}
