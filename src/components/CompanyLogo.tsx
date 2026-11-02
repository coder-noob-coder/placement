'use client';

import React, { useState } from 'react';
import { getCompanyLogoUrl, getCompanyInitials } from '@/lib/companyLogos';

interface CompanyLogoProps {
  company: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  company,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getCompanyLogoUrl(company);
  const initials = getCompanyInitials(company);

  const sizeClasses = {
    sm: 'w-9 h-9 rounded-xl text-xs',
    md: 'w-13 h-13 sm:w-14 sm:h-14 rounded-2xl text-base sm:text-lg',
    lg: 'w-16 h-16 rounded-2xl text-xl',
  }[size];

  return (
    <div
      className={`${sizeClasses} bg-white shadow-sm flex items-center justify-center p-1.5 shrink-0 overflow-hidden ${className}`}
    >
      {logoUrl && !imgError ? (
        <img
          src={logoUrl}
          alt={company}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span className="text-[#0c141f] font-black tracking-tight select-none">
          {initials}
        </span>
      )}
    </div>
  );
};
