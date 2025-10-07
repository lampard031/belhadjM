import React from 'react';

const Logo = ({ size = 'medium', showWebsite = true, className = '' }) => {
  const logoUrl = "https://customer-assets.emergentagent.com/job_ca55c247-2278-4b42-b154-ffae26a79ca9/artifacts/m2zg5720_WhatsApp%20Image%202025-10-07%20at%2011.59.34_62f9fb2d.jpg";
  
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12', 
    large: 'h-16',
    xl: 'h-20'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src={logoUrl} 
        alt="FTC Automóveis Logo" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      {showWebsite && (
        <div className="hidden sm:block">
          <p className="text-xs opacity-75">www.ftcautomoveis.com</p>
        </div>
      )}
    </div>
  );
};

export default Logo;