# stakeme-connector
Lightweight connector for telegram bot @stakeme_bot

## Install
```sh
cd $HOME && \
git clone https://github.com/stakeme-team/stakeme-connector && \
cd stakeme-connector && git checkout master && \
bash prepare-project.sh && \
source $HOME/.bash_profile && \
npm install
```

## Run connector
Create screen
```sh
source $HOME/.bash_profile && \
cd $HOME/stakeme-connector && \
screen -S stakeme-connector
```
Run connector
```sh
npm run start
```
Exit screen: ```CRTL + A + D```

## Join screen
```sh
screen -x stakeme-connector
```
Exit screen: ```CRTL + A + D```


