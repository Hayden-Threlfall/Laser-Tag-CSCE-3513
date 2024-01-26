import java.net.DatagramPacket;
import java.net.DatagramSocket;

public class UDPServer {
    public static void main(String[] args) {
        // Specify the port number to listen on
        int port = 7501;

        try {
            // Create a DatagramSocket to listen for UDP packets on the specified port
            DatagramSocket socket = new DatagramSocket(port);

            System.out.println("UDP Server is listening on port " + port);

            while (true) {
                // Create a buffer to hold incoming data
                byte[] buffer = new byte[1024];

                // Create a DatagramPacket to receive the incoming UDP packet
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);

                // Receive the UDP packet
                socket.receive(packet);

                // Extract the data from the packet
                String receivedData = new String(packet.getData(), 0, packet.getLength());

                // Display the received data
                System.out.println("Received UDP packet from " + packet.getAddress() + ":" + packet.getPort());
                System.out.println("Data: " + receivedData);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
