# TARGET=80.236.31.52 # barbes network
TARGET=192.168.1.218 # la cense network

# Build and deploy frontend
yarn run build
rsync -auvh ./dist/* bgirschig@$TARGET:~/Documents/frontend

cd ./server
source ./env/bin/activate
/usr/local/bin/pip freeze > requirements.txt
rsync -auvh ./* --exclude env/ --exclude recordings/ bgirschig@$TARGET:~/Documents/backend
deactivate

ssh bgirschig@$TARGET <<- EOF
  cd ~/Documents/backend
  if [ ! -d env ]; then
    /Library/Frameworks/Python.framework/Versions/2.7/bin/virtualenv env
  fi
  
  # source env/bin/activate
  # pip install -r requirements.txt

  echo $(date +'%m/%d/%Y %r') ' -  update' >> ~/Desktop/log.txt
  say ding
EOF