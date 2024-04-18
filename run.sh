cd src

if [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    export CLASSPATH=".;../lib/*"
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
    export CLASSPATH=".;../lib/*"
else
    export CLASSPATH=.:../lib/*
fi

javac Main.java

java Main

cd ..