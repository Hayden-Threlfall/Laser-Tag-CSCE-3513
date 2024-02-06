import UDP.UDPReceive;
import UDP.UDPSend;
import DATABASE.Test;
//import HTTP.HTTPServer;

public class Main {
    public static void main(String[] args) {
        UDPReceive UDPServer = new UDPReceive();
        
        UDPServer.start();
        
        Test.database();

        
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
