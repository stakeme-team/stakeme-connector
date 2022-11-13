# stakeme-connector
Lightweight connector for telegram bot @stakeme_bot

## Install
```sh
cd $HOME && \
apt-get update && apt-get install git && \
git clone https://github.com/stakeme-team/stakeme-connector && \
cd stakeme-connector && git checkout master && \
bash prepare-project.sh && \
source $HOME/.bash_profile && \
npm install
```

## Connector
Run connector
```sh
source $HOME/.bash_profile && \
cd $HOME/stakeme-connector && \
npm run start
```
Stop connector
```sh
npm run stop
```
