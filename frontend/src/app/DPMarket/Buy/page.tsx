"use client"

import WalletConnect from '../../components/WalletConnect';
import Footer from '@/app/components/Footer';
import DPMarketABI from "../../ABIs/DPMarketABI.json"
import { useState, useEffect } from "react";
import { ethers } from "ethers";

import dotenv from 'dotenv';
dotenv.config();

export default function Home() {
	const [address, setAddress] = useState('');
	
	const MarketContract = "0x24AA6a4a73d9754e6859E721a1185E04aAB2C53f";
	const [sendValu, setSendValue] = useState();
	const [listNFTs, setListNFTs] = useState<any[] | undefined>();
	const [showPrice, setShowPrice] = useState<number>();
	const [shownftAddress, setShownftAddress] = useState("");
	const [showTokenId, setShowTokenId] = useState<number>();
	

	const handleSetSendValue = ({ target }: any) => {
		setSendValue(target.value);
	};

	const handleCalcPrice = (item: any, index: number) => {
		calcPrice(item.nftAddress, item.tokenId);
	};

	const handleBuyItem = (item: any, index: number) => {
		buyItem(item.nftAddress, item.tokenId, sendValu);
	};

	useEffect(() => {
		getListings();

		const storedAddress = sessionStorage.getItem('shownftAddress');
		const storedTokenId = sessionStorage.getItem('showtokenId');
		const storedPrice = sessionStorage.getItem('showPrice');
		if (storedAddress || storedTokenId || storedPrice) {
			setShownftAddress(storedAddress ?? "");
			setShowTokenId(Number(storedTokenId));
			setShowPrice(Number(storedPrice));
		}
	}, []);

	const getListings = async () => {
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

			const itemInfo: any[] = await connectedContract.getAllListings();

			console.log("Get NFT lists: ", itemInfo);
			setListNFTs(itemInfo);
			} else {
				console.log("Ethereum object doesn't exist!");
				alert("error");
			}
		} catch (error) {
			console.log(error);
			alert(error);
		}
	}

	

	const msgCatch = async (_from: any, _msg: any, event: any) => {
		console.log("event object:", parseInt(event));
		setShowPrice(parseInt(event) / 1e18);
		sessionStorage.setItem('showPrice', (parseInt(event) / 1e18).toString());

		console.log("event _from:", _from);
		setShownftAddress(_from);
		sessionStorage.setItem('shownftAddress', _from);

		console.log("event _msg:", parseInt(_msg._hex));
		setShowTokenId(parseInt(_msg._hex));
		sessionStorage.setItem('showtokenId', parseInt(_msg._hex).toString())
	}

	const calcPrice = async (nftAddress: any, tokenId: any) => {
		console.log("Args are:", nftAddress, parseInt(tokenId, 16));
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
			const gasLimit = 3000000; // ガス制限の値を適切に設定
			let transaction: any = await connectedContract.calcPrice(nftAddress, tokenId, { gasLimit });
			console.log("Calculating... please wait.");

			const filter = connectedContract.filters.PriceUpadate();
			connectedContract.on(filter, msgCatch);

			// const eventListener = contract.on('PriceUpdate', (nftAddress, tokenId, newPrice, event) => {
			// 	setPrice(newPrice.toNumber());
			// });

			await transaction.wait();

			// const event = connectedContract.on("PriceUpadate", () => {
			// 	console.log("Event Data:", event.args);
			// })


			console.log(`Calculated, see transaction: https://goerli.etherscan.io/tx/${transaction.hash}`);
				alert(`Calculated, `);
			} else {
				console.log("Ethereum object doesn't exist!");
				alert("error");
			}
		} catch (error) {
			console.log(error);
		}
	}

	const buyItem = async (nftAddress: any, tokenId: any, sendValue: any) => {

		// console.log("Args are:", nftAddress, parseInt(tokenId, 16));
		if (sendValue <= 0 || isNaN(sendValue)) {
			return alert("Payment amount is insufficient");
		}
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
			const gasLimit = 3000000; // ガス制限の値を適切に設定
			let transaction: any = await connectedContract.buyItem(nftAddress, tokenId, { value: ethers.utils.parseEther(sendValue), gasLimit });
			console.log("Buying... please wait.");
			await transaction.wait();

			const event = connectedContract.on("PriceUpadate", () => {
				console.log("Event Data:", event.args);
			})


			console.log(`Success, see transaction: https://goerli.etherscan.io/tx/${transaction.hash}`);
				alert(`Success, see transaction: https://goerli.etherscan.io/tx/${transaction.hash}`);
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
			<div className='pb-6'>
				<WalletConnect address={address} setAddress={setAddress}/>
				Connected Address: &nbsp;
				{!address && <p className='text-red-500'>wallet not connected</p>}
				{address && <p className='text-green-500'>{address}</p>}
			</div>
			<div className='p-4'>
			
				{shownftAddress && <p>Addrwss: {shownftAddress}</p>}
				{showTokenId && <p>tokenId: {showTokenId}</p>}
				{showPrice && <p>ETH: {showPrice}</p>}
			</div>

			<b className='p-4'>
				LIST ITEMS
			</b>
			<br/>
				<label className='p-4'>
				pay:
				<input onChange={handleSetSendValue} type="text" placeholder="Enter value" className='border-2' />
			</label>

			<div className='pt-2'>
				<div className='flex flex-col '>
					{listNFTs?.map((item, index) => (
						<div key={index} className='flex flex-row'>
							<p className='border-2 px-2'>NFT Address: {item.nftAddress} <br/>
							Token ID: {parseInt(item.tokenId._hex, 16)}</p>
							<div onClick={() => handleCalcPrice(item, index)} className='p-4 border-y-2 border-r-2'>
								<button className='px-2 bg-gray-300 rounded-md'>
									CALC
								</button>
							</div>
							<div className='p-4 border-y-2 border-r-2'>
								<button onClick={() => handleBuyItem(item, index)} className='px-3 bg-gray-300 rounded-md'>
									BUY
								</button>
							</div>
							
						</div>
					))}
				</div>
			</div>
				<Footer />
		</div>
	)
}
