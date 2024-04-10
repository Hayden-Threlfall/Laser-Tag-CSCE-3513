package UDP;

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

    private final  Player[] players;

    public Players() {
        players = new Player[31]; //indexed to be 1 to 30
    }

    public void setPlayer(long playerID, int equipmentID, String codeName) {
        players[equipmentID] = new Player(playerID, codeName);
    }

    public void addScore(int equipmentID, int scoreToAdd) {
        players[equipmentID].score += scoreToAdd;
    }

    public void setBase(int equipmentID){
        players[equipmentID].base = true;
    }


    //getters for sockets
    public int getScore(int equipmentID) {
        if (players[equipmentID] == null) {
            return -1;
        }
        return players[equipmentID].score;
    }

    public String getCodeName(int equipmentID) {
        if (players[equipmentID] == null) {
            return null;
        }
        return players[equipmentID].codeName;
    }

    public boolean getBase(int equipmentID) {
        return players[equipmentID].base;
    }

    public void clear() {
        for(int i = 0; i < 31; i++)
            if (players[i] != null)
                players[i].clear();
    }

}
