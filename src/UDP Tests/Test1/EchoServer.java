import java.net.*;

public class EchoServer extends Thread {

    private DatagramSocket socket;
    private boolean running;
    private byte[] buf = new byte[256];

    public EchoServer() {
        try {
            socket = new DatagramSocket(7501);
        }
        catch(Exception e) {
            System.out.print(e);
        }
        
    }

    public void run() {
        running = true;

        while (running) {
            DatagramPacket packet 
              = new DatagramPacket(buf, buf.length);
            
            try {
                socket.receive(packet);
            }
            catch(Exception e) {
                System.out.print(e);
            }
            
            InetAddress address = packet.getAddress();
            int port = packet.getPort();
            packet = new DatagramPacket(buf, buf.length, address, port);
            String received 
              = new String(packet.getData(), 0, packet.getLength());
            System.out.printf("%s", received.replaceAll("null", ""));
            //System.out.println(packet.getOffset());

            if (received.equals("end")) {
                running = false;
                continue;
            }
            
            try {
                socket.send(packet);
            }
            catch(Exception e) {
                System.out.print(e);
                System.out.print("Messed Up");
            }
        }
        socket.close();
    }
    public static void main(String[] args) {
        EchoServer server=new EchoServer();
        server.start();
    }
}