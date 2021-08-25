import "dotenv/config";
import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { HardhatUserConfig } from "hardhat/types";



// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
    },
    hardhat: {
      forking: {
        enabled: process.env.FORKING === "true",
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      },
      chainId: 31337
    },
    volta: {
      url: `https://volta-rpc.energyweb.org`,
      accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY2],
      chainId: 73799,
      gasPrice: 1000,
      gasMultiplier: 2,
    },
    ewc: {
      url: `https://rpc-ewc.carbonswap.exchange`,
      accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY2],
      chainId: 246,
      gasPrice: 1000,
      gasMultiplier: 2,
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        }
      }
    ]
  }
};

export default config;