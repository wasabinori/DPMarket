"use client"

import { ethers } from "ethers";

export default function WalletConnect ({address, setAddress} :any ): any {

	const connectToMetamask = async () => {
		if (typeof (window as any).ethereum !== 'undefined') {
			try {
				// Metamaskの接続リクエスト
				await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
				const provider = new ethers.providers.Web3Provider((window as any).ethereum);
				const signer = provider.getSigner();
				
				// 接続されたアカウントの情報を取得
				const address = await signer.getAddress();
				setAddress(address);
				console.log('Connected address:', address);
			} catch (error) {
				console.error('Failed to connect to Metamask:', error);
			}
		} else {
			console.error('Metamask not detected');
		}
	}

	return(
		<div>
			<div className="max-w-6xl mx-auto OutermostBox sticky  justify-between shadow-lg px-2 py-2">
				<div className="flex flex-row gap-x-5 gap-y-20">
					<h1 className='font-sans font-medium text-5xl'>ERC6551DMarket</h1>
					<button 
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
					onClick={connectToMetamask}
					>
					connect wallet
					</button>
				</div>
			</div>
		</div>
	);
}