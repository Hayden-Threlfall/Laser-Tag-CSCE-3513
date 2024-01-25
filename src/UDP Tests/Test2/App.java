import java.io.*;
import java.net.*;

public class App {
 
    // Main driver method
    public static void main(String[] args)
    {
 
        // Try block to check for exceptions
        try {
 
            // Creating an object of ServerSocket class
            // in the main() method  for socket connection
            ServerSocket ss = new ServerSocket(8000);

            Socket soc = ss.accept();
            
            DataInputStream dis
                = new DataInputStream(soc.getInputStream());
 
            String str = (String)dis.readUTF();
 
            // Display the string on the console
            System.out.println("message= " + str);
 
            // Lastly close the socket using standard close
            // method to release memory resources
            ss.close();
        }
 
        // Catch block to handle the exceptions
        catch (Exception e) {
 
            // Display the exception on the console
            System.out.println(e);
        }
    }
}