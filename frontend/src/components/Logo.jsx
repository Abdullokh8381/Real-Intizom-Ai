import React from "react";

export default function Logo({ className = "", iconSize = 40, textClass = "text-2xl" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative bg-[#2DE064] flex items-center justify-center" 
        style={{ 
          width: iconSize, 
          height: iconSize, 
          borderRadius: iconSize * 0.3,
          boxShadow: '0 8px 24px -4px rgba(45, 224, 100, 0.5)'
        }}
      >
        <svg
          width={iconSize * 0.65}
          height={iconSize * 0.65}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="#0B132B" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="5.5" stroke="#0B132B" strokeWidth="2.5" />
          <circle cx="12" cy="12" r="1.5" fill="#0B132B" />
        </svg>
      </div>
      <span className={`font-extrabold tracking-tight ${textClass}`}>
        <span className="text-[#0B132B] dark:text-white">Intizom</span>
        <span className="text-[#2DE064]">AI</span>
      </span>
    </div>
  );
}
