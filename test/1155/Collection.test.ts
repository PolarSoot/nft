import { ethers } from "hardhat";
import { expect } from "chai";

import { ADDRESS_ZERO, MAX_UINT } from "../utils";

describe("Collection", function () {
    before(async function () {
        this.Collection = await ethers.getContractFactory("Collection");
        this.Gamemock = await ethers.getContractFactory("StakingGameMock");
        this.ProxyRegistry = await ethers.getContractFactory("ProxyRegistryMock");

        this.signers = await ethers.getSigners();
        this.deployer = this.signers[0];
        this.dev = this.signers[1];
        this.alice = this.signers[2];
        this.bob = this.signers[3];
        this.carol = this.signers[4];

        this.proxyRegistry = await this.ProxyRegistry.deploy()
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

        await this.devcollection.create(
            this.dev.address,
            0,
            0,
            0,
            [],
            "",
            []
        )
    });

    it("Init should set the correct init values", async function () {

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

        const name = await this.collection.name();
        const symbol = await this.collection.symbol();
        const decimals = await this.collection.decimals();

        expect(name).to.equal("Carbonswap Season 1 Test");
        expect(symbol).to.be.equal("CS1T");
        expect(decimals).to.equal(18);

        const proxyRegistry = await this.collection.proxyRegistry();
        const tokenURIPrefix = await this.collection.tokenURIPrefix();
        const tokenURIPostfix = await this.collection.tokenURIPostfix();
        const contractURI = await this.collection.contractURI();

        expect(proxyRegistry).to.equal(ADDRESS_ZERO);
        expect(tokenURIPrefix).to.equal("ipfs://");
        expect(tokenURIPostfix).to.equal(".json");
        expect(contractURI).to.equal("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

        expect(await this.collection.exists(0)).to.equal(false);
    });

    it("create should set values correctly", async function () {
        await expect(this.devcollection.create(
            this.dev.address,
            1,
            1,
            0,
            [],
            "",
            []
        )).to.emit(this.devcollection, "Create").withArgs(1, this.dev.address)

        expect(await this.collection.exists(1)).to.equal(true);
        expect(await this.collection.totalSupply(1)).to.equal("1");
        expect(await this.collection.maxSupply(1)).to.equal(MAX_UINT);
        expect(await this.collection.balanceOf(this.dev.address, 1)).to.equal("1");
        expect(await this.collection.balanceOf(this.alice.address, 1)).to.equal("0");
        expect(await this.collection.tokenURIPrefix()).to.equal("ipfs://");
        expect(await this.collection.uri(1)).to.equal("ipfs://0000000000000000000000000000000000000000000000000000000000000001.json");

        let fees = await this.collection.getSecondarySaleFees(1)
        expect(fees.length).to.equal(0)

        expect(await this.collection.balanceOf(this.alice.address, 1)).to.equal("0");

        await this.devcollection.create(
            this.dev.address,
            2,
            0,
            0,
            [],
            "",
            []
        )
        expect(await this.collection.exists(2)).to.equal(true);
        expect(await this.collection.totalSupply(2)).to.equal("0");
        expect(await this.collection.maxSupply(2)).to.equal(MAX_UINT);
        expect(await this.collection.balanceOf(this.dev.address, 2)).to.equal("0");
        expect(await this.collection.balanceOf(this.alice.address, 2)).to.equal("0");
        expect(await this.collection.tokenURIPrefix()).to.equal("ipfs://");
        expect(await this.collection.uri(2)).to.equal("ipfs://0000000000000000000000000000000000000000000000000000000000000002.json");

        fees = await this.collection.getSecondarySaleFees(2)
        expect(fees.length).to.equal(0)

        await this.devcollection.create(
            this.dev.address,
            3,
            0,
            100,
            [],
            "",
            []
        )
        expect(await this.collection.exists(3)).to.equal(true);
        expect(await this.collection.totalSupply(3)).to.equal("0");
        expect(await this.collection.maxSupply(3)).to.equal("100");
        expect(await this.collection.balanceOf(this.dev.address, 3)).to.equal("0");
        expect(await this.collection.balanceOf(this.alice.address, 3)).to.equal("0");
        expect(await this.collection.tokenURIPrefix()).to.equal("ipfs://");
        expect(await this.collection.uri(3)).to.equal("ipfs://0000000000000000000000000000000000000000000000000000000000000003.json");

        fees = await this.collection.getSecondarySaleFees(3)
        expect(fees.length).to.equal(0)

        await this.devcollection.create(
            this.dev.address,
            4,
            0,
            100,
            [],
            "ipfs://yolococo",
            []
        )
        expect(await this.collection.exists(4)).to.equal(true);
        expect(await this.collection.totalSupply(4)).to.equal("0");
        expect(await this.collection.maxSupply(4)).to.equal("100");
        expect(await this.collection.balanceOf(this.dev.address, 4)).to.equal("0");
        expect(await this.collection.balanceOf(this.alice.address, 4)).to.equal("0");
        expect(await this.collection.tokenURIPrefix()).to.equal("ipfs://");
        expect(await this.collection.uri(4)).to.equal("ipfs://yolococo");

        fees = await this.collection.getSecondarySaleFees(4)
        expect(fees.length).to.equal(0)

        await this.devcollection.create(
            this.dev.address,
            5,
            0,
            100,
            [],
            "ipfs://yolococo",
            [{ recipient: this.alice.address, value: "100" }, { recipient: this.bob.address, value: "1000" }]
        )
        expect(await this.collection.exists(5)).to.equal(true);
        expect(await this.collection.totalSupply(5)).to.equal("0");
        expect(await this.collection.maxSupply(5)).to.equal("100");
        expect(await this.collection.balanceOf(this.dev.address, 5)).to.equal("0");
        expect(await this.collection.balanceOf(this.alice.address, 5)).to.equal("0");
        expect(await this.collection.tokenURIPrefix()).to.equal("ipfs://");
        expect(await this.collection.uri(5)).to.equal("ipfs://yolococo");

        fees = await this.collection.getSecondarySaleFees(5)
        expect(fees.length).to.equal(2)
        expect(fees[0].recipient).to.equal(this.alice.address)
        expect(fees[0].value).to.equal("100")
        expect(fees[1].recipient).to.equal(this.bob.address)
        expect(fees[1].value).to.equal("1000")
    })

    it("create should revert if already exists", async function () {
        await this.devcollection.create(
            this.dev.address,
            4,
            0,
            100,
            [],
            "",
            [{ recipient: this.alice.address, value: "100" }, { recipient: this.bob.address, value: "1000" }]
        )

        await expect(this.devcollection.create(
            this.dev.address,
            4,
            0,
            0,
            [],
            "",
            []
        )).to.revertedWith('Collection::create: already')
    })

    it("mint should be correct", async function () {
        await expect(this.devcollection.mint(
            this.alice.address,
            0,
            10,
            []
        )
        ).to.emit(this.alicecollection, 'TransferSingle').withArgs(this.dev.address, ADDRESS_ZERO, this.alice.address, 0, 10)

        expect(await this.collection.totalSupply(0)).to.equal("10");
        expect(await this.collection.maxSupply(0)).to.equal(MAX_UINT);
        expect(await this.collection.balanceOf(this.alice.address, 0)).to.equal("10");
    })

    it("burn should be correct", async function () {
        await this.devcollection.mint(
            this.alice.address,
            0,
            10,
            []
        )

        await this.alicecollection.burn(
            this.alice.address,
            0,
            9,
            []
        )

        expect(await this.collection.totalSupply(0)).to.equal("1");
        expect(await this.collection.maxSupply(0)).to.equal(MAX_UINT);
        expect(await this.collection.balanceOf(this.alice.address, 0)).to.equal("1");

        await expect(this.alicecollection.burn(
            this.alice.address,
            0,
            1,
            []
        )).to.emit(this.alicecollection, 'TransferSingle').withArgs(this.alice.address, this.alice.address, ADDRESS_ZERO, 0, 1)
    })


    it("should be correct on mintBatch", async function () {
        const ids = ["0", "1", "2"]
        const amounts = ["10", "0", "1"]

        await expect(this.devcollection.create(
            this.dev.address,
            1,
            0,
            0,
            [],
            "",
            []
        ))

        await expect(this.devcollection.create(
            this.dev.address,
            2,
            0,
            0,
            [],
            "",
            []
        ))

        await expect(this.devcollection.mintBatch(
            this.alice.address,
            ids,
            amounts,
            []
        )
        ).to.emit(this.alicecollection, 'TransferBatch').withArgs(this.dev.address, ADDRESS_ZERO, this.alice.address, ids, amounts)

        expect(await this.collection.totalSupply(0)).to.equal("10");
        expect(await this.collection.totalSupply(1)).to.equal("0");
        expect(await this.collection.totalSupply(2)).to.equal("1");

        expect(await this.collection.maxSupply(0)).to.equal(MAX_UINT);
        expect(await this.collection.maxSupply(1)).to.equal(MAX_UINT);
        expect(await this.collection.maxSupply(2)).to.equal(MAX_UINT);

        expect(await this.collection.balanceOf(this.alice.address, 0)).to.equal("10");
        expect(await this.collection.balanceOf(this.alice.address, 1)).to.equal("0");
        expect(await this.collection.balanceOf(this.alice.address, 2)).to.equal("1");
    })

    it("should be correct on burnBatch", async function () {
        const ids = ["0", "1", "2"]
        const amounts = ["10", "0", "1"]

        await expect(this.devcollection.create(
            this.dev.address,
            1,
            0,
            0,
            [],
            "",
            []
        ))

        await expect(this.devcollection.create(
            this.dev.address,
            2,
            0,
            0,
            [],
            "",
            []
        ))

        await expect(this.devcollection.mintBatch(
            this.alice.address,
            ids,
            amounts,
            []
        )
        ).to.emit(this.alicecollection, 'TransferBatch').withArgs(this.dev.address, ADDRESS_ZERO, this.alice.address, ids, amounts)

        await expect(this.alicecollection.burnBatch(
            this.alice.address,
            ids,
            amounts,
            []
        )
        ).to.emit(this.alicecollection, 'TransferBatch').withArgs(this.alice.address, this.alice.address, ADDRESS_ZERO, ids, amounts)

        expect(await this.collection.totalSupply(0)).to.equal("0");
        expect(await this.collection.totalSupply(1)).to.equal("0");
        expect(await this.collection.totalSupply(2)).to.equal("0");

        expect(await this.collection.maxSupply(0)).to.equal(MAX_UINT);
        expect(await this.collection.maxSupply(1)).to.equal(MAX_UINT);
        expect(await this.collection.maxSupply(2)).to.equal(MAX_UINT);

        expect(await this.collection.balanceOf(this.alice.address, 0)).to.equal("0");
        expect(await this.collection.balanceOf(this.alice.address, 1)).to.equal("0");
        expect(await this.collection.balanceOf(this.alice.address, 2)).to.equal("0");
    })

    it("should be correct on safeTransferFrom", async function () {
        await expect(this.devcollection.mint(
            this.alice.address,
            0,
            10,
            []
        )
        ).to.emit(this.devcollection, 'TransferSingle').withArgs(this.dev.address, ADDRESS_ZERO, this.alice.address, 0, 10)

        await expect(this.alicecollection.safeTransferFrom(
            this.alice.address,
            this.bob.address,
            0,
            5,
            []
        )
        ).to.emit(this.alicecollection, 'TransferSingle').withArgs(this.alice.address, this.alice.address, this.bob.address, 0, 5)

        expect(await this.collection.totalSupply(0)).to.equal("10");
        expect(await this.collection.maxSupply(0)).to.equal(MAX_UINT);
        expect(await this.collection.balanceOf(this.alice.address, 0)).to.equal("5");
        expect(await this.collection.balanceOf(this.bob.address, 0)).to.equal("5");
    })

    it("should be correct on safeBatchTransferFrom", async function () {
        const ids = ["0", "1", "2"]
        const amounts = ["10", "0", "1"]

        await expect(this.devcollection.create(
            this.dev.address,
            1,
            0,
            0,
            [],
            "",
            []
        ))

        await expect(this.devcollection.create(
            this.dev.address,
            2,
            0,
            0,
            [],
            "",
            []
        ))

        await expect(this.devcollection.mintBatch(
            this.alice.address,
            ids,
            amounts,
            []
        ))

        await expect(this.alicecollection.safeBatchTransferFrom(
            this.alice.address,
            this.bob.address,
            ids,
            amounts,
            []
        )
        ).to.emit(this.alicecollection, 'TransferBatch').withArgs(this.alice.address, this.alice.address, this.bob.address, ids, amounts)

        expect(await this.collection.totalSupply(0)).to.equal("10");
        expect(await this.collection.totalSupply(1)).to.equal("0");
        expect(await this.collection.totalSupply(2)).to.equal("1");

        expect(await this.collection.maxSupply(0)).to.equal(MAX_UINT);
        expect(await this.collection.maxSupply(1)).to.equal(MAX_UINT);
        expect(await this.collection.maxSupply(2)).to.equal(MAX_UINT);

        expect(await this.collection.balanceOf(this.bob.address, 0)).to.equal("10");
        expect(await this.collection.balanceOf(this.bob.address, 1)).to.equal("0");
        expect(await this.collection.balanceOf(this.bob.address, 2)).to.equal("1");

        expect(await this.collection.balanceOf(this.alice.address, 0)).to.equal("0");
        expect(await this.collection.balanceOf(this.alice.address, 1)).to.equal("0");
        expect(await this.collection.balanceOf(this.alice.address, 2)).to.equal("0");
    })

    it("should be correct on safeBatchTransferFrom", async function () {
        await this.devcollection.mint(
            this.alice.address,
            0,
            10,
            []
        )

        await expect(this.devcollection.lock(0)).to.emit(this.devcollection, "Lock").withArgs(0)
        expect(await this.collection.totalSupply(0)).to.equal("10");
        expect(await this.collection.maxSupply(0)).to.equal("10");

        await expect(
            this.devcollection.mint(
                this.alice.address,
                0,
                10,
                []
            )
        ).to.be.revertedWith("Collection::txhook: mint max reached")
    })

    it("version should return correctly", async function () {
        expect(await this.collection.VERSION()).to.equal("1");
    })
    
    it("only the admin should create", async function () {
        const arole = await this.collection.ADMIN_ROLE()
        await expect(this.alicecollection.create(
            this.alice.address,
            1,
            0,
            0,
            [],
            "",
            []
        )).to.revertedWith(`AccessControl: account ${this.alice.address.toLowerCase()} is missing role ${arole.toLowerCase()}`);

        await this.devcollection.grantRole(
            arole,
            this.alice.address
        )

        await this.alicecollection.create(
            this.alice.address,
            1,
            1,
            0,
            [],
            "",
            []
        )

        await this.devcollection.revokeRole(
            arole,
            this.alice.address
        )

        await expect(this.alicecollection.create(
            this.alice.address,
            2,
            0,
            0,
            [],
            "",
            []
        )).to.revertedWith(`AccessControl: account ${this.alice.address.toLowerCase()} is missing role ${arole.toLowerCase()}`);
    })

    it("only the minter should mint", async function () {
        const mrole = await this.collection.MINTER_ROLE()
        await expect(this.alicecollection.mint(
            this.alice.address,
            0,
            1,
            []
        )).to.revertedWith(`AccessControl: account ${this.alice.address.toLowerCase()} is missing role ${mrole.toLowerCase()}`);

        await expect(this.alicecollection.mintBatch(
            this.alice.address,
            [0],
            [1],
            []
        )).to.revertedWith(`AccessControl: account ${this.alice.address.toLowerCase()} is missing role ${mrole.toLowerCase()}`);

        await this.devcollection.grantRole(
            mrole,
            this.alice.address
        )

        await this.alicecollection.mint(
            this.alice.address,
            0,
            1,
            []
        )

        await this.alicecollection.mintBatch(
            this.alice.address,
            [0],
            [1],
            []
        )
    })

    it("only the owner or operator of an NFT can transfer/burn", async function () {
        await expect(this.devcollection.create(
            this.dev.address,
            1,
            0,
            0,
            [],
            "",
            []
        ))

        await expect(this.devcollection.mintBatch(
            this.alice.address,
            [0, 1],
            [10, 10],
            []
        ))

        await expect(this.devcollection.safeTransferFrom(
            this.alice.address,
            this.dev.address,
            0,
            5,
            []
        )).to.revertedWith(`ERC1155: caller is not owner nor approved`);

        await expect(this.devcollection.safeBatchTransferFrom(
            this.alice.address,
            this.dev.address,
            [0],
            [5],
            []
        )).to.revertedWith(`ERC1155: caller is not owner nor approved`);

        await expect(this.devcollection.burn(
            this.alice.address,
            0,
            5,
            []
        )).to.revertedWith(`ERC1155: caller is not owner nor approved`);
        
        await expect(this.devcollection.burnBatch(
            this.alice.address,
            [0],
            [5],
            []
        )).to.revertedWith(`ERC1155: caller is not owner nor approved`);

        await this.alicecollection.setApprovalForAll(
            this.bob.address,
            true
        )

        await this.bobcollection.safeTransferFrom(
            this.alice.address,
            this.bob.address,
            0,
            1,
            []
        )

        await this.bobcollection.safeBatchTransferFrom(
            this.alice.address,
            this.bob.address,
            [0],
            [1],
            []
        )

        await this.bobcollection.burn(
            this.bob.address,
            0,
            1,
            []
        )
        
        await this.bobcollection.burnBatch(
            this.bob.address,
            [0],
            [1],
            []
        )

        await this.alicecollection.setApprovalForAll(
            this.bob.address,
            false
        )

        await expect(this.bobcollection.safeTransferFrom(
            this.alice.address,
            this.bob.address,
            0,
            1,
            []
        )).to.revertedWith(`ERC1155: caller is not owner nor approved`);
    })

    it("proxyregistry should work correctly", async function () {
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
            this.proxyRegistry.address
        );

        this.devcollection = await this.collection.connect(this.dev);

        await expect(this.devcollection.create(
            this.alice.address,
            0,
            10,
            0,
            [],
            "",
            []
        ))

        await expect(this.devcollection.safeTransferFrom(
            this.alice.address,
            this.dev.address,
            0,
            5,
            []
        )).to.revertedWith(`ERC1155: caller is not owner nor approved`);

        await this.proxyRegistry.connect(this.alice).setProxy(this.dev.address);

        this.devcollection.safeTransferFrom(
            this.alice.address,
            this.dev.address,
            0,
            1,
            []
        )
    })

    it("should work correctly in standard id mode", async function() {

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

        this.collection.connect(this.dev).create(
            this.alice.address,
            22,
            10,
            0,
            [],
            "",
            []
        )

        expect(await this.collection.uriScheme(22)).to.equal("ipfs://{id}.json")
        expect(await this.collection.uri(22)).to.equal("ipfs://0000000000000000000000000000000000000000000000000000000000000016.json")
        await this.collection.connect(this.dev).setTokenURIPostfix("");
        expect(await this.collection.uriScheme(22)).to.equal("ipfs://{id}")
        expect(await this.collection.uri(22)).to.equal("ipfs://0000000000000000000000000000000000000000000000000000000000000016")
    })

    it("should work correctly in decimal id mode", async function() {

        this.collection = await this.Collection.deploy(
            this.dev.address,
            this.dev.address,
            this.dev.address,
            "Carbonswap Season 1 Test",
            "CS1T",
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "ipfs://",
            ".json",
            1,
            ADDRESS_ZERO
        );

        await this.collection.connect(this.dev).create(
            this.alice.address,
            22,
            10,
            0,
            [],
            "",
            []
        )

        expect(await this.collection.uriScheme(22)).to.equal("ipfs://{id}.json")
        expect(await this.collection.uri(22)).to.equal("ipfs://22.json")
        await this.collection.connect(this.dev).setTokenURIPostfix("");
        expect(await this.collection.uriScheme(22)).to.equal("ipfs://{id}")
        expect(await this.collection.uri(22)).to.equal("ipfs://22")
    })

    it("should work correctly in hex id mode", async function() {

        this.collection = await this.Collection.deploy(
            this.dev.address,
            this.dev.address,
            this.dev.address,
            "Carbonswap Season 1 Test",
            "CS1T",
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "ipfs://",
            ".json",
            2,
            ADDRESS_ZERO
        );

        await this.collection.connect(this.dev).create(
            this.alice.address,
            22,
            10,
            0,
            [],
            "",
            []
        )

        expect(await this.collection.uriScheme(22)).to.equal("ipfs://{id}.json")
        expect(await this.collection.uri(22)).to.equal("ipfs://16.json")
        await this.collection.connect(this.dev).setTokenURIPostfix("");
        expect(await this.collection.uriScheme(22)).to.equal("ipfs://{id}")
        expect(await this.collection.uri(22)).to.equal("ipfs://16")
    })

    it("should work correctly in with custom url mode", async function() {

        this.collection = await this.Collection.deploy(
            this.dev.address,
            this.dev.address,
            this.dev.address,
            "Carbonswap Season 1 Test",
            "CS1T",
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "ipfs://",
            ".json",
            2,
            ADDRESS_ZERO
        );

        await this.collection.connect(this.dev).create(
            this.alice.address,
            22,
            10,
            0,
            [],
            "https://fuckyou",
            []
        )

        expect(await this.collection.uriScheme(22)).to.equal("https://fuckyou")
        expect(await this.collection.uri(22)).to.equal("https://fuckyou")
        await this.collection.connect(this.dev).setTokenURIPostfix("");
        expect(await this.collection.uriScheme(22)).to.equal("https://fuckyou")
        expect(await this.collection.uri(22)).to.equal("https://fuckyou")
    })
});
