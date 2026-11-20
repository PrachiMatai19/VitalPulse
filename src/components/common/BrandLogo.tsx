import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark';
  subtitle?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'light',
  subtitle = 'Emergency Blood Network',
  className = '',
}) => {
  const titleSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  const subtitleSizes = {
    xs: 'text-[9px]',
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  if (!showText) return null;

  return (
    <div className={`flex flex-col text-left leading-tight select-none ${className}`}>
      <div className={`font-black tracking-tight flex items-center ${titleSizes}`}>
        <span className={variant === 'dark' ? 'text-white' : 'text-slate-900'}>
          Vital
        </span>
        <span className="text-red-600 ml-0.5">Pulse</span>
      </div>
      {subtitle && (
        <span
          className={`uppercase tracking-wider font-bold ${subtitleSizes} ${
            variant === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
};
