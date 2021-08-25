//SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.4;

import "../1155/Collection.sol";

contract Season1Collection is Collection {

    mapping(address => mapping(uint256 => bool)) public claims;

    struct CollectionQuery {
        uint256 decimals;
        string name;
        string symbol;
        string uri;
    }

    struct UserQuery {
        uint256 balance;
        uint256 totalSupply;
        uint256 maxSupply;
        string uri;
        address creator;
        bool locked;
        bool claimed;
    }

    constructor(
        address owner,
        address admin,
        address minter,
        string memory _name,
        string memory _symbol,
        string memory _contractURI,
        string memory _tokenURIPrefix,
        string memory _tokenURIPostfix,
        IDMode _idMode,
        address _proxyRegistryAddress
    )
        Collection(
            owner,
            admin,
            minter,
            _name,
            _symbol,
            _contractURI,
            _tokenURIPrefix,
            _tokenURIPostfix,
            _idMode,
            _proxyRegistryAddress
        )
    {}

    function claim(uint256 _id)
        external
    {
        require(!claims[_msgSender()][_id], "claim: already");
        claims[_msgSender()][_id] = true;
    }

    function queryBatch(address _account, uint256[] memory ids)
        external
        view
        returns (UserQuery[] memory, CollectionQuery memory)
    {
        UserQuery[] memory ret = new UserQuery[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            ret[i].balance = balanceOf(_account, ids[i]);
            ret[i].uri = _tokenURI(ids[i]);
            ret[i].totalSupply = token[ids[i]].totalSupply;
            ret[i].maxSupply = token[ids[i]].maxSupply;
            ret[i].creator = token[ids[i]].creator;
            ret[i].locked = token[ids[i]].locked;
            ret[i].claimed = claims[_account][ids[i]];
        }

        CollectionQuery memory cc = CollectionQuery({
            decimals: decimals,
            name: name,
            symbol: symbol,
            uri: contractURI
        });

        return (ret, cc);
    }
}
