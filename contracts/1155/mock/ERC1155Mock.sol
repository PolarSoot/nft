// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC1155Base.sol";

/**
 * @title ERC1155Mock
 * This mock just publicizes internal functions for testing purposes
 */
contract ERC1155Mock is ERC1155Base {
    constructor(
        string memory _contractURI,
        string memory _tokenURIPrefix,
        string memory _tokenURIPostfix,
        IDMode _idMode
    ) ERC1155Base(_contractURI, _tokenURIPrefix, _tokenURIPostfix, _idMode) {}

    function mint(
        address to,
        uint256 id,
        uint256 value,
        bytes memory data
    ) public {
        _mint(to, id, value, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) public {
        _mintBatch(to, ids, values, data);
    }
}
