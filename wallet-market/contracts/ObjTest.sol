// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ObjTest {
	struct RequestInfo {
		uint256 requestTime;
		uint256 currentPrice;
	}

	mapping(address => mapping(address => mapping(uint256 => RequestInfo))) public buyerRightInfo;

	function setMap(address nftAddress, uint256 tokenId) external {
		// タイムスタンプを取得
		uint256 timestamp = block.timestamp;
		uint256 feedValue = 1000; 

		// マッピングを更新
		buyerRightInfo[msg.sender][nftAddress][tokenId] = RequestInfo({
			requestTime: timestamp,
			currentPrice: feedValue
		});
	}
}