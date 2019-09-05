#!/bin/bash

# This script should be called from launchd/lingonX. It wont work directly

# move to this script's directory
cd "$(dirname "$0")"

# Make sure we have all the tools we need
PATH="/Users/Shared/commands/:$PATH"

# add separator in the log files
echo "----- $(date +'%m/%d/%Y %r')" >> logs-main.txt
echo "----- $(date +'%m/%d/%Y %r')" >> log-front.txt
echo "----- $(date +'%m/%d/%Y %r')" >> log-server.txt

# Pipe this script's logs to a log file
exec >> logs-main.txt 2>&1

# Trap siging and err, so that we can clean processes
trap clean_processes SIGINT
trap clean_processes ERR

# cleanup: kill all services (so that ports are free)
function clean_processes() {
  echo '_field cleanup';
  jobs
  kill %1;
  kill %2;
}

# start detector server
cd server/
source env/bin/activate
python server.py >> ../log-server.txt 2>&1 &

# Static serve files
cd ../frontend/
serve -p 8080 >> ../log-front.txt 2>&1 &

# launch chrome
osascript -e 'quit app "Google Chrome"'
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --start-fullscreen http://localhost:8080
