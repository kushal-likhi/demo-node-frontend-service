#!/bin/sh


echo "Deployment initiated........$APP_NAME";

cd

mkdir -p node_modules
mkdir -p am/node_modules

BUILD_DIR=`echo $APP_NAME`_node_app_builds

mkdir -p $BUILD_DIR

cd $BUILD_DIR

OLD_DIRS=`ls`

NEW_DIR=`echo $APP_NAME`_`date +%s`

echo $NEW_DIR
echo $OLD_DIRS
echo $BUILD_DIR

git clone $GITHUB_URL $NEW_DIR

cd $NEW_DIR

git pull
git fetch
git branch $DEPLOY_BRANCH origin/$DEPLOY_BRANCH
git checkout $DEPLOY_BRANCH
git pull origin $DEPLOY_BRANCH

ln -sf ~/node_modules node_modules

NODE_ENV=development npm install

cd admin/ks
ln -sf ~/am/node_modules node_modules
npm install
cp -rfv ./patch/base.jade ./node_modules/keystone/templates/layout/base.jade
cd ../../

gulp

TARGET_DIR=`pwd`

cd

MASTER_FOLDER=`echo $APP_NAME`_node_app

ADMIN_APP_NAME=`echo $APP_NAME`_admin

echo "[DEPLOY] Killing the running process"
kill $(ps aux | grep $APP_NAME | awk '{print $2}') || true
kill $(ps aux | grep $ADMIN_APP_NAME | awk '{print $2}') || true

rm -rfv $MASTER_FOLDER

ln -s $TARGET_DIR $MASTER_FOLDER

cd
cd $MASTER_FOLDER
echo "[DEPLOY] Running the application"
nohup node start `echo $APP_NAME` >> ~/node.out 2>&1&
cd admin/ks
nohup node keystone `echo $ADMIN_APP_NAME` >> ~/node_admin.out 2>&1&

cd
cd $BUILD_DIR
rm -rf $OLD_DIRS

cd



