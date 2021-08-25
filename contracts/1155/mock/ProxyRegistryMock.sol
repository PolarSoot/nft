//SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.4;

import "../opensea/ProxyRegistry.sol";

contract ProxyRegistryMock is ProxyRegistry {
    function setProxy(address operator) external {
        proxies[msg.sender] = OwnableDelegateProxy(operator);
    }
}
