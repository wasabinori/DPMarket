import { ethers } from "hardhat";

async function main() {
	const [deployer] = await ethers.getSigners();

	// const Market = await ethers.getContractFactory("DynamicPricingMarket");
	// const market = await Market.deploy();

	const SimpleNFT = await ethers.getContractFactory("SimpleNFT");
	const snft = await SimpleNFT.deploy();

	// console.log("DynamicPricingMarket deployed to:", await market.getAddress());
	console.log("DynamicPricingMarket deployed to:", snft.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});