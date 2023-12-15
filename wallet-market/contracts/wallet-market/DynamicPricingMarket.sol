// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable-4.7.3/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "erc6551/interfaces/IERC6551Account.sol";

// 今のDocs
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
//　前回
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorInterface.sol";

// // 前回
// import "../last6551/ERC6551BytecodeLib.sol";
// import "../last6551/IERC6551.sol";
// 最新
// import "../latest6551/lib/ERC6551BytecodeLib.sol";
import "../latest6551/interface/IERC6551Registry.sol";


error PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NotListed(address nftAddress, uint256 tokenId);
error AlreadyListed(address nftAddress, uint256 tokenId);
error NotOwner();
error NoProceeds();
error NotApprovedForMarketplace();

error NotRequester(address);
error RequestTimeover();

contract DynamicPricingMarket is ReentrancyGuardUpgradeable {
	uint256 public setIndex;
	constructor () {
		setIndex = 0;
	}

	struct ItemInfo{
		address nftAddress;
		uint256 tokenId;
	}

	struct Listing{
		uint256 price;
		address seller;
		uint256 index;
	}

	struct Requester {
		address priceRequester;
		uint256 requestedAt;
	}

	// events
	event ItemListed(
		address indexed seller,
		address indexed nftAddress,
		uint256 indexed tokenId,
		uint256 price
	);

	event ItemCanceled(
		address indexed seller,
		address indexed nftAddress,
		uint256 indexed tokenId
	);

	event ItemBought(
		address indexed buyer,
		address indexed nftAddress,
		uint256 indexed tokenId,
		uint256 price,
		uint256 excessEth
	);

	event PriceUpadate(
		address indexed nftAddress,
		uint256 indexed tokenId,
		uint256 price
	);

	mapping(uint256 => ItemInfo) private s_index;

	mapping(address => mapping(uint256 => Listing)) private s_listings;
	mapping(address => uint256) private s_proceeds;
	mapping(address => mapping(uint256 => Requester)) private s_requesters;
	mapping(address => mapping(uint256 => uint256)) private s_timelocks;

	address[] private oracleList = 
		[0x0d79df66BE487753B02D015Fb622DED7f0E9798d, // DAI
		0x48731cF7e84dc94C5f84577882c14Be11a5B7456, // LINK
		0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7];  // USDC

	address private ethOracle = 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e; // ETH

	address[] private tokenList = 
		[0x73967c6a0904aA032C103b4104747E88c566B1A2, // DAI
		0x326C977E6efc84E512bB9C30f76E30c160eD06FB, // LINK
		0x07865c6E87B9F70255377e024ace6630C1Eaa37F]; // USDC

	modifier notListed(
			address nftAddress,
			uint256 tokenId
		) {
			Listing memory listing = s_listings[nftAddress][tokenId];
			if (listing.price > 0) {
				revert AlreadyListed(nftAddress, tokenId);
			}
			_;
		}

	modifier isListed(address nftAddress, uint256 tokenId) {
		Listing memory listing = s_listings[nftAddress][tokenId];
		if (listing.price <= 0) {
			revert NotListed(nftAddress, tokenId);
		}
		_;
	}

	modifier isOwner(
		address nftAddress,
		uint256 tokenId,
		address spender
	) {
		IERC721 nft = IERC721(nftAddress);
		address owner = nft.ownerOf(tokenId);
		
		if (spender != owner) {
			revert NotOwner();
		}
		_;
	}


	modifier checkRequester(address nftAddress, uint256 tokenId) {
		Requester memory requester = s_requesters[nftAddress][tokenId];

		if (msg.sender != requester.priceRequester) {
			revert NotRequester(msg.sender);
		}
		_;
	}

	modifier checkTimestamp(address nftAddress, uint256 tokenId) {
		Requester memory requester = s_requesters[nftAddress][tokenId];
		
		if (block.timestamp - requester.requestedAt >= 384) {
			revert RequestTimeover();
		}
		_;
	}

	modifier onlyAfter(address nftAddress, uint256 tokenId) {
		uint256 _timestamp = s_timelocks[nftAddress][tokenId];

		if (_timestamp != 0) {
			require(block.timestamp - _timestamp >= 384 , "Time lock not expired");
		}
		_;
	}

	function listItem(
		address nftAddress,
		uint256 tokenId
	)
		external
		notListed(nftAddress, tokenId)
		isOwner(nftAddress, tokenId, msg.sender)
	{
		IERC721 nft = IERC721(nftAddress);
		// nft.approve(address(this), tokenId); --権限ないと出来ないかも（onlyOwnerとか）

		if (nft.getApproved(tokenId) != address(this)) {
			revert NotApprovedForMarketplace();
		}
		s_index[setIndex] = ItemInfo(nftAddress, tokenId);
		s_listings[nftAddress][tokenId] = Listing(5000000000000000000, msg.sender, setIndex);
		setIndex++;

		emit ItemListed(msg.sender, nftAddress, tokenId, 5000000000000000000);
	}

	function cancelListing(address nftAddress, uint256 tokenId)
		external
		isOwner(nftAddress, tokenId, msg.sender)
		isListed(nftAddress, tokenId)
	{
		delete (s_listings[nftAddress][tokenId]);
		emit ItemCanceled(msg.sender, nftAddress, tokenId);
	}

	function buyItem(address nftAddress, uint256 tokenId)
		payable
		public
		nonReentrant
		isListed(nftAddress, tokenId)
		checkRequester(nftAddress, tokenId)
		checkTimestamp(nftAddress, tokenId)
	{
		Listing memory listedItem = s_listings[nftAddress][tokenId];
		if (msg.value < listedItem.price) {
			revert PriceNotMet(nftAddress, tokenId, listedItem.price);
		}

		uint256 excessEth = msg.value - listedItem.price;
		if (excessEth > 0) {
			payable(msg.sender).transfer(excessEth);
		}

		s_proceeds[listedItem.seller] += msg.value;
		delete (s_listings[nftAddress][tokenId]);
		IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);
		emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price, excessEth);
	}

	// getPrice flow
	function setTimeLock(address nftAddress, uint256 tokenId) internal {
		s_timelocks[nftAddress][tokenId] = block.timestamp + 384;
	}

	function stateUpdate(address nftAddress, uint256 tokenId, uint256 truePriceBalance) internal {
		s_requesters[nftAddress][tokenId] = Requester(msg.sender, block.timestamp);

		Listing memory temp = s_listings[nftAddress][tokenId];
		s_listings[nftAddress][tokenId] = Listing(truePriceBalance, temp.seller, setIndex);

		emit PriceUpadate(nftAddress, tokenId, truePriceBalance);
	}

	function calcPrice(address nftAddress, uint256 tokenId) external 
		isListed(nftAddress, tokenId)
		onlyAfter(nftAddress, tokenId) 
		{

		uint256 totalUsdBalance = 0;
		address tbaAccountAddress = getAccount(nftAddress, tokenId);

		// calculatePraice
		AggregatorInterface ethPriceFeed = AggregatorInterface(ethOracle);
		int256 ethPrice = ethPriceFeed.latestAnswer();

		totalUsdBalance += (uint256(ethPrice) * address(tbaAccountAddress).balance);

		for (uint i = 0; i < tokenList.length; i++) {
			IERC20 tokenContract = IERC20(tokenList[i]);
			uint256 balance = tokenContract.balanceOf(tbaAccountAddress);

			AggregatorInterface priceFeed = AggregatorInterface(oracleList[i]);
			int256 priceAnswer = priceFeed.latestAnswer();

			totalUsdBalance += uint256(priceAnswer) * balance;
		}

		uint256 ethBalance = tbaAccountAddress.balance;
		uint256 truePriceBalance = (totalUsdBalance / uint256(ethPrice)) + ethBalance;

		// uint256 truePriceBalance = 1980;
		// console.log("Calc. : ", truePriceBalance);
		// console.log("TBA is: ", tbaAccountAddress);
		stateUpdate(nftAddress, tokenId, truePriceBalance);
		setTimeLock(nftAddress, tokenId);
	}

	function getAccount(
			// address _implementationContractAddress,
			// bytes32 _salt,
			// uint256 _chainId,
			address _nftAddress,
			uint256 _tokenId
			) public view returns (address) 
		{
			address _implementationContractAddress = 0x55266d75D1a14E4572138116aF39863Ed6596E7F;
			bytes32 _salt = 0x00000000000000000000000000000000;
			// uint256 _chainId = 5;

			// address regisrtyAddress = 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707; //-- Local Address
			address regisrtyAddress = 0x000000006551c19487814612e58FE06813775758;

			IERC6551Registry registry = IERC6551Registry(regisrtyAddress);
			address account = registry.account(
				_implementationContractAddress,
				_salt,
				block.chainid,
				_nftAddress,
				_tokenId
			);
			return account;
		}

	function getListing(address nftAddress, uint256 tokenId)
		external
		view
		returns (Listing memory)
	{
		return s_listings[nftAddress][tokenId];
	}

	function getAllListings()external view returns (ItemInfo[] memory)
	{
		ItemInfo[] memory result = new ItemInfo[](setIndex+1);
		for (uint256 i = 0; i < setIndex; i++) {
			result[i] = s_index[i];
		}
		return result;
	}

	function getProceeds(address seller) external view returns (uint256) {
		return s_proceeds[seller];
	}
}
