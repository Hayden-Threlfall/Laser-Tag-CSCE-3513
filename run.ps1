# run.ps1

# Change to the 'src' directory
cd src

# Set the CLASSPATH
$env:CLASSPATH = ".;../lib/*"

# Compile Main.java
javac Main.java

# Run the compiled Java program
java Main
