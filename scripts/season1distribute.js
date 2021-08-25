const hre = require("hardhat");

async function main() {
    // We get the contract to deploy
    const Collection = await hre.ethers.getContractFactory("Season1Collection");
    const Factory = await hre.ethers.getContractFactory("Season1Factory");

    const [deployer, dev2] = await hre.ethers.getSigners()

    console.log(deployer.address, dev2.address)
    const chainId = await hre.network.config.chainId;

    let proxyRegistryAddress, nftContract, gameContract, gameQueryContract

    if (chainId == '73799') {
        collectionAddress = "0xDb8B4264b1777e046267b4Cc123f0C9E029cEB2c"
        factoryAddress = '0x9394c0f30b0B837BEd005A1C95bB0B317825dE80'
    } else {
        collectionAddress = "0xF88735fe03B6D3A8F3cA7eDa166d2E71Dd54452a"
        factoryAddress = '0x4B9Af606FaA38B8bbF1DC96476d8269206C31fB4'
    }

    const collection = await Collection.attach(
        collectionAddress
    )
    const factory = await Factory.attach(
        factoryAddress
    )

    console.log(chainId)
    console.log("collection:", collection.address);
    console.log("factory:", factory.address);

    let status = await factory.status()
    console.log("initial", status)


    const mrole = await collection.MINTER_ROLE()
    const arole = await collection.ADMIN_ROLE()

    if (!(await collection.hasRole(mrole, factory.address))) {
        await (await collection.connect(dev2).grantRole(
            await collection.MINTER_ROLE(),
            factory.address
        )).wait();
    }

    if (!(await collection.hasRole(arole, factory.address))) {
        await (await collection.connect(dev2).grantRole(
            await collection.ADMIN_ROLE(),
            factory.address
        )).wait();
    }

    if (!status.created) {
        // create all
        console.log("creating...")
        await (await factory.createAll()).wait()
    }

    if (!status.summonersDone) {
        // mint summoners
        console.log("summoners...")
        await (await factory.distributeSummoners()).wait()
    }

    console.log('distributing roles..')
    try {
        while (!status.rolesDone) {
            await (await factory.distributeRoles(100)).wait()
            const ind = await factory.lastProcessedIndex()
            status = (await factory.status())
            console.log("    processed", ind.toString(), "done", status.rolesDone)
        }
    } catch {}
    
    let sum = 0

    console.log("url", 0, await collection.uri(0))

    for (let i=0; i<11; i++) {
        let x = await collection.totalSupply(i)
        let u = await collection.uri(i)
        sum += x.toNumber()
        console.log("supply", i, x.toString())
        console.log("url", i, u)

        console.log((await collection.balanceOf('0x70beb426A7f1B3e0dC2D7058A9d35723d69f4462',i)).toNumber())
    }
    console.log('sum', sum)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
