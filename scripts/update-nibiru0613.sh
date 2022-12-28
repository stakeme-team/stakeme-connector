sudo systemctl stop nibid
cd $HOME/nibiru && git pull
git checkout v0.16.3
make install
sudo systemctl restart nibid