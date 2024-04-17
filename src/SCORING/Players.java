package SCORING;
import java.util.HashMap;

public class Players{

    private class Player {
        public long playerID;
        public String codeName;
        public int score;
        public boolean base;

        public Player(long playerID, String codeName) {
            this.playerID = playerID;
            this.codeName = codeName;
            this.score = 0;
            this.base = false;
        }

        public void clear() {
            this.playerID = 0;
            this.codeName = null;
            this.score = 0;
            this.base = false;
        }
    }

    private final HashMap<Integer, Player> players;

    public Players() {
        players = new HashMap<Integer, Player>();
    }

    public void setPlayer(long playerID, int equipmentID, String codeName) {
        // players[equipmentID] = new Player(playerID, codeName);
        players.put(equipmentID, new Player(playerID, codeName));
    }

    public void addScore(int equipmentID, int scoreToAdd) {
        players.get(equipmentID).score += scoreToAdd;
        // players[equipmentID].score += scoreToAdd;
    }

    public void setBase(int equipmentID){
        players.get(equipmentID).base = true;
        // players[equipmentID].base = true;
    }


    //getters for sockets
    public int getScore(int equipmentID) {
        if (players.get(equipmentID) == null) {
            return -1;
        }
        return players.get(equipmentID).score;
    }

    public String getCodeName(int equipmentID) {
        if (players.get(equipmentID) == null) {
            return null;
        }
        return players.get(equipmentID).codeName;
    }

    public boolean getBase(int equipmentID) {
        return players.get(equipmentID).base;
    }

    public void clear() {
        players.clear();
    }

}
