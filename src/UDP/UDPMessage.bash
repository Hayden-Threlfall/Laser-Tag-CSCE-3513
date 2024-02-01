#!/bin/bash

# Set the target IP address and port
TARGET_IP="127.0.0.1"
TARGET_PORT="7501"

# Set the message to be sent
MESSAGE="Hello, UDP!"

# Use echo to send the UDP message without netcat
echo -n "$MESSAGE" > /dev/udp/$TARGET_IP/$TARGET_PORT

# Check if the message was sent successfully
if [ $? -eq 0 ]; then
    echo "Message sent successfully."
else
    echo "Failed to send message."
fi
