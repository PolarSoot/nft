//SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.4;

abstract contract ISecondarySaleFees {
    struct Fee {
        address payable recipient;
        uint256 value;
    }

    function getSecondarySaleFees(uint256 id)
        public
        view
        virtual
        returns (Fee[] memory);
}
