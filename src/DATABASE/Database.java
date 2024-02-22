package DATABASE;

import java.sql.*;
import java.util.Map;
import java.util.Properties;

public class Database {
    private final String url = "jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:5432/postgres";
    private Properties props;
    private Connection conn;

    public Database() {
        Map<String, String> env = System.getenv();

        if (!env.containsKey("password")) {
            System.out.println("Password wasn't provided for database!");
            return;
        }

        props = new Properties();
        props.setProperty("user", "postgres.wiknbxsztzkskarzoxzz"); 
        props.setProperty("password", env.get("password"));
        
        //setup connection
        try {
            conn = DriverManager.getConnection(url, props);
            System.out.println("Database functioning!");
        } catch(SQLException e) {
            System.out.println("failed to open database!");
            System.out.println(e.getSQLState());
            System.out.println(e.getErrorCode());
            System.out.println(e);
        }
    }

    //search for player using ID and return name
    public String searchPlayer(int playerID) {
        //search for id, if not found then signal front end to ask for code name
        String name = null;
        try {
            String query = "select name from players where id = '" + playerID +"'";
            Statement st = conn.createStatement();
            ResultSet rs = st.executeQuery(query);

            //retrieve name of player at index
            while(rs.next()) {
                name = rs.getString("name");
            }
            
            //if player isn't in database
            if(name == null) {
                name = "NOT FOUND";
            }

        } catch(SQLException e) {
            System.out.println(e.getSQLState());
            System.out.println(e);
        }
        return name;
    }

    //add player and return ID to go to front end
    public void addPlayer(int playerID, String playerName) {
        //insert player into database, return their ID to the front end
        try {
            String sql = "insert into players values("+ playerID + ", '"+ playerName + "')";
            Statement statement = conn.createStatement();
            statement.executeUpdate(sql);
            System.out.println("Player added!");
            
        } catch(SQLException e) {
            System.out.println(e.getSQLState());
            System.out.println(e);
        }
    }

    public void close() {
        try {
            conn.close();
        }
        catch(SQLException e) {
            System.out.println(e.getSQLState());
            System.out.println(e);
        }
    }
}