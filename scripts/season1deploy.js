const hre = require("hardhat");

async function main() {
    // We get the contract to deploy
    const Collection = await hre.ethers.getContractFactory("Season1Collection");
    const Factory = await hre.ethers.getContractFactory("Season1Factory");

    const [deployer, dev2] = await hre.ethers.getSigners()

    console.log(deployer.address, dev2.address)
    const chainId = await hre.network.config.chainId;

    let proxyRegistryAddress, nftContract, gameContract, gameQueryContract

    console.log(chainId)
    if (chainId == '73799') {
        proxyRegistryAddress = "0x0000000000000000000000000000000000000000"
        gameContract='0x9394c0f30b0B837BEd005A1C95bB0B317825dE80'
        gameQueryContract='0x155E41922430448ce35C398b88d80Be49CA90868'
    } else {
        proxyRegistryAddress = "0x0000000000000000000000000000000000000000"
        gameContract='0xd171B471043f1fF5C5958D5888b4aF33dAcf0f59'
        gameQueryContract='0xCA069e97eAF742eafB59419999fC309FCBbEAeA6'
    }

    const collection = await Collection.deploy(
        dev2.address, //owner - superuser
        dev2.address, //admin
        dev2.address, //minter
        "Carbonswap Season 1", //name
        "CS1", //symbol
        "ipfs://QmZYG2oyjpFqrX1qT4q8qKHZGtx1JJmdzm1UzN3Bpyso9g/0000000000000000000000000000000000000000000000000000000000000000.json", //contract uri
        "ipfs://QmZYG2oyjpFqrX1qT4q8qKHZGtx1JJmdzm1UzN3Bpyso9g/", //token uri prefix
        ".json", //token uri postfix
        0, // id mode (0: standard-padded hex, 1: unpadded decimal, 2: unpadded hex)
        proxyRegistryAddress // opensea compatible registry address (irrelevant)
    )
    await collection.deployed();
    const factory = await Factory.deploy(
        collection.address, // nft address
        gameContract, // game contract address
        dev2.address, // secondary sales recipient
        "1000" // secondary sales value bps
    )
    await factory.deployed();

    console.log(chainId)
    console.log("collection:", collection.address);
    console.log("factory:", factory.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
