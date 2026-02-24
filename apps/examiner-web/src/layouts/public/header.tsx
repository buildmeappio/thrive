import Image from '@/components/Image';

const Header = () => {
  return (
    <header className="bg-white">
      {/* fixed 120px header to match design */}
      <div className="mx-auto flex w-full max-w-none items-center justify-center p-2">
        <Image
          src={`https://assets.thriveassessmentcare.com/images/thriveLogo.png`}
          alt="Thrive Assessment & Care"
          width={240}
          height={75}
          className="h-18 w-auto"
          priority
        />
      </div>
    </header>
  );
};

export default Header;
