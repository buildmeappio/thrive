type DetailRowProps = {
  label: string;
  value: string | null | undefined;
  valueClassName?: string;
};

export default function DetailRow({
  label,
  value,
  valueClassName = "text-sm text-[#00A8FF] font-poppins font-medium",
}: DetailRowProps) {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-[#F9F9F9] rounded-lg">
      <span className="text-sm text-[#5B5B5B] font-poppins">{label}</span>
      <span className={`${valueClassName} text-right max-w-[60%]`}>
        {value}
      </span>
    </div>
  );
}
