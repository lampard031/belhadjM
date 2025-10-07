import React from 'react';

const Logo = ({ size = 'medium', showWebsite = false, className = '', isMobile = false }) => {
  const logoUrl = "https://customer-assets.emergentagent.com/job_ca55c247-2278-4b42-b154-ffae26a79ca9/artifacts/o662dkxv_Untitled%20%28150%20x%2075%20px%29%20%281%29.png";
  
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-14', 
    large: 'h-20',
    xl: 'h-24',
    xxl: 'h-32'
  };

  return (
    <div className={`flex items-center ${isMobile ? 'justify-center' : 'justify-start'} space-x-3 ${className}`}>
      <img 
        src={logoUrl} 
        alt="FTC Auto Móveis Logo" 
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