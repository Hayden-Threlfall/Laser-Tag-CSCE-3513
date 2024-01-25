import java.net.DatagramSocket;
import java.net.DatagramPacket;
import java.net.InetAddress;

public class EchoClient {

    private DatagramSocket socket;
    private InetAddress address;

    private byte[] buf;

    public EchoClient() {
      try {
          socket = new DatagramSocket();
          address = InetAddress.getByName("localhost");  
      }
      catch(Exception e) {
          System.out.print(e);
      }
        
    }

    public String sendEcho(String msg) {
        buf = msg.getBytes();
        DatagramPacket packet 
          = new DatagramPacket(buf, buf.length, address, 4445);

        
        try {
            socket.send(packet);
        }
        catch(Exception e) {
            System.out.print(e);
        }

        packet = new DatagramPacket(buf, buf.length);

        
        try {
          socket.receive(packet);
        }
        catch(Exception e) {
            System.out.print(e);
        }

        String received = new String(
          packet.getData(), 0, packet.getLength());
        return received;
    }

    public void close() {
        socket.close();
        
    }
}