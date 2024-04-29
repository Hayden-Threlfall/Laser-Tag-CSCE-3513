#include <WiFi.h>
#include <WiFiUdp.h>

const int isRedTeam = 0;

const char* redTeamBase = "53";
const char* greenTeamBase = "43";
const char* redEID = "1";
const char* greenEID = "2";

const int ENEMY_PIN = 21;
const int SELF_PIN = 22;
const int BASE_PIN = 23;

// Replace with your network credentials
const char* ssid = "Temp98";
const char* password = "Tmp22922";

// IP address of the destination UDP server
const char* udpAddress = "192.168.137.1"; // Change this to the IP address of your UDP server
const int udpPort = 7501; // Change this to the port number your UDP server is listening on

WiFiUDP udp;

void setup() {
  Serial.begin(115200);

  pinMode(ENEMY_PIN, INPUT);
  pinMode(SELF_PIN, INPUT);
  pinMode(BASE_PIN, INPUT);
  
  // Connect to WiFi
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

int prev_enemy = LOW;
int prev_self = LOW;
int prev_base = LOW;
void loop() {

  int enemy = digitalRead(ENEMY_PIN);
  int self = digitalRead(SELF_PIN);
  int base = digitalRead(BASE_PIN);

  /*Serial.print((enemy == HIGH ? "true" : "false"));
  Serial.print(", ");
  Serial.print((self == HIGH ? "true" : "false"));
  Serial.print(", ");
  Serial.println((base == HIGH ? "true" : "false"));*/

  int ran = 0;

  if (enemy != prev_enemy && enemy == HIGH) {
    // Send UDP message "1:2"
    //sendUDPMessage("1:2");

    if (isRedTeam) {
      sendHit(redEID, greenEID);
    } else {
      sendHit(greenEID, redEID);
    }
    ran = 1;
  } else if (self != prev_self && self == HIGH) {
    //Send Base hit
    //sendUDPMessage("1:53");
    if (isRedTeam) {
      sendHit(redEID, redEID);
    } else {
      sendHit(greenEID, greenEID);
    }
    ran = 1;
  } else if (base != prev_base && base == HIGH) {
    //send self hit
    //sendUDPMessage("1:1");
    if (isRedTeam) {
      sendHit(redEID, redTeamBase);
    } else {
      sendHit(greenEID, greenTeamBase);
    }
    ran = 1;
  }

  prev_enemy = enemy;
  prev_self = self;
  prev_base = base;
  
  if (ran) {
    delay(400);
  }
  delay(100);
  // Wait for 5 seconds
  //delay(5000);
}

void sendHit(const char* id1, const char* id2) {
  udp.beginPacket(udpAddress, udpPort);
  udp.print(id1);
  udp.print(":");
  udp.print(id2);
  udp.endPacket();
  Serial.print("Sent UDP message: ");
  Serial.print(id1);
  Serial.print(":");
  Serial.println(id2);
}
void sendUDPMessage(const char* message) {
  udp.beginPacket(udpAddress, udpPort);
  udp.print(message);
  udp.endPacket();
  Serial.print("Sent UDP message: ");
  Serial.println(message);
}
