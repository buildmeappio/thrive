import { AlertTriangle } from 'lucide-react';

type WarningBannerProps = {
  message?: string;
};

export default function WarningBanner({
  message = 'Changes affect future contracts; existing contracts are unaffected.',
}: WarningBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-[14px] border border-amber-200 bg-amber-50 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
      <p className="font-poppins text-sm text-amber-800">{message}</p>
    </div>
  );
}
