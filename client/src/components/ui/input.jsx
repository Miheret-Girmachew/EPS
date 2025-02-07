// components/ui/input.js
import React from 'react';

export const Input = ({ placeholder, value, onChange, className }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
};
