import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input: React.FC<InputProps> = ({
  hasError = false,
  className = "",
  ...props
}) => {
  return (
    <input
      className={`block w-full rounded-lg border px-3.5 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 transition-colors ${
        hasError
          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
          : "border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-500"
      } ${className}`}
      {...props}
    />
  );
};
