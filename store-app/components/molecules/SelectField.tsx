import React from "react";
import { Label } from "../atoms";

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  id,
  options,
  error,
  required,
  className = "",
  ...selectProps
}) => {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <select
        id={id}
        required={required}
        className={`block w-full rounded-lg border px-3.5 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-zinc-100 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-500"
        } ${className}`}
        {...selectProps}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
