#!/bin/sh
# $@ represent all arguments
# $# represent number arguments
# this function is called when Ctrl-C is sent
trap_ctrlc ()
{
  sh stop-mongo.sh
  exit 2
}
 
# initialise trap to call trap_ctrlc function
# when signal 2 (SIGINT) is received
trap "trap_ctrlc" 2

docker-compose down -v --remove-orphans > /dev/null 2>&1

if [ $# -eq 1 ]; then
  docker-compose up -d
  npm run watch
elif [ $# -eq 2 ]; then
  docker-compose up -d
else
  docker-compose up
fi