// components/InputField.tsx
'use client';
import { FiAlertCircle } from 'react-icons/fi';

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type,
  icon,
  value,
  onChange,
  required,
}) => {
  return (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
          placeholder={label}
        />
      </div>
    </div>
  );
};

export default InputField;
