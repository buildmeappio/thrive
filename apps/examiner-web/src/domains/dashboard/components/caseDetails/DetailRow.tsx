type DetailRowProps = {
  label: string;
  value: string | null | undefined;
  valueClassName?: string;
};

export default function DetailRow({
  label,
  value,
  valueClassName = 'text-sm text-[#00A8FF] font-poppins font-medium',
}: DetailRowProps) {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between rounded-lg bg-[#F9F9F9] px-4 py-3">
      <span className="font-poppins text-sm text-[#5B5B5B]">{label}</span>
      <span className={`${valueClassName} max-w-[60%] text-right`}>{value}</span>
    </div>
  );
}
