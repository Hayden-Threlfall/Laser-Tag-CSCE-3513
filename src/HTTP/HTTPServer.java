package HTTP;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Scanner;

public class HTTPServer {

    private static String WEB_DIR = "web";
    public static void main(String[] args) throws IOException {
        int serverPort = 8000;
        HttpServer server = HttpServer.create(new InetSocketAddress(serverPort), 0);
        server.createContext("/api", new MyHandler());
        server.setExecutor(null); // creates a default executor
        server.start();
        System.out.println("Server started on port " + serverPort);

        File[] files = (new File(WEB_DIR)).listFiles();
        Queue<File> fileQueue = new LinkedList<>(Arrays.asList(files));
        
        while (!fileQueue.isEmpty()) {
            File file = fileQueue.remove();
            if (file.isDirectory()) {
                for (File sub_file : file.listFiles()) {
                    fileQueue.add(sub_file);
                }
            } else {
                String path = file.getPath().substring(WEB_DIR.length());
                StaticFile handler = new StaticFile(file);
                server.createContext(path, handler);

                System.out.println("Name: " + file.getName());
                if (file.getName().equals("index.html")) {
                    String rootPath = path.substring(0, path.length() - "index.html".length());
                    System.out.println("root path: " + rootPath);
                    server.createContext(rootPath, handler);
                }
            }
        }
    }

    

    static class StaticFile implements HttpHandler {
        private static final Map<String, String> TYPES = new HashMap<String, String>() {{
            put("html", "text/html");
            put("htm", "text/html");
            put("css", "text/css");
            put("js", "text/javascript");
            put("ico", "image/vnd.microsoft.icon");
        }}; 
        private final String data;
        private final String type;

        private final boolean failed;

        StaticFile(File file) {   
            String[] split = file.getName().split("\\.");
            String type = split[split.length-1];

            if (!TYPES.containsKey(type)) {
                System.out.println("Unknown file type! " + type);
                this.type = "text/plain";
            } else {
                this.type = TYPES.get(type);
            }

            String data = "";
            boolean failed = false;
            try {
                Scanner fileReader = new Scanner(file);
                while (fileReader.hasNextLine()) {
                    data += fileReader.nextLine() + "\n";
                }
                fileReader.close();
            } catch (FileNotFoundException e) {
                System.out.println("Failed to find file in HTTPServer!");
                e.printStackTrace();

                failed = true;
            }
            this.data = data;
            this.failed = failed;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (this.failed) {
                exchange.sendResponseHeaders(404, -1);
            } else if ("GET".equals(exchange.getRequestMethod())) {

                // Send a JSON response
                exchange.getResponseHeaders().set("Content-Type", this.type);
                exchange.sendResponseHeaders(200, this.data.length());
                OutputStream os = exchange.getResponseBody();
                os.write(this.data.getBytes());
                os.close();
            } else {
                // Method not allowed
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
