//SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "../1155/opensea/IFactory.sol";
import "../1155/Collection.sol";
import "../1155/libraries/StringLibrary.sol";
import "./StakingGame.sol";

contract Season1Factory is Ownable, ERC1155Receiver {
    struct Status {
        bool created;
        bool summonersDone;
        bool rolesDone;
    }

    Collection public nftContract;
    IStakingGame public gameContract;

    uint256 public lastProcessedIndex;

    Collection.Fee public fee;

    Status public status;

    address[10] public summoners = [
        0x42B089f5087f1951b57044c4637Ba4f1cEB54f93,
        0x7F63dea5B6d233A3A3a240A1100f23320C2916fA,
        0x7B9e6e25ff778219c07faa523795818C1DcD24C1,
        0xe50EE6b9DB43cB7AA7D06CE19526c629251e91e7,
        0x85e3Fc6bD8f60Db75ebB3bac4E127c980f0EDa48,
        0xd85f02a6Cfd7B6Fb3488631699e6b2d5e7F48765,
        0xCE17aD9fb776fc7bd6CB34961D8E49629bAF1238,
        0xe80D07115474a88a05B05CaF07481426A9C63412,
        0x2EEE0DcE11Ad48197c2c2e23C58Ec5739D0EFeC4,
        0x45AD3bE80ED5092AeAd6414B15476D9f1dD6e4b3
    ];

    /**
    "111": "vip", //111
    "112": "potato peeler", //112
    "121": "wood sourcer", //121
    "122": "dj", //122
    "211": "valet", //211
    "212": "entertainer", //212
    "221": "firestarter", //221
    "222": "grillmaster"  //222
   */
    enum Option {
        None,
        Summoner,
        VIP,
        PotatoPeeler,
        WoodSourcer,
        DJ,
        Valet,
        Entertainer,
        Firestarter,
        Grillmaster,
        Stowaway
    }

    uint256 public constant NUM_OPTIONS = 10;
    mapping(uint256 => uint256) public optionToTokenID;

    constructor(
        address _nftContract,
        address _gameContract,
        address payable _feeRecipient,
        uint256 _fee
    ) {
        nftContract = Collection(_nftContract);
        gameContract = IStakingGame(_gameContract);

        fee.recipient = _feeRecipient;
        fee.value = _fee;
    }

    function createAll() external {
        Collection.Fee[] memory eef = new Collection.Fee[](1);
        eef[0] = fee;
        for (uint256 i = 0; i < NUM_OPTIONS + 1; i++) {
            nftContract.create(address(this), i, 0, 0, "", "", eef);
        }
        status.created = true;
    }

    function distributeSummoners() external {
        require(!status.summonersDone && status.created);

        for (uint256 i = 0; i < summoners.length; i++) {
            nftContract.mint(summoners[i], uint256(Option.Summoner), 1, "");
        }

        status.summonersDone = true;
    }

    function distributeRoles(uint256 batchsize) external {
        require(status.summonersDone && !status.rolesDone, "done");

        uint256 maxnum = gameContract.numPlayers();

        uint256 i = lastProcessedIndex;
        uint256 to = i + batchsize > maxnum ? maxnum : i + batchsize;
        for (i; i < to; i++) {
            address player = gameContract.players(i);
            IStakingGame.UserProgress memory progress =
                gameContract.getStatus(player);

            if (!progress.participated) {
                continue;
            }

            if (progress.choice3 == 0) {
                nftContract.mint(player, uint256(Option.Stowaway), 1, "");
                continue;
            }
            nftContract.mint(
                player,
                uint256(
                    getOption(
                        progress.choice1,
                        progress.choice2,
                        progress.choice3
                    )
                ),
                1,
                ""
            );
        }

        lastProcessedIndex = i;
        if (lastProcessedIndex == maxnum) {
            status.rolesDone = true;
        }
    }

    function getOption(
        uint256 c1,
        uint256 c2,
        uint256 c3
    ) internal pure returns (Option) {
        if (c1 == 1 && c2 == 1 && c3 == 1) {
            return Option.VIP;
        }

        if (c1 == 1 && c2 == 1 && c3 == 2) {
            return Option.PotatoPeeler;
        }

        if (c1 == 1 && c2 == 2 && c3 == 1) {
            return Option.WoodSourcer;
        }

        if (c1 == 1 && c2 == 2 && c3 == 2) {
            return Option.DJ;
        }

        if (c1 == 2 && c2 == 1 && c3 == 1) {
            return Option.Valet;
        }

        if (c1 == 2 && c2 == 1 && c3 == 2) {
            return Option.Entertainer;
        }

        if (c1 == 2 && c2 == 2 && c3 == 1) {
            return Option.Firestarter;
        }

        if (c1 == 2 && c2 == 2 && c3 == 2) {
            return Option.Grillmaster;
        }

        revert("unrecognized Option");
    }

    /////
    // IFACTORY METHODS
    /////

    function name() external view returns (string memory) {
        return nftContract.name();
    }

    function symbol() external view returns (string memory) {
        return nftContract.symbol();
    }

    function supportsFactoryInterface() external pure returns (bool) {
        return true;
    }

    function factorySchemaName() external pure returns (string memory) {
        return "ERC1155";
    }

    function numOptions() external pure returns (uint256) {
        return NUM_OPTIONS;
    }

    /////
    // ERC1155Received
    /////

    /**
        @dev Handles the receipt of a single ERC1155 token type. This function is
        called at the end of a `safeTransferFrom` after the balance has been updated.
        To accept the transfer, this must return
        `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
        (i.e. 0xf23a6e61, or its own function selector).
        @param operator The address which initiated the transfer (i.e. msg.sender)
        @param from The address which previously owned the token
        @param id The ID of the token being transferred
        @param value The amount of tokens being transferred
        @param data Additional data with no specified format
        @return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))` if transfer is allowed
    */
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external override returns (bytes4) {
        return bytes4(0xf23a6e61);
    }

    /**
        @dev Handles the receipt of a multiple ERC1155 token types. This function
        is called at the end of a `safeBatchTransferFrom` after the balances have
        been updated. To accept the transfer(s), this must return
        `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
        (i.e. 0xbc197c81, or its own function selector).
        @param operator The address which initiated the batch transfer (i.e. msg.sender)
        @param from The address which previously owned the token
        @param ids An array containing ids of each token being transferred (order and length must match values array)
        @param values An array containing amounts of each token being transferred (order and length must match ids array)
        @param data Additional data with no specified format
        @return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))` if transfer is allowed
    */
    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external override returns (bytes4) {
        return bytes4(0xbc197c81);
    }
}
