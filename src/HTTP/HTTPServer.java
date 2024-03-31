package HTTP;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;
import java.util.Scanner;


public class HTTPServer {

    //private static String WEB_DIR = ;
    public static void main(String[] args) throws IOException {
        HTTPServer server = new HTTPServer();

        server.start("web");
    }

    private HttpServer server;
    public void start(String web_dir) throws IOException {
        int serverPort = 8000;
        server = HttpServer.create(new InetSocketAddress(serverPort), 0);

        

        server.createContext("/api", new MyHandler());
        
         
        //get all files within the web directory
        File[] files = (new File(web_dir)).listFiles();
        //convert the array of files into a queue
        Queue<File> fileQueue = new LinkedList<>(Arrays.asList(files));
        
        //every iteration, take the next file out of the queue
        //continue until queue is empty
        while (!fileQueue.isEmpty()) {
            //get next file
            File file = fileQueue.remove();
            //if it's a directory, add all of it's sub files/directories
            //  into the queue to be processed
            if (file.isDirectory()) {
                for (File sub_file : file.listFiles()) {
                    fileQueue.add(sub_file);
                }
            } else {
                //cut of the WEB_DIR/... part of the file path
                String path = file.getPath().substring(web_dir.length()).replace("\\","/");
                //create new handler for the request
                StaticFile handler = new StaticFile(file);
                //create the context at the path
                server.createContext(path, handler);
            }
        }

        //server.createContext("/index.html");
        server.setExecutor(null); // creates a default executor
        server.start();

        //open website on default browser
        System.out.println("HTTP Server start! http://localhost:" + serverPort + "/index.html");
        String os = System.getProperty("os.name").toLowerCase();

        //open on linux
        if(os.indexOf("nix") >=0 || os.indexOf("nux") >=0) {
            Runtime rt = Runtime.getRuntime();
            String url = "http://localhost:" + serverPort + "/index.html";
            String[] browsers = { "google-chrome", "firefox", "mozilla", "epiphany", "konqueror",
                                    "netscape", "opera", "links", "lynx" };

            StringBuffer cmd = new StringBuffer();
            for (int i = 0; i < browsers.length; i++)
                if(i == 0)
                    cmd.append(String.format(    "%s \"%s\"", browsers[i], url));
                else
                    cmd.append(String.format(" || %s \"%s\"", browsers[i], url)); 
                // If the first didn't work, try the next browser and so on

            rt.exec(new String[] { "sh", "-c", cmd.toString() });
        }
        //open on windows
        else {
            Runtime rt = Runtime.getRuntime();
            String url = "http://localhost:" + serverPort + "/index.html";
            rt.exec(new String[] {"rundll32", "url.dll", "FileProtocolHandler", url});
        }
    }

    public void stop(int timeout) {
        server.stop(timeout);
    }

    

    static class StaticFile implements HttpHandler {
        //mapping .<type> to the Content-Type
        private static final Map<String, String> TYPES = new HashMap<String, String>() {{
            put("html", "text/html");
            put("htm", "text/html");
            put("css", "text/css");
            put("js", "text/javascript");
            put("ico", "image/vnd.microsoft.icon");
            put("jpg", "image/jpeg");
            put("mp3", "audio/mpeg");
        }};
        //string of file data
        private final byte[] data;
        //the content-type
        private final String type;

        //whether it failed to load the file
        private final boolean failed;

        StaticFile(File file) {   
            //get the file type
            String[] split = file.getName().split("\\.");
            String type = split[split.length-1];

            //map it to the content-type
            if (!TYPES.containsKey(type)) {
                System.out.println("Unknown file type! " + type);
                this.type = "text/plain";
            } else {
                this.type = TYPES.get(type);
            }

            byte[] data = new byte[0];
            boolean failed = false;
            try {
                //read in all of the file data

                InputStream fileInput = new FileInputStream(file);
                data = fileInput.readAllBytes();
                fileInput.close();
            } catch (FileNotFoundException e) {
                System.out.println("Failed to find file (" + file.getName() + ") in HTTPServer!");
                e.printStackTrace();

                failed = true;
            } catch (IOException e) {
                System.out.println("Failed to read file (" + file.getName() + ") in HTTPServer!");
                e.printStackTrace();
                failed = true;
            }
            this.data = data;
            //.toPrimitive((Byte[])data.toArray());
            this.failed = failed;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            
            //if it failed, just return 404 (should probably return better error message)
            if (this.failed) {
                exchange.sendResponseHeaders(404, -1);
            
            //for get requests, simply return the file data
            } else if ("GET".equals(exchange.getRequestMethod())) {

                // Send a JSON response
                exchange.getResponseHeaders().set("Content-Type", this.type);
                exchange.sendResponseHeaders(200, this.data.length);
                OutputStream os = exchange.getResponseBody();
                os.write(this.data);
                os.close();
            } else {
                // for other types, send invalid method
                exchange.sendResponseHeaders(405, -1);
            }
        }

    }
    static class MyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Handle incoming requests
            if ("POST".equals(exchange.getRequestMethod())) {
                // Read the JSON data from the request
                InputStreamReader isr = new InputStreamReader(exchange.getRequestBody(), "utf-8");
                BufferedReader br = new BufferedReader(isr);
                StringBuilder payload = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) {
                    payload.append(line);
                }
                br.close();

                // Process the received JSON data
                String responseData = processJson(payload.toString());

                // Send a JSON response
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, responseData.length());
                OutputStream os = exchange.getResponseBody();
                os.write(responseData.getBytes());
                os.close();
            } else {
                // Method not allowed
                exchange.sendResponseHeaders(405, -1);
            }
        }

        private String processJson(String jsonInput) {
            // You can implement your logic to process the incoming JSON here
            // For simplicity, let's just return the same JSON data as the response
            System.out.print(jsonInput);
            return jsonInput;
        }
    }
}
