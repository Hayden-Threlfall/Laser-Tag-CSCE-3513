import socket
import random
import time

bufferSize  = 1024
serverAddressPort   = ("127.0.0.1", 7500)
clientAddressPort   = ("127.0.0.1", 7501)


# Create datagram sockets
UDPServerSocketReceive = socket.socket(family=socket.AF_INET, type=socket.SOCK_DGRAM)
UDPClientSocketTransmit = socket.socket(family=socket.AF_INET, type=socket.SOCK_DGRAM)

# bind server socket
UDPServerSocketReceive.bind(serverAddressPort)


UDPClientSocketTransmit.sendto(str.encode(str("1:43")), clientAddressPort)
print("sent!")
received_data, address = UDPServerSocketReceive.recvfrom(bufferSize)
received_data = received_data.decode('utf-8')
print ("Received from game software: " + received_data)