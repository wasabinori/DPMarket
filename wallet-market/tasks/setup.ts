import { task } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import SimpleNFTABI from "./ABIs/SimpleNFTABI.json";
import DPMarketABI from "./ABIs/DPMarketABI.json";
import ERC6551RegistryABI from "./ABIs/6551RegistoryABI.json"
import { ethers } from "hardhat";

import * as dotenv from 'dotenv';
dotenv.config();

const ACCOUNT_SECRET: string = process.env.PRIVATE_KEY || "";
const GOERLI_URL = process.env.GOERLI_URL || "";


task("hello", "Prints 'Hello, World!'",
	async function (taskArguments, hre, runSuper) {
		console.log("Hello, World!");
	}
);

task("setup", "Mint >> Regist >> Approve >> List")
	// .addParam("contract", "nftContractAddr")
	// .addParam("to", "address who get NFTs")
	.setAction(async(args, hre) =>{
	try {
		// const signer = hre.ethers.getDefaultProvider();
		const { ethers } = hre;
		const { Contract } = ethers;

		const signer = new ethers.Wallet(ACCOUNT_SECRET, ethers.getDefaultProvider());
		
		const nftContract = new hre.ethers.Contract("0xF0B03EC6d4ff843976A6cCa836E9a52A6ea96278", SimpleNFTABI, signer);
		const marketContract = new hre.ethers.Contract("0x24AA6a4a73d9754e6859E721a1185E04aAB2C53f", DPMarketABI, hre.ethers.getDefaultProvider());
		const erc6551Registry = new hre.ethers.Contract("0x000000006551c19487814612e58FE06813775758", ERC6551RegistryABI, hre.ethers.getDefaultProvider());
		// const nftContract = await hre.ethers.getContractAt("0xF0B03EC6d4ff843976A6cCa836E9a52A6ea96278", SimpleNFTABI, signer);
		// const marketContract = await hre.ethers.getContractAt(DPMarketABI, "0x24AA6a4a73d9754e6859E721a1185E04aAB2C53f");
		// const erc6551Registry = await hre.ethers.getContractAt(ERC6551RegistryABI, "0x000000006551c19487814612e58FE06813775758");


		// const provider = new JsonRpcProvider(`https://eth-goerli.g.alchemy.com/v2/${GOERLI_URL}`);
		const gasLimit = 3000000;
		const tx1 = await nftContract.mint("0x088d11E198Ed0a6f818DC03ae295039bD21DB1E5", { gasLimit });
		await tx1.wait();

		console.log(`transaction hash: https://goerli.etherscan.io/tx/${tx1.hash}`);
		/*
			const contract = new hre.ethers.Contract(args.contract, abi, hre.ethers.getDefaultProvider());
			const signer = await hre.ethers.getSigner("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199")
			const tx = await contract.connect(signer).mintNFT(args.to, tokenId);
			await tx.wait();
		*/
	} catch (e) {
		console.log(e);
	};		
});