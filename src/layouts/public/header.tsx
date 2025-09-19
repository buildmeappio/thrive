import Image from "@/components/Image";

const Header = () => {
  return (
    <header className="bg-white">
      {/* fixed 120px header to match design */}
      <div className="mx-auto flex h-[120px] w-full max-w-none items-center justify-center px-4">
        <Image
          src="https://public-thrive-assets.s3.eu-north-1.amazonaws.com/thriveLogo.png"
          alt="Thrive Assessment & Care"
          width={240}
          height={80}
          className="h-20 w-auto"
          priority
        />
      </div>
    </header>
  );
};

export default Header;
