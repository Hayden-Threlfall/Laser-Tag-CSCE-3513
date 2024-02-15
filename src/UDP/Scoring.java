package UDP;
//For the Hashtable
import SOCKETS.Sockets;
import java.util.Hashtable;
import java.net.Socket;
import java.util.Arrays;

public class Scoring {
    //Hashtable with player ids (which are actually equipment ids) as keys and point values as values
    public Hashtable<Integer, Integer> players = new Hashtable<>();
    private Sockets Socket = null;

    //grabs the ids from the UDP message
    public int[] parseInts(String message){
        int player1 = -1;
        int player2 = -1;
        int[] playerIDs;

        //if only one id is sent, send back a UDPSend with their id to indicate friendly fire
        if(!message.contains(":")){
            UDPSend.send(message);
        } else {
        //if more than one id is sent, split up the message and pull the ids
            String[] players = message.split(":");
            player1 = Integer.parseInt(players[0]);
            player2 = Integer.parseInt(players[1]);
        }

        //create playerIDs with the new keyword so playerIDs can be resolved to a variable 
        playerIDs = new int[]{player1, player2};
        //check if you actually pulled the strings
        System.out.println(Arrays.toString(playerIDs));
        return playerIDs;
    }
    //Intilizes Socket after initilization in Main
    public void Sockets(Sockets sockets) {
        Socket = sockets;
    }

    //this is the method that should 
    public void update(String message) {
        int player1 = -1;
        int player2 = -1;

        //pulling the ints from the message
        try{
            int[] playerIDs = this.parseInts(message);
            try{
                player1 = playerIDs[0];
                player2 = playerIDs[1];
            } catch (Exception e){
                System.out.println("playerIDs array could not be converted to ints");
            }
        } catch (Exception e) {
            System.out.println("parseInts failed");
        }

        if(!(player1 == -1 && player2 == -1)){
            //check if players are in hashtable and add them if not
            if(!(players.containsKey(player1) && players.containsKey(player2))) {
                players.put(player1, 0);
                players.put(player2, 0);   
            }

            switch(player2){
                //add base capture badge notification
                case 43: //green base captured
                    System.out.println(players.get(player1)); //test code
                    players.put(player1, players.get(player1) + 100);
                    Socket.update(player1, players.get(player1), -1);
                    System.out.println(players.get(player1)); //test code
                break;

                case 53: //red base captured
                    System.out.println(players.get(player1)); //test code
                    players.put(player1, players.get(player1) + 100);
                    Socket.update(player1, players.get(player1), -1);
                    System.out.println(players.get(player1)); //test code
                break;

                default: //one player has hit another
                    System.out.println(players.get(player1)); //test code
                    players.put(player1, players.get(player1) + 10);
                    Socket.update(player1, players.get(player1), player2);
                    UDPSend.send(String.valueOf(player2));
                    System.out.println(players.get(player1)); //test code
                break;
            }

        } else {
            System.out.println("Invalid Player codes");
        }
    }


    public static void main(String[] args) {
        Scoring events = new Scoring();

        // Test 1: Call pullInts with a sample string
        String sampleString = "12:53";

        // Test 2: Call update with the result from pullInts
        for(int i = 0; i < 10; i++){
            events.update(sampleString);
        }
    }

}