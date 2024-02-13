package DATABASE;

import java.sql.*;
import java.util.Map;
import java.util.Properties;

public class Test {
    public static void database() {
        Map<String, String> env = System.getenv();

        if (!env.containsKey("password")) {
            System.out.println("Password wasn't provided for database!");
            return;
        }

        
        String url = "jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:5432/postgres";
        //String url = "jdbc:postgresql://localhost:5432/test";

        Properties props = new Properties();

        props.setProperty("user", "postgres.wiknbxsztzkskarzoxzz");
        props.setProperty("password", env.get("password"));
        //props.setProperty("ssl", "true");

        try {
            Connection conn = DriverManager.getConnection(url, props);

            System.out.println("connected?");
        } catch(SQLException e) {
            System.out.println("failed to open database!");
            System.out.println(e.getSQLState());
            System.out.println(e.getErrorCode());
            System.out.println(e);
        }

    }
}
