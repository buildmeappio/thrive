// components/Section.tsx
type SectionProps = {
  title: string;
  children: React.ReactNode;
  isEditable?: boolean;
};

const Section = ({ title, children, isEditable }: SectionProps) => (
  <div className="flex flex-col items-start gap-2 w-full">
    <div className="flex items-center gap-2 justify-between w-full">
      <h3 className="font-degular font-semibold text-[20px] sm:text-[24px] pb-2 sm:pb-4 leading-none tracking-[-0.03em] text-black">
        {title}
      </h3>
      {isEditable && (
        <button className="font-poppins text-[14px] sm:text-[16px] leading-none text-[#707070] px-3 sm:px-4 py-2 rounded-full underline">
          Edit
        </button>
      )}
    </div>
    <div className="flex flex-col gap-2 w-full">{children}</div>
  </div>
);

export default Section;
