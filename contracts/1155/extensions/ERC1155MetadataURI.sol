//SPDX-License-Identifier: GPL-3.0-or-later

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "../interfaces/IERC1155MetadataURI.sol";

pragma solidity 0.8.4;

/**
    Note: The ERC-165 identifier for this interface is 0x0e89341c.
*/
abstract contract ERC1155MetadataURI is IERC1155MetadataURI, ERC165 {
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            interfaceId == type(IERC1155MetadataURI).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
