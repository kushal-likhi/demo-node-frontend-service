#!/bin/sh


echo "Restart initiated........$APP_NAME";

cd

MASTER_FOLDER=`echo $APP_NAME`_node_app

echo "[DEPLOY] Killing the running process"
kill $(ps aux | grep $APP_NAME | awk '{print $2}') || true

cd
cd $MASTER_FOLDER

echo "[DEPLOY] Running the application"
nohup node start `echo $APP_NAME` >> ~/node.out 2>&1&

cd
