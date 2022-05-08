#!/bin/bash
# ./run.sh [command]
# 
# Where command can be:
#   start -- starts the servers in devmode
#   stop  -- stops the servers
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

if [ -z "$1" ]; then
    echo "Program requires at least one argument.";
    exit;
fi

if [ "$1" = "start" ]; then
    pushd "$SCRIPT_DIR/integration"
        docker-compose up -d
    popd
elif [ "$1" = "stop" ]; then
    pushd "$SCRIPT_DIR/integration"
        docker-compose down
    popd
else
    echo "Arguments aren't valid";
    exit
fi