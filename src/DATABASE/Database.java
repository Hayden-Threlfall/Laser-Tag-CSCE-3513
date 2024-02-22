package DATABASE;

import java.sql.*;
import java.util.Map;
import java.util.Properties;

public class Database {
    private final String url = "jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:5432/postgres";
    private Properties props;
    private int currID;

    public Database() {
        Map<String, String> env = System.getenv();

        if (!env.containsKey("password")) {
            System.out.println("Password wasn't provided for database!");
            return;
        }

        props = new Properties();
        props.setProperty("user", "postgres.wiknbxsztzkskarzoxzz"); 
        props.setProperty("password", env.get("password"));
        test();
    }

    private void errorBlock(SQLException e) {
        System.out.println("failed to open database!");
        System.out.println(e.getSQLState());
        System.out.println(e.getErrorCode());
        System.out.println(e);
    }

    //in test query for current highest player id and save the value
    private void test() {
        try {
            Connection conn = DriverManager.getConnection(url, props);
            System.out.println("Database functioning!");

            //retrieve the highest current id from the server
            String query = "select id from players";
            Statement st = conn.createStatement();
            ResultSet rs = st.executeQuery(query);
            conn.close();

            //retrieve highest id and get next
            int id = 0;
            while (rs.next()) {
                System.out.println("loop id: " + id);
                id = rs.getInt("id");
            }
            System.out.println("id: " + id);
            id++;
            currID = id;
            
        } catch(SQLException e) {
            errorBlock(e);
        }
    }

    //search for player using ID and return name
    public String searchPlayer(int playerID) {
        //search for id, if not found then signal front end to ask for code name
        String name = null;
        try {
            Connection conn = DriverManager.getConnection(url, props);
            String query = "select name from players where id = '" + playerID +"'";
            Statement st = conn.createStatement();
            ResultSet rs = st.executeQuery(query);
            conn.close();

            //retrieve name of player at index
            while(rs.next()) {
                name = rs.getString("name");
            }
            
            //if player isn't in database
            if(name == null) {
                name = "NOT FOUND";
            }

        } catch(SQLException e) {
            errorBlock(e);
        }
        return name;
    }

    //add player and return ID to go to front end
    public int addPlayer(String playerName) {
        //insert player into database, return their ID to the front end
        try {
            Connection conn = DriverManager.getConnection(url, props);

            String sql = "insert into players values("+ currID + ", '"+ playerName + "')";
            Statement statement = conn.createStatement();
            statement.executeUpdate(sql);
            conn.close();
            //increment greatest ID
            currID++;

            System.out.println("Player added!");
            return currID-1;
            
        } catch(SQLException e) {
            errorBlock(e);
        }
        return currID;
    }
}