#!/bin/bash
apt-get update
if [ ! -f "/root/.nvm/versions/node/v16.18.0/bin/node" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
  touch $HOME/.bash_profile
  echo 'export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion' >> $HOME/.bash_profile
  . $HOME/.bash_profile
  nvm install 16.18.0 && node -v
  npm i forever -g
  npm i shelljs -g
fi
