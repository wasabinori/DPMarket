import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleNFT Contract", function () {
	async function deployOneYearLockFixture() {

		const [owner, otherAccount] = await ethers.getSigners();

		const NewContract = await ethers.getContractFactory("SimpleNFT");
		const newcontract = await NewContract.deploy();

		return { newcontract, owner, otherAccount };
	}
	describe("Basic Info", function() {
		it("Shuld return collectname", async function() {
			const { newcontract } = await loadFixture(deployOneYearLockFixture);

			expect(await newcontract.name()).to.equal("SimpleNFT");
		});
		it("Should return collect symbol", async function () {
			const { newcontract } = await loadFixture(deployOneYearLockFixture);
		
			expect(await newcontract.symbol()).to.equal("SNFT");
			});
		});
});
