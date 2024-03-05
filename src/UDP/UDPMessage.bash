#!/bin/bash

# Set the target IP address and port
TARGET_IP="192.168.137.142"
TARGET_PORT="7501"

# Set the message to be sent
#MESSAGE="5:2" # 2 Hit 5
#MESSAGE="2:5"
MESSAGE="10:5" # 2 Hit self
#MESSAGE="2:43" # Capture Green Base
#MESSAGE="5:53" # Capture Red base

# Use echo to send the UDP message without netcat
echo -n "$MESSAGE" > /dev/udp/$TARGET_IP/$TARGET_PORT

# Check if the message was sent successfully
if [ $? -eq 0 ]; then
    echo "Message sent successfully."
else
    echo "Failed to send message."
fi
