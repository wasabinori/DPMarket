import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { expect } from "chai";
import { ethers } from "hardhat";


describe("Market Contract", function () {
	async function deployOneYearLockFixture() {

		const [owner, addr1, addr2 ] = await ethers.getSigners();

		const MarketContract = await ethers.getContractFactory("DynamicPricingMarket");
		const market = await MarketContract.deploy();

		const NftContractA = await ethers.getContractFactory("SimpleNFT");
		const nftA = await NftContractA.deploy();

		const ERC6551Registory = await ethers.getContractFactory("ERC6551Registry");
		const registry = await ERC6551Registory.deploy();

		return { market, nftA, registry, owner, addr1, addr2 };
	}

	describe("Basic function", function() {
		it("Should return NFT Info", async function() {
			const { nftA, owner } = await loadFixture(deployOneYearLockFixture);
		
				expect(await nftA.symbol()).to.equal("SNFT");
				expect(await nftA.name()).to.equal("SimpleNFT");

				await nftA.mint(owner.address);
				// const ownerA = await nft.ownerOf(1);
				// console.log("owner is: ", ownerA);
			});
		});
		it("Shuld List & Cancel", async function() {
			const { market, nftA, registry, owner} = await loadFixture(deployOneYearLockFixture);

			await nftA.mint(owner.address);
			const ownerAddr = await nftA.ownerOf(0);

			// Listing flow
			await nftA.approve(market.target, 0)

			await market.listItem(nftA.target, 0, { gasLimit: 5000000 })
			const listedItem = await market.getListing(nftA.target, 0)

			expect(listedItem[0]).to.eq(5000000000000000000n);	// --initial price
			expect(listedItem[1]).to.eq(ownerAddr);				// --seller

			// Cancel flow
			await market.cancelListing(nftA.target, 0)
			const canceledItem =  await market.getListing(nftA.target, 0)
			expect(canceledItem[0]).to.eq(BigInt(0));
			expect(canceledItem[1]).to.eq('0x0000000000000000000000000000000000000000');

			// Show 6551Address
			const implementation = "0x55266d75D1a14E4572138116aF39863Ed6596E7F";
			// const salt = ethers.utils.hexZeroPad(ethers.BigNumber.from(0).toHexString(), 32);
			const chainId = 5;
			// const get6551addr = await market.getAccount(implementation, 0, chainId, nft.target, 0);
			// console.log("Show 6551: ", get6551addr);
		});
		it("Shuld CalcPrice & buyItem", async function() {
			const { market, nftA, owner, addr1, addr2} = await loadFixture(deployOneYearLockFixture);

			// await nft.connect(owner).mint(owner.address);
			for (let i=0; i<30; i++) {
				await nftA.connect(addr1).mint(addr1.address);
				await nftA.connect(addr1).approve(market.target, i);
				await market.connect(addr1).listItem(nftA.target, i, { gasLimit: 5000000 });
			}
			// const ownerAddr = await nft.ownerOf(0);

			// Listing flow
			// await nft.connect(owner).approve(market.target, 0)
			// await market.connect(owner).listItem(nft.target, 0, { gasLimit: 5000000 })
			// await nft.connect(addr1).approve(market.target, 0)
			// await market.connect(addr1).listItem(nft.target, 0, { gasLimit: 5000000 })

			// --showItems
			const result = await market.connect(addr2).getAllListings();
			console.log("Array size: ", result.length);
			// for (let i=0; i<result.length - 1 ; i++) {
			// 	console.log("list item: ", result[i]);
			// }
			console.log("list item: ", result);

			for (let i=0; i<result.length - 1 ; i++) {
				await market.connect(addr2).calcPrice(result[i][0], result[i][1]);
				await market.connect(addr2).buyItem(result[i][0], result[i][1], { value: ethers.parseEther("0.2") });
			}



/* 
const listedItem = await market.connect(owner).getListing(nft.target, 0)
expect(listedItem[0]).to.eq(5000000000000000000n);	// --initial price
expect(listedItem[1]).to.eq(addr1.address);				// --seller

// console.log("Registory address is: ", await registry.getAddress());

await market.connect(addr2).calcPrice(nft.target, 0);
// await market.connect(owner).calcPrice(nft.target, 0);
// await market.connect(addr2).calcrice(nft.target, 1);

await market.connect(addr2).buyItem(nft.target, 0, { value: ethers.parseEther("1.0") });
// await market.connect(addr2).buyItem(nft.target, 1, { value: ethers.parseEther("1.0") });
*/
		});
	});


