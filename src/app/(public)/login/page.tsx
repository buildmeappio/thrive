import Image from '@/components/Image';
	import { LoginForm } from '@/domains/auth';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Login | Thrive Examiner',
	description: 'Login to your account',
};

const Page = () => {
	return (
		<div className="bg-[#F2F5F6]">
			<div className="flex min-h-screen flex-col justify-between md:flex-row">
				<div className="flex flex-1 flex-col justify-center px-6 md:px-0 md:pl-30">
					<h1 className="mb-4 text-center text-3xl font-bold md:text-left md:text-[44px]">
						Welcome To <span className="text-[#00A8FF]">Thrive</span>{' '}
					</h1>
					<div className="w-full rounded-xl border-[#E9EDEE] bg-white p-6 shadow-xs md:w-[445px]">
						<h2 className="mb-6 text-[30px] font-semibold">Log In</h2>
						<LoginForm />
					</div>
				</div>
				<div className="pl- relative hidden flex-1 overflow-hidden md:block">
					<div className="absolute inset-0">
						<Image src="https://public-thrive-assets.s3.eu-north-1.amazonaws.com/examiner-home.png" alt="Admin Dashboard Preview" fill />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Page;
