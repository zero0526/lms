import React from 'react';
import { clsx } from 'clsx';

export default function Card({ children, className, title }) {
  return (
    <div className={clsx('bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden p-6', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
          {title}
        </h3>
      )}
      <div>{children}</div>
    </div>
  );
}
