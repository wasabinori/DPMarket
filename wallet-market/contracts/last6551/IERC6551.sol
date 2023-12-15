// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IERC6551Registry {

	function account(
		address implementation,
		uint256 chainId,
		address tokenContract,
		uint256 tokenId,
		uint256 salt
	) external view returns (address);
}