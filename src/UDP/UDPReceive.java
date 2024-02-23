package UDP;

import UDP.Scoring;
import java.net.DatagramPacket;
import java.net.DatagramSocket;

public class UDPReceive extends Thread{
    private final static int PORT = 7501;
    private Scoring Scores;

    private boolean running = false;

    public UDPReceive(Scoring s) {
        Scores = s;
    }

    public void run() {
        try {
            // Create a DatagramSocket to listen for UDP packets on the specified port
            DatagramSocket socket = new DatagramSocket(PORT);

            System.out.println("UDP Server is listening on port " + PORT);

            running = true;
            while (running) {
                // Sleeps thread until allowed
                sleep();

                if (!running) {
                    break;
                }
                // Create a buffer to hold incoming data
                byte[] buffer = new byte[1024];

                // Create a DatagramPacket to receive the incoming UDP packet
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);

                // Receive the UDP packet
                socket.receive(packet);
                
                socket.close();


                // Extract the data from the packet
                String receivedData = new String(packet.getData(), 0, packet.getLength());

                // Display the received data
                //System.out.println("Received UDP packet from " + packet.getAddress() + ":" + packet.getPort());
                System.out.println("Data: " + receivedData);
                Scores.update(receivedData);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void stop_processing() {
        running = false;
        this.interrupt();
    }
    private static boolean receive = false;

    public synchronized static void allowRecieve() {
        receive = true;
    }

    public synchronized static void blockRecieve() {
        receive = false;
    }

    private synchronized void sleep() {

        while (!receive) {

            try {
                this.wait();

            } catch (InterruptedException ignore) {
                // log.debug("interrupted: " + ignore.getMessage());
                if (!running) {
                    break;
                }
            }
        }
    }
}
