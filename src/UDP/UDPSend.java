package UDP;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

public class UDPSend {
    private final static String ADDRESS = "127.0.0.1";
    private final static int PORT = 7500;

    public static void send(String message) {
        System.out.println("Sending message: " + message);
        try {
            //Declare Adress to send
            InetAddress address = InetAddress.getByName(ADDRESS);

            // Create a DatagramSocket to send UDP packets on the specified port
            DatagramSocket socket = new DatagramSocket(PORT);

            //Turning string into byte code for packet
            byte[] buffer = message.getBytes();

            //Truning bytes into packet
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
            packet.setAddress(address);
            packet.setPort(PORT);

            //Sending message
            socket.send(packet);

            socket.close();

            System.out.println("Message sent");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
