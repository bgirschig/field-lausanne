# TARGET_HOST=bgirschig@80.236.31.52 # barbes network
# TARGET_HOST=bgirschig@192.168.1.218 # la cense network

TARGET_HOST=bgirschig@192.168.0.100 # musée de l'elysée
TARGET_DIR=/Users/Shared/field

ssh $TARGET_HOST <<- EOF
mkdir -p $TARGET_DIR
EOF

scp ./start.sh $TARGET_HOST:$TARGET_DIR/

# Build and deploy frontend
yarn run build
rsync -rlDuvh ./dist/* $TARGET_HOST:$TARGET_DIR/frontend

# deploy detector service
cd ./server
source ./env/bin/activate
/usr/local/bin/pip freeze > requirements.txt
rsync -rlDuvh ./* --exclude env/ --exclude recordings/ $TARGET_HOST:$TARGET_DIR/server
deactivate

ssh $TARGET_HOST <<- EOF
  cd $TARGET_DIR/server
  if [ ! -d env ]; then
    /Library/Frameworks/Python.framework/Versions/2.7/bin/virtualenv env
  fi
  
  # This does not work, because the $PATH is the deployer computer's PATH. This
  # is possibly because this is not an interactive shell (?)
  # 
  # source env/bin/activate
  # pip install -r requirements.txt

  echo $(date +'%m/%d/%Y %r') ' -  update' >> ~/Desktop/log.txt
EOF