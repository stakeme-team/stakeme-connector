#!/bin/bash
apt-get install screen
if [ ! -f "/root/.nvm/versions/node/v16.18.0/bin/node" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash && source ~/.bash_profile && nvm install 16.18.0 && node -v
fi
