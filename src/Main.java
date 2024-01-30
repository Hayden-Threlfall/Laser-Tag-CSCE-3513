import UDP.UDPReceive;
import UDP.UDPSend;
//import HTTP.HTTPServer;

public class Main {
    public static void main(String[] args) {
        UDPReceive UDPServer = new UDPReceive();
        //UDPSend Message = new UDPSend();
        
        UDPServer.start();
            for( int i = 0; i < 15; i++){
            try {
                Thread.sleep(1000);
            } catch (Exception e){
                System.out.print(e);
            }
            UDPSend.send("TEST");
        }
    }
}
