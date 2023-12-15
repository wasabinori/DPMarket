import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { expect } from "chai";
import { ethers } from "hardhat";

describe("Mapping Test", function () {
	async function deployOneYearLockFixture() {

		const [owner, otherAccount] = await ethers.getSigners();

		const NewContract = await ethers.getContractFactory("ObjTest");
		const newcontract = await NewContract.deploy();

		return { newcontract, owner, otherAccount };
	}
	describe("Object Info", function() {
		it("Shuld return Object", async function() {
			const { newcontract, owner } = await loadFixture(deployOneYearLockFixture);

			const nftAddress = '0x9876543210987654321098765432109876543210';
			const tokenId = 42;

			// テスト実行
			await newcontract.connect(owner).setMap(nftAddress, tokenId);

			// buyerRightInfoが正しくセットされたか確認
			const result = await newcontract.buyerRightInfo(
			await owner.getAddress(),
				nftAddress,
				tokenId
			);
			console.log("	Return: ", result);
		});
	});
});
