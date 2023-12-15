// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleNFT is ERC721 {
	uint256 private setTokenId;
	
	event CurrentId(
		uint256 tokenId
	);

	constructor() ERC721("SimpleNFT", "SNFT") {
		setTokenId = 0;
	}

	function mint(address to) external {
		_safeMint(to, setTokenId);
		emit CurrentId(setTokenId);
		setTokenId++;
	}
}
