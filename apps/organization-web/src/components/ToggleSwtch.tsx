type ToggleSwitchProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, disabled = false }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${enabled ? 'bg-[#000080]' : 'bg-gray-200'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    disabled={disabled}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

export default ToggleSwitch;
