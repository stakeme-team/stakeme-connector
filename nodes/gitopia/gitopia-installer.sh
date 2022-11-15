#!/bin/bash

NC="\e[0m"
BLUE="\033[1;34m"
function printLog {
  echo -e "${BLUE}${1}${NC}"
}

CHAIN_ID="gitopia-janus-testnet-2"
TOKEN="gitopiad"

printLog "Update packages"
sudo apt update
sudo apt install -y make gcc jq curl git lz4 build-essential chrony unzip
source <(curl -s https://gist.githubusercontent.com/stakemepro/de050a1108dc2c1b86a0f6fd8c0a7442/raw/942032db9f18235d2b87ebe4ac5d28dda4632a37/go-install.sh)

printLog "Install binary"
cd $HOME && curl https://get.gitopia.com | bash
cd || return
rm -rf gitopia && git clone -b v1.2.0 gitopia://gitopia/gitopia
cd $HOME/gitopia && make install
source $HOME/.bash_profile

printLog "Init wallet and setup wallet"
$TOKEN config keyring-backend test
$TOKEN config chain-id $CHAIN_ID
$TOKEN init $STAKEME_MONIKER --chain-id $CHAIN_ID

printLog "Download genesis and setup config"
wget https://server.gitopia.com/raw/gitopia/testnets/master/gitopia-janus-testnet-2/genesis.json.gz
gunzip genesis.json.gz
mv genesis.json $HOME/.gitopia/config/genesis.json

wget -O $HOME/.gitopia/config/addrbook.json "http://65.108.6.45:8000/gitopia/addrbook.json"
sed -i -e "s/^minimum-gas-prices *=.*/minimum-gas-prices = \"0utlore\"/" $HOME/.gitopia/config/app.toml
seeds="bb6f0d3c55a6834037d545159869388bc498a5c7@gitopia.stakeme.pro:27656"
peers="bb6f0d3c55a6834037d545159869388bc498a5c7@gitopia.stakeme.pro:27656"
sed -i -e 's|^seeds *=.*|seeds = "'$seeds'"|; s|^persistent_peers *=.*|persistent_peers = "'$peers'"|' $HOME/.gitopia/config/config.toml

printLog "Setup pruning and other settings"
sed -i -e "s/^minimum-gas-prices *=.*/minimum-gas-prices = \"0utlore\"/" $HOME/.gitopia/config/app.toml
sed -i 's|pruning = "default"|pruning = "custom"|g' $HOME/.gitopia/config/app.toml
sed -i 's|pruning-keep-recent = "0"|pruning-keep-recent = "100"|g' $HOME/.gitopia/config/app.toml
sed -i 's|pruning-interval = "0"|pruning-interval = "50"|g' $HOME/.gitopia/config/app.toml

printLog "Create service file"
sudo tee /etc/systemd/system/gitopiad.service > /dev/null <<EOF
[Unit]
Description=gitopia
After=network-online.target

[Service]
User=$USER
ExecStart=$(which gitopiad) start --home $HOME/.gitopia
Restart=on-failure
RestartSec=10
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF
gitopiad tendermint unsafe-reset-all --home $HOME/.gitopiad --keep-addr-book

SNAP_RPC="http://gitopia.stakeme.pro:27657"
LATEST_HEIGHT=$(curl -s $SNAP_RPC/block | jq -r .result.block.header.height); \
BLOCK_HEIGHT=$((LATEST_HEIGHT - 1000)); \
TRUST_HASH=$(curl -s "$SNAP_RPC/block?height=$BLOCK_HEIGHT" | jq -r .result.block_id.hash)
echo $LATEST_HEIGHT $BLOCK_HEIGHT $TRUST_HASH
sed -i -E "s|^(enable[[:space:]]+=[[:space:]]+).*$|\1true| ; \
s|^(rpc_servers[[:space:]]+=[[:space:]]+).*$|\1\"$SNAP_RPC,$SNAP_RPC\"| ; \
s|^(trust_height[[:space:]]+=[[:space:]]+).*$|\1$BLOCK_HEIGHT| ; \
s|^(trust_hash[[:space:]]+=[[:space:]]+).*$|\1\"$TRUST_HASH\"|" $HOME/.gitopiad/config/config.toml

/root/.nvm/versions/node/v16.18.0/bin/node set-ports-node.js gitopiad .gitopia
sudo systemctl restart gitopiad
