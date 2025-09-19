// components/FieldRow.tsx
type FieldRowProps = {
  label: string;
  value: React.ReactNode;
  valueHref?: string;
  type: "text" | "document" | "link";
};

const FieldRow = ({ label, value, valueHref, type }: FieldRowProps) => (
  <div className="flex flex-col sm:flex-row justify-between sm:items-center w-full rounded-lg bg-[#F6F6F6] px-3 sm:px-4 py-2 gap-1.5 sm:gap-2">
    <span className="shrink-0 font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-none tracking-[-0.03em] text-[#4E4E4E]">
      {label}
    </span>

    <div className="min-w-0 sm:max-w-[75%] text-left sm:text-right">
      {type === "link" ? (
        <a
          href={valueHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-tight tracking-[-0.03em] text-[#000080] underline break-words"
        >
          {value as string}
        </a>
      ) : type === "document" ? (
        <div className="flex items-center justify-start sm:justify-end gap-3">
          <button className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-none text-[#4E4E4E] underline">
            Preview
          </button>
          <button className="font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-none text-[#000080] underline">
            Download
          </button>
        </div>
      ) : (
        <span className="block font-[400] font-[Poppins] text-[14px] sm:text-[16px] leading-tight tracking-[-0.03em] text-[#000080] break-words">
          {value ?? "-"}
        </span>
      )}
    </div>
  </div>
);

export default FieldRow;
