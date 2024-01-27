#!/bin/bash

# Set the target URL
TARGET_URL="http://localhost:8000/api"

# Set the message to be sent
MESSAGE="Message:Hello, HTTP Server!"

# Use curl to send the HTTP POST request with the message
curl -X POST -d "$MESSAGE" "$TARGET_URL"

# Check if the request was successful
if [ $? -eq 0 ]; then
    echo "Request sent successfully."
else
    echo "Failed to send request."
fi
