import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isLoading = false,
  icon,
  disabled,
  ...props
}) {
  const mergedClass = clsx(
    'btn-base inline-flex items-center justify-center transition-colors rounded-lg font-medium',
    {
      'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
      'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
      'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'ghost',
      'h-8 px-3 text-sm': size === 'sm',
      'h-10 px-4': size === 'md',
      'h-12 px-6 text-lg': size === 'lg',
      'opacity-50 cursor-not-allowed': disabled || isLoading,
    },
    className
  );

  return (
    <button
      className={mergedClass}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
