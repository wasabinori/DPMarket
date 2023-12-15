"use client"

import WalletConnect from '../components/WalletConnect';
import ERC6551ABI from "../ABIs/6551RegistoryABI.json"
import { useState, useEffect, ChangeEventHandler, FormEventHandler } from "react";
import { ethers } from "ethers";
import Footer from '../components/Footer';

export default function Home() {
	const [address, setAddress] = useState('');

	const RegistryContract = "0x000000006551c19487814612e58FE06813775758";
	const [tbaAddress, setTbaAddress] = useState(null);
	const [nftAddress, setNftAddress] = useState("");
	const [tokenId, setTokenId] = useState<number>();
	
	const handleNftAddressChange: ChangeEventHandler<HTMLInputElement> = ({target}) => {
		setNftAddress(target.value);
		sessionStorage.setItem('NFTaddress', target.value);
	};
	const handleTokenIdChange: ChangeEventHandler<HTMLInputElement> = ({target}) => {
		setTokenId(Number(target.value));
		sessionStorage.setItem('TokenId', target.value);
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

	const createAccount = async () => {
		const implementation = "0x55266d75D1a14E4572138116aF39863Ed6596E7F";
		const salt = ethers.utils.hexZeroPad(ethers.BigNumber.from(0).toHexString(), 32);
		const chainId = 5;
		try {
			const { ethereum }: any = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					RegistryContract,
					ERC6551ABI,
					signer
					);

			console.log("Going to pop wallet now to pay gas...");
			const gasLimit = 3000000; // ガス制限の値を適切に設定
			let transaction: any = await connectedContract.createAccount(implementation, salt, chainId, nftAddress, tokenId, { gasLimit });

			console.log("Listining...please wait.");
			await transaction.wait();
			console.log(`Created 6551TBA, see transaction: https://goerli.etherscan.io/tx/${transaction.hash}`);
				alert(`Created 6551TBA, see transaction: https://goerli.etherscan.io/tx/${transaction.hash}`);
			} else {
				console.log("Ethereum object doesn't exist!");
				alert("error");
			}
		} catch (error) {
			console.log(error);
			alert(error);
		}
	}

	const account = async () => {
		const implementation = "0x55266d75D1a14E4572138116aF39863Ed6596E7F";
		const salt = ethers.utils.hexZeroPad(ethers.BigNumber.from(0).toHexString(), 32);
		const chainId = 5;
		try {
			const { ethereum }: any = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					RegistryContract,
					ERC6551ABI,
					signer
				);

			console.log("Going to pop wallet now to pay gas...");
			const gasLimit = 3000000; // ガス制限の値を適切に設定
			let accountInfo: any = await connectedContract.account(
				implementation, 
				salt, chainId, 
				nftAddress, 
				tokenId, 
				{ gasLimit }
			);
			
			setTbaAddress(accountInfo);
			alert("Account Info: " + accountInfo);
			} else {
				console.log("Ethereum object doesn't exist!");
				alert("error");
			}
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<div>
			<div>
				<WalletConnect address={address} setAddress={setAddress}/>
				Connected Address: &nbsp;
				{!address && <p className='text-red-500'>wallet not connected</p>}
				{address && <p className='text-green-500'>{address}</p>}
			</div>
			<div>
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

					<button 
					type="submit"
					className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
					onClick={createAccount}
					>
					createAccount
					</button>
					<button 
					type="submit"
					className="bg-red-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
					onClick={account}
					>
					getAccount
					</button>
				</form>
			</div>
				<div className='flex'>
					{tbaAddress && <p>TBA Adress: {tbaAddress}</p>}
				</div>
			<Footer />
		</div>
	)
}
