import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

export function PasswordInput({
  className,
  value,
  onChange,
  ...props
}: React.ComponentProps<'input'>) {
  const [show, setShow] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || '');

  // Sync internal state with prop value
  React.useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const hasValue = typeof inputValue === 'string' && inputValue.length > 0;

  return (
    <div className="relative w-full">
      <Input
        type={show ? 'text' : 'password'}
        className={cn('pr-10', className)}
        value={inputValue}
        onChange={handleChange}
        {...props}
      />
      {hasValue && (
        <button
          type="button"
          onClick={() => setShow(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer focus:outline-none"
          tabIndex={-1}
        >
          {show ? <EyeOff size={20} color="#9EA9AA" /> : <Eye size={20} color="#9EA9AA" />}
        </button>
      )}
    </div>
  );
}
