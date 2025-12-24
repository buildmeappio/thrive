import { AlertTriangle } from "lucide-react";

type WarningBannerProps = {
    message?: string;
};

export default function WarningBanner({
    message = "Changes affect future contracts; existing contracts are unaffected.",
}: WarningBannerProps) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-poppins">
                {message}
            </p>
        </div>
    );
}

