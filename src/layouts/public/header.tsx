import Image from "@/components/Image";

const Header = () => {
  return (
    <header className="bg-white">
      {/* fixed 120px header to match design */}
      <div className="mx-auto flex w-full max-w-none items-center justify-center p-3">
        <Image
          src={`${process.env.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`}
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
