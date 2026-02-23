import { Calendar, Clock, AlertCircle } from 'lucide-react';

export const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'outline':
        return 'bg-transparent text-gray-700 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getVariantStyles()}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          bg: 'bg-gradient-to-r from-amber-50 to-yellow-100',
          text: 'text-amber-800',
          border: 'border-amber-200',
          icon: <Clock className="h-3 w-3" />,
        };
      case 'scheduled':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: <Calendar className="h-3 w-3" />,
        };
      case 'completed':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: <span className="h-3 w-3 rounded-full bg-green-500" />,
        };
      case 'cancelled':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: <AlertCircle className="h-3 w-3" />,
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-slate-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: <span className="h-3 w-3 rounded-full bg-gray-400" />,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.border} shadow-sm`}
    >
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const PriorityBadge = ({ priority }: { priority: string }) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-600',
          text: 'text-white',
          border: 'border-red-500',
          pulse: 'animate-pulse',
        };
      case 'medium':
        return {
          bg: 'bg-gradient-to-r from-orange-400 to-amber-500',
          text: 'text-white',
          border: 'border-orange-400',
          pulse: '',
        };
      case 'low':
        return {
          bg: 'bg-gradient-to-r from-green-400 to-emerald-500',
          text: 'text-white',
          border: 'border-green-400',
          pulse: '',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-400 to-slate-500',
          text: 'text-white',
          border: 'border-gray-400',
          pulse: '',
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold shadow-sm ${config.bg} ${config.text} ${config.border} ${config.pulse}`}
    >
      {priority.toUpperCase()}
    </span>
  );
};

export const RejectedBadge = () => {
  return (
    <div
      className="inline-flex items-center rounded-full p-[1px]"
      style={{
        background: 'linear-gradient(to right, #BFDBFE, #DCFCE7)',
      }}
    >
      <span className="rounded-full bg-gradient-to-r from-red-50 to-rose-100 px-6 py-2 text-sm font-medium text-red-800">
        Rejected
      </span>
    </div>
  );
};

export const CaseStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (statusName: string) => {
    const normalizedStatus = statusName.toLowerCase();

    if (normalizedStatus.includes('rejected')) {
      return {
        bg: 'bg-gradient-to-r from-red-50 to-rose-100',
        text: 'text-red-800',
        label: 'Rejected',
      };
    }

    if (normalizedStatus.includes('pending')) {
      return {
        bg: 'bg-gradient-to-r from-slate-50 to-gray-100',
        text: 'text-slate-700',
        label: 'Pending',
      };
    }

    if (normalizedStatus.includes('ready to appointment') || normalizedStatus.includes('ready')) {
      return {
        bg: 'bg-gradient-to-r from-green-50 to-emerald-100',
        text: 'text-green-800',
        label: 'Ready to Appointment',
      };
    }

    if (
      normalizedStatus.includes('waiting to be scheduled') ||
      normalizedStatus.includes('waiting')
    ) {
      return {
        bg: 'bg-gradient-to-r from-blue-50 to-indigo-100',
        text: 'text-blue-800',
        label: 'Waiting to be Scheduled',
      };
    }

    if (
      normalizedStatus.includes('more information') ||
      normalizedStatus.includes('info required')
    ) {
      return {
        bg: 'bg-gradient-to-r from-purple-50 to-violet-100',
        text: 'text-purple-700',
        label: 'More Information required',
      };
    }

    // Default fallback
    return {
      bg: 'bg-gradient-to-r from-gray-50 to-slate-100',
      text: 'text-gray-800',
      label: statusName,
    };
  };

  const config = getStatusConfig(status);

  return (
    <div
      className="inline-flex items-center rounded-full p-[1px]"
      style={{
        background: 'linear-gradient(to right, #BFDBFE, #DCFCE7)',
      }}
    >
      <span className={`rounded-full ${config.bg} px-6 py-2 text-sm font-medium ${config.text}`}>
        {config.label}
      </span>
    </div>
  );
};
