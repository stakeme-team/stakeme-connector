#!/bin/bash

NC="\e[0m"
BLUE="\033[1;34m"
function printLog {
  echo -e "${BLUE}${1}${NC}"
}

CHAIN_ID="nibiru-testnet-1"
TOKEN="nibid"

printLog "Update packages"
sudo apt update
sudo apt install -y make gcc jq curl git lz4 build-essential chrony unzip
source <(curl -s https://gist.githubusercontent.com/stakemepro/de050a1108dc2c1b86a0f6fd8c0a7442/raw/942032db9f18235d2b87ebe4ac5d28dda4632a37/go-install.sh)

printLog "Install binary"
cd || return
rm -rf nibiru
git clone https://github.com/NibiruChain/nibiru
cd nibiru || return
git checkout v0.15.0
make install
$TOKEN version

printLog "Init wallet and setup wallet"
$TOKEN config keyring-backend test
$TOKEN config chain-id $CHAIN_ID
$TOKEN init $STAKEME_MONIKER --chain-id $CHAIN_ID

printLog "Download genesis and setup config"
curl -s https://rpc.testnet-1.nibiru.fi/genesis | jq -r .result.genesis > $HOME/.nibid/config/genesis.json
sha256sum $HOME/.nibid/config/genesis.json # b58b61beb34f0d9e45ec2f1449f6600acef428b401976dc90edb9d586a412ed2

curl -s https://snapshots3-testnet.nodejumper.io/nibiru-testnet/addrbook.json > $HOME/.nibid/config/addrbook.json
sed -i 's|^minimum-gas-prices *=.*|minimum-gas-prices = "0.0001unibi"|g' $HOME/.nibid/config/app.toml
seeds="ae357e14309640ca33cde597b37f0a91e63a32bd@nibiru.stakeme.pro:36656"
peers="ae357e14309640ca33cde597b37f0a91e63a32bd@nibiru.stakeme.pro:36656,b32bb87364a52df3efcbe9eacc178c96b35c823a@nibiru-testnet.nodejumper.io:26656,968472e8769e0470fadad79febe51637dd208445@65.108.6.45:60656,ff597c3eea5fe832825586cce4ed00cb7798d4b5@rpc.nibiru.ppnv.space:10656,37713248f21c37a2f022fbbb7228f02862224190@35.243.130.198:26656,ff59bff2d8b8fb6114191af7063e92a9dd637bd9@35.185.114.96:26656,cb431d789fe4c3f94873b0769cb4fce5143daf97@35.227.113.63:26656"
sed -i -e 's|^seeds *=.*|seeds = "'$seeds'"|; s|^persistent_peers *=.*|persistent_peers = "'$peers'"|' $HOME/.nibid/config/config.toml

printLog "Setup pruning and other settings"
sed -i 's|^minimum-gas-prices *=.*|minimum-gas-prices = "0.0001unibi"|g' $HOME/.nibid/config/app.toml
sed -i 's|pruning = "default"|pruning = "custom"|g' $HOME/.nibid/config/app.toml
sed -i 's|pruning-keep-recent = "0"|pruning-keep-recent = "100"|g' $HOME/.nibid/config/app.toml
sed -i 's|pruning-interval = "0"|pruning-interval = "10"|g' $HOME/.nibid/config/app.toml

printLog "Create service file"
sudo tee /etc/systemd/system/nibid.service > /dev/null << EOF
[Unit]
Description=Nibiru Node
After=network-online.target
[Service]
User=$USER
ExecStart=$(which nibid) start
Restart=on-failure
RestartSec=10
LimitNOFILE=10000
[Install]
WantedBy=multi-user.target
EOF
nibid tendermint unsafe-reset-all --home $HOME/.nibid --keep-addr-book

SNAP_RPC="http://nibiru.stakeme.pro:36657"
LATEST_HEIGHT=$(curl -s $SNAP_RPC/block | jq -r .result.block.header.height); \
BLOCK_HEIGHT=$((LATEST_HEIGHT - 1000)); \
TRUST_HASH=$(curl -s "$SNAP_RPC/block?height=$BLOCK_HEIGHT" | jq -r .result.block_id.hash)

echo $LATEST_HEIGHT $BLOCK_HEIGHT $TRUST_HASH

sed -i -E "s|^(enable[[:space:]]+=[[:space:]]+).*$|\1true| ; \
s|^(rpc_servers[[:space:]]+=[[:space:]]+).*$|\1\"$SNAP_RPC,$SNAP_RPC\"| ; \
s|^(trust_height[[:space:]]+=[[:space:]]+).*$|\1$BLOCK_HEIGHT| ; \
s|^(trust_hash[[:space:]]+=[[:space:]]+).*$|\1\"$TRUST_HASH\"|" $HOME/.nibid/config/config.toml

sudo systemctl restart nibid
