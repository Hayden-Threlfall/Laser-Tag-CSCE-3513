package UDP;

import SOCKETS.Sockets;

import java.util.Arrays;

public class Scoring {
    // public Hashtable<Integer, Integer> players = new Hashtable<>();
    private Sockets Socket = null;
    //players will need to be initialized
    private Players Players;
    //grabs the ids from the UDP message
    public int[] parseInts(String message){
        int player1 = -1;
        int player2 = -1;
        int[] playerIDs;

        //parse the integers from the message
        String[] players = message.split(":");
        player1 = Integer.parseInt(players[0]);
        player2 = Integer.parseInt(players[1]);

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

    public void Players(Players players) {
        Players = players;
    }
 
    public void update(String message) {
        int player1 = -1;
        int player2 = -1;

        //pulling the ints from the message
        try{
            int[] playerIDs = this.parseInts(message);
            player1 = playerIDs[0];
            player2 = playerIDs[1];
        } catch (Exception e) {
            System.out.println("parseInts failed");
        }

        if(!(player1 == -1 && player2 == -1)){

            //check if players on same team even/odd
            if(player1%2 == player2%2 && player2 != 53) {
                UDPSend.send(Integer.toString(player1));
                Players.addScore(player1, -10);
                return;
            }

            switch(player2){
                //add base capture badge notification
                case 43: //green base captured
                    Players.addScore(player1, 100);
                    Players.setBase(player1);
                    Socket.update(player1, Players.getScore(player1), -1);
                break;

                case 53: //red base captured
                    Players.addScore(player1, 100);
                    Socket.update(player1, Players.getScore(player1), -1);
                    Players.setBase(player1);
                    //System.out.println(players.get(player1)); //test code
                break;

                default: //one player has hit another
                    Players.addScore(player1, 10);
                    Socket.update(player1, Players.getScore(player1), player2);
                    UDPSend.send(String.valueOf(player2));
                break;
            }

        } else {
            System.out.println("Invalid Player codes");
        }
    }

    public void resetTable() {
        Players.clear();
    }

}