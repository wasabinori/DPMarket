import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-verify";

import "./tasks/setup" // tasks

import * as dotenv from 'dotenv';
dotenv.config();

const ACCOUNT_SEACRET: string = process.env.PRIVATE_KEY || "";
const GOERLI_URL = process.env.GOERLI_URL || "";
const MUMBAI_URL = process.env.MUMBAI_URL || "";
const ETHERSCAN_API = process.env.ETHERSCAN_API || "";

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
	solidity: "0.8.20",
	defaultNetwork: "hardhat",
	gasReporter: {
		currency: 'USD', // 任意: ガスのコストを表示する通貨
	},
	networks: {
		hardhat: {
			blockGasLimit: 10000000,
		},
		goerli: {
			url: `https://eth-goerli.g.alchemy.com/v2/${GOERLI_URL}`,
			accounts: [`0x${ACCOUNT_SEACRET}`],
		},
		mumbai: {
			url: `https://polygon-mumbai.g.alchemy.com/v2/${MUMBAI_URL}`,
			accounts: [`0x${ACCOUNT_SEACRET}`],
		},
	},
	etherscan: {
		// Your API key for Etherscan
		// Obtain one at https://etherscan.io/
		apiKey: ETHERSCAN_API
	},
	sourcify: {
		enabled: false,
	},
};

export default config;
