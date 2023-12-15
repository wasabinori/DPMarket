"use client"

import WalletConnect from '../../components/WalletConnect';
import DPMarketABI from "../../ABIs/DPMarketABI.json"
import axios from 'axios';
import { useState, useEffect, ChangeEventHandler, FormEventHandler, FormEvent } from "react";
import { ethers } from "ethers";

import dotenv from 'dotenv';
import Footer from '@/app/components/Footer';
dotenv.config({ path: '@/.env' });

export default function Home() {
	const [address, setAddress] = useState('');

	const [nftAddress, setNftAddress] = useState("");
	const [tokenId, setTokenId] = useState<number>();
	const [nftABI, setNftABI] = useState("");


	const handleNftAddressChange: ChangeEventHandler<HTMLInputElement> = ({target}) => {
		setNftAddress(target.value);
		sessionStorage.setItem('NFTaddress', target.value);
	};

	const handleTokenIdChange: ChangeEventHandler<HTMLInputElement> = ({target}) => {
		setTokenId(Number(target.value));
		sessionStorage.setItem('TokenId', target.value);
	};

	const handleNftABIChange: ChangeEventHandler<HTMLInputElement> = ({target}) => {
		setNftABI(target.value);
	};

	const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault();
	};

	useEffect(() => {
		const storedNFTaddress = sessionStorage.getItem('NFTaddress');
		const storedTokenId = sessionStorage.getItem('TokenId');
	
		if (storedNFTaddress || storedTokenId) {
			setNftAddress(storedNFTaddress ?? "");
			setTokenId(Number(storedTokenId));
		}
	}, []);

	const getAbi = async () => {
		try {
			const response = await axios.get(`https://api-goerli.etherscan.io/api`, {
				params: {
					module: 'contract',
					action: 'getabi',
					address: nftAddress,
					apikey: process.env.NEXT_PUBLIC_ETHERSCAN_API,
				},
			});
			console.log(response)
			const { status, message, result } = response.data;
		
			if (status === '1') {
				alert("Success, getABI");
				setNftABI(result);
			} else {
				console.error(`Error: ${message}`);
				alert(`Error: ${message}`);
				return null;
			}
		} catch (error) {
			console.error('Error fetching ABI:', (error as any).message);
			return null;
		}
	}

	const approveNft = async () => {
		const MarketContract = "0x24AA6a4a73d9754e6859E721a1185E04aAB2C53f";

		try {
			const { ethereum }: any = window;
			if (ethereum) {
				await ethereum.request({ method: 'eth_requestAccounts' });

				const accounts = await ethereum.request({ method: 'eth_accounts' });
				const userAddress = accounts[0];

				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					nftAddress,
					nftABI,
					signer
				);

				console.log("Going to pop wallet now to pay gas...");
				const gasLimit = 300000; // ガス制限の値を適切に設定
				
				console.log("Approve NFT to Market contract...");
				let transaction = await connectedContract.approve(MarketContract, tokenId, { gasLimit });
				console.log("Approving...please wait.");
				
				await transaction.wait();
				console.log(`Approved, see transaction: https://goerli.etherscan.io/tx/${transaction.hash}`);
				alert(`Approved, see transaction: https://goerli.etherscan.io/tx/${transaction.hash}`);
			} else {
				console.log("Ethereum object doesn't exist!");
				alert("error");
			}
		} catch (error) {
			console.log(error);
			alert(error);
		}
	}

	const listItem = async () => {
		const MarketContract = "0x24AA6a4a73d9754e6859E721a1185E04aAB2C53f";

		try {
			const { ethereum }: any = window;
			if (ethereum) {
				await ethereum.request({ method: 'eth_requestAccounts' });

				const accounts = await ethereum.request({ method: 'eth_accounts' });
				const userAddress = accounts[0];

				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					MarketContract,
					DPMarketABI,
					signer
				);

				console.log("Going to pop wallet now to pay gas...");
				const gasLimit = 300000; // ガス制限の値を適切に設定
				
				console.log("Listing NFT to Market contract...");
				let transaction = await connectedContract.listItem(nftAddress, tokenId, { gasLimit });
				console.log("Listing...please wait.");
				
				await transaction.wait();
				console.log(`NFT Listed, see transaction: https://goerli.etherscan.io/tx/${transaction.hash}`);
				alert(`NFT Listed, see transaction: https://goerli.etherscan.io/tx/${transaction.hash}`);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	}



	return (
		<div>
			<div className='pb-6'>
				<WalletConnect address={address} setAddress={setAddress}/>
				
					Connected Address: &nbsp;
					{!address && <p className='text-red-500'>wallet not connected</p>}
					{address && <p className='text-green-500'>{address}</p>}
			</div>
	
			<div>
				{/* approveItem */}
				</div>
					<form onSubmit={handleSubmit}>
						<input 
						className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
						type="text" value={nftAddress}
						placeholder="Write your NFTaddress here..."
						onChange={handleNftAddressChange} />
						<input 
						className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
						type="number" value={tokenId} 
						placeholder="Write your TokenID here..."
						onChange={handleTokenIdChange} />

						<input 
						className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
						type="text" value={nftABI}
						placeholder="Write your NFT ABI here..."
						onChange={handleNftABIChange} />

						<button 
						type="submit"
						className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
						onClick={approveNft}
						>
						approvingNFT
						</button>
					</form>
				<div>
			</div>
				{/* getABI */}
			<div>
				<button 
				type="submit"
				className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
				onClick={getAbi}
				>
				getABI
				</button>
			</div>
				{/* listNFT */}
			<div>
				<button 
				type="submit"
				className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
				onClick={listItem}
				>
				listNFT
				</button>
			</div>
				<Footer />
		</div>
	)
}
