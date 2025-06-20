import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#475424] text-[#BBD69D]/90 py-4 mt-auto"> {/* BG: Dark Olive Green, Text: Pale Green opacity */}
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs">
          &copy; {new Date().getFullYear()} Fire & Froast Restaurant. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Powered by Culinary Genie with Google Gemini API.
        </p>
      </div>
    </footer>
  );
};
