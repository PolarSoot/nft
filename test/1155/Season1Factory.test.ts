import { ethers } from "hardhat";
import { expect } from "chai";

import { ADDRESS_ZERO, MAX_UINT, Roles } from "../utils";

const summoners = [
  "0x42B089f5087f1951b57044c4637Ba4f1cEB54f93",
  "0x7F63dea5B6d233A3A3a240A1100f23320C2916fA",
  "0x7B9e6e25ff778219c07faa523795818C1DcD24C1",
  "0xe50EE6b9DB43cB7AA7D06CE19526c629251e91e7",
  "0x85e3Fc6bD8f60Db75ebB3bac4E127c980f0EDa48",
  "0xd85f02a6Cfd7B6Fb3488631699e6b2d5e7F48765",
  "0xCE17aD9fb776fc7bd6CB34961D8E49629bAF1238",
  "0xe80D07115474a88a05B05CaF07481426A9C63412",
  "0x2EEE0DcE11Ad48197c2c2e23C58Ec5739D0EFeC4",
  "0x45AD3bE80ED5092AeAd6414B15476D9f1dD6e4b3"
]

describe("Season1Factory", function () {
  before(async function () {
    this.Factory = await ethers.getContractFactory("Season1Factory");
    this.Collection = await ethers.getContractFactory("Collection");
    this.Gamemock = await ethers.getContractFactory("StakingGameMock");

    this.signers = await ethers.getSigners();
    this.deployer = this.signers[0];
    this.dev = this.signers[1];
    this.alice = this.signers[2];
    this.bob = this.signers[3];
    this.carol = this.signers[4];
  });

  beforeEach(async function () {

    this.game = await this.Gamemock.deploy()

    await this.game.deployed()

    this.collection = await this.Collection.deploy(
      this.dev.address,
      this.dev.address,
      this.dev.address,
      "Carbonswap Season 1 Test",
      "CS1T",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "ipfs://",
      ".json",
      0,
      ADDRESS_ZERO
    );
    this.devcollection = this.collection.connect(this.dev);
    this.alicecollection = this.collection.connect(this.alice);
    this.bobcollection = this.collection.connect(this.bob);
    this.carolcollection = this.collection.connect(this.carol);
    await this.collection.deployed();


    this.factory = await this.Factory.deploy(
      this.collection.address,
      this.game.address,
      this.dev.address,
      "1000"
    );
  
    this.devfactory = this.factory.connect(this.dev);
    this.alicefactory = this.factory.connect(this.alice);
    this.bobfactory = this.factory.connect(this.bob);
    this.carolfactory = this.factory.connect(this.carol);

    await this.factory.deployed();

    await this.devcollection.grantRole(
      this.collection.MINTER_ROLE(),
      this.factory.address
    );

    await this.devcollection.grantRole(
      this.collection.ADMIN_ROLE(),
      this.factory.address
    );
  });

  describe("Init", async function () {
    it("collection should have the correct init values", async function () {
      const name = await this.collection.name();
      const symbol = await this.collection.symbol();
      const decimals = await this.collection.decimals();

      expect(name).to.equal("Carbonswap Season 1 Test");
      expect(symbol).to.be.equal("CS1T");
      expect(decimals).to.equal(18);

      const proxyRegistry = await this.collection.proxyRegistry();
      const tokenURIPrefix = await this.collection.tokenURIPrefix();
      const contractURI = await this.collection.contractURI();

      expect(proxyRegistry).to.equal(ADDRESS_ZERO);
      expect(tokenURIPrefix).to.equal("ipfs://");
      expect(contractURI).to.equal("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });

    it("factory should have the correct init values", async function () {
      const nftContract = await this.factory.nftContract();
      const gameContract = await this.factory.gameContract();

      const fee = await this.factory.fee();

      expect(fee.value).to.equal("1000");
      expect(fee.recipient).to.equal(this.dev.address);
      expect(nftContract).to.equal(this.collection.address);
      expect(gameContract).to.equal(this.game.address);
    });
  });

  describe("Distribute", async function () {
    it("should create all 10 nfts", async function () {
      await (await this.factory.createAll()).wait()

      for(let i=0;i<10;i++) {
        expect(await this.collection.totalSupply(i)).to.equal("0");
        expect(await this.collection.exists(i)).to.equal(true);
        expect(await this.collection.maxSupply(i)).to.equal(MAX_UINT);
      }

      expect(await this.collection.exists(11)).to.equal(false);
    });

    it("should mint summoners correctly", async function () {
      await (await this.factory.createAll()).wait()

      await (await this.factory.distributeSummoners()).wait()

      for (let i=0; i<summoners.length; i++) {
        expect(await this.collection.balanceOf(summoners[i], 1)).to.equal("1");
        expect(await this.collection.totalSupply(1)).to.equal("10");
      }

      expect(await this.collection.balanceOf(this.dev.address, 1)).to.equal("0");
      expect(await this.collection.exists(11)).to.equal(false);
    });

    it("should mint roles", async function () {
      await (await this.factory.createAll()).wait()

      await (await this.factory.distributeSummoners()).wait()

      let status = (await this.factory.status())
      try {
        while (!status.done) {
          await (await this.factory.distributeRoles(2)).wait()
          const ind = await this.factory.lastProcessedIndex()
          status = (await this.factory.status())
        }
      } catch {}

      const n = (await this.game.numPlayers()).toNumber()
      for (let i=0; i<n; i++) {
        
        const playa = await this.game.players(i)
        //expect(await this.collection.balanceOf(summoners[i], 0)).to.equal("1");
      }

      expect(await this.collection.totalSupply(Roles.PotatoPeeler)).to.equal("1");
      expect(await this.collection.totalSupply(Roles.VIP)).to.equal("1");
      expect(await this.collection.totalSupply(Roles.Stowaway)).to.equal("3");

      expect(await this.collection.exists(11)).to.equal(false);
    });
  });
});