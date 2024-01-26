# Define the target IP address and port number
$targetIPAddress = "localhost"
$targetPort = 7501

# Create a UDP client
$udpClient = New-Object System.Net.Sockets.UdpClient

# Convert the message to bytes
$message = "end"
$messageBytes = [System.Text.Encoding]::ASCII.GetBytes($message)

# Send the UDP message
$udpClient.Send($messageBytes, $messageBytes.Length, $targetIPAddress, $targetPort)

# Close the UDP client
$udpClient.Close()
