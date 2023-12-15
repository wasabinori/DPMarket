"use client"

import WalletConnect from '../../components/WalletConnect';
import Footer from '@/app/components/Footer';
import SimpleNFTABI from "@/app/ABIs/SimpleNFTABI.json"
import { useState, useEffect} from "react";
import Link from 'next/link';
import { ethers } from "ethers";

export default function Mint() {
	const [address, setAddress] = useState('');
	const [getId, setGetId] = useState<number>();

	const msgCatch = async (_from: any, _msg: any) => {
		setGetId(parseInt(_from._hex));
	}


	const mint = async () => {
		const SimpleNFTContract = "0xF0B03EC6d4ff843976A6cCa836E9a52A6ea96278";

		try {
			const { ethereum }: any = window;
			if (ethereum) {
				await ethereum.request({ method: 'eth_requestAccounts' });

				const accounts = await ethereum.request({ method: 'eth_accounts' });
				const userAddress = accounts[0];

				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					SimpleNFTContract,
					SimpleNFTABI,
					signer
				);

				console.log("Going to pop wallet now to pay gas...");
				const gasLimit = 300000; // ガス制限の値を適切に設定
				
				console.log("NFT minting...");
				let transaction = await connectedContract.mint(address);

				const filter = connectedContract.filters.CurrentId();
				connectedContract.on(filter, msgCatch);

				await transaction.wait();

				console.log(`NFT minted: https://goerli.etherscan.io/tx/${transaction.hash}`);
				alert(`NFT minted: https://goerli.etherscan.io/tx/${transaction.hash}`);
				
				
			} else {
				console.log("Ethereum object doesn't exist!");
				alert("error");
			}
		} catch (error) {
			console.log(error);
			alert(error);
		}
	}

	return (
		<div>
			<div className='pb-6'>
				<WalletConnect address={address} setAddress={setAddress}/>
				<div className='flex'>
					Connected Address: &nbsp;
					{!address && <p className='text-red-500'>wallet not connected</p>}
					{address && <p className='text-green-500'>{address}</p>}
				</div>
			</div>
			<div>
				<b>NFT minting page</b>
				<div className='flex'>
					<p>NFT addres: &nbsp;</p>
					<a href="https://goerli.etherscan.io/address/0xF0B03EC6d4ff843976A6cCa836E9a52A6ea96278" target="_blank" rel="noopener noreferrer" className="text-black no-underline hover:text-blue-500">
					0xF0B03EC6d4ff843976A6cCa836E9a52A6ea96278
					</a>
				</div>
			</div>
			<div className='pt-5'>
				<b>You get tokenId:  &nbsp;</b>
				{getId && getId}
			</div>
			<div className='pt-8'>
				<button onClick={mint} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
				MINT
				</button>
			</div>
				<Footer />
		</div>
	);
};

