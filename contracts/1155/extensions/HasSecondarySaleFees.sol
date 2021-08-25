//SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.4;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "../interfaces/ISecondarySaleFees.sol";

abstract contract HasSecondarySaleFees is ERC165, ISecondarySaleFees {
    /**
     * @dev bytes4(keccak256("getSecondarySaleFees(uint256)"))
     */
    bytes4 private constant _INTERFACE_ID_FEES = 0xaeff4016;

    mapping(uint256 => Fee[]) internal secondarySaleFees;

    event SecondarySaleFees(uint256 indexed id);

    /*
     * bytes4(keccak256('getFeeBps(uint256)')) == 0x0ebd4c7f
     * bytes4(keccak256('getFeeRecipients(uint256)')) == 0xb9c4d9fb
     *
     * => 0x0ebd4c7f ^ 0xb9c4d9fb == 0xb7799584
     */

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
            interfaceId == _INTERFACE_ID_FEES ||
            super.supportsInterface(interfaceId);
    }

    function getSecondarySaleFees(uint256 id)
        public
        view
        override
        returns (Fee[] memory)
    {
        return _onSecondarySaleFeesFetch(id);
    }

    function _setSecondarySaleFees(uint256 id, Fee[] memory fees)
        internal
        virtual
    {
        for (uint256 i = 0; i < fees.length; i++) {
            secondarySaleFees[id].push(fees[i]);
        }

        emit SecondarySaleFees(id);
    }

    function _onSecondarySaleFeesFetch(uint256 id)
        internal
        view
        virtual
        returns (Fee[] memory)
    {
        return secondarySaleFees[id];
    }
}
