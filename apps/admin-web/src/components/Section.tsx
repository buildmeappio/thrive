// components/Section.tsx
type SectionProps = {
  title: string;
  children: React.ReactNode;
  isEditable?: boolean;
  actionSlot?: React.ReactNode;
};

const Section = ({ title, children, isEditable, actionSlot }: SectionProps) => (
  <div className="flex w-full flex-col items-start gap-2">
    <div className="flex w-full items-center justify-between gap-2 pb-2 sm:pb-4">
      <h3 className="font-degular text-[20px] font-semibold leading-none tracking-[-0.03em] text-black sm:text-[24px]">
        {title}
      </h3>
      {actionSlot ??
        (isEditable && (
          <button className="font-poppins rounded-full px-3 py-2 text-[14px] leading-none text-[#707070] underline sm:px-4 sm:text-[16px]">
            Edit
          </button>
        ))}
    </div>
    <div className="flex w-full flex-col gap-2">{children}</div>
  </div>
);

export default Section;
