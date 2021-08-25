# nft
NFT repo

## Install
```
yarn
```

## How to use season 1
1. manually change the variable in scripts/season1.js
2. `yarn hardhat run --network ewc scripts/season1deploy.js`
3. when done, manually change variable in scripts/season1test.js for the NFT distribution
4. `yarn hardhat run --network ewc scripts/season1distribute.js`
