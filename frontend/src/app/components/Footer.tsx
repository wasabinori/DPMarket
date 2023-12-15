import Link from 'next/link'

export default function Footer () {
	return (
		<div className='p-4 border-t-2 border-[#b49c94] w-full mt-10 bg-[#f5ecdb] sticky bottom-0'>
			<div className='flex'>
				<Link href="/TBARegistry">
					<b className='pr-4'>TBARegistry</b>
				</Link>
				<Link href="/DPMarket/Buy">
					<b className='pr-4'>Buy</b>
				</Link>
				<Link href="/DPMarket/List">
					<b className='pr-4'>List</b>
				</Link>
				<Link href="/DPMarket/Mint">
					<b className='pr-4'>Mint</b>
				</Link>
			</div>
		</div>
	)
}