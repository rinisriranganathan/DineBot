
import React from 'react';
import { MenuItem } from '../types';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

interface MenuItemCardProps {
  item: MenuItem;
  reason?: string; 
  onAddItem: (item: MenuItem) => void; // Re-introduced for adding item to cart
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, reason, onAddItem }) => {
  const pieceDisplay = item.pieces ? ` (${item.pieces} pc${item.pieces > 1 ? 's' : ''})` : '';
  
  const handleAddItemClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent any parent click handlers
    onAddItem(item);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-row items-center p-3 space-x-3 w-full border border-[#BBD69D]/80 hover:shadow-lg transition-shadow duration-200">
      <img 
        src={item.image} 
        alt={item.name} 
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border border-[#BBD69D]/50 flex-shrink-0"
        onError={(e) => (e.currentTarget.src = 'https://picsum.photos/100/100?grayscale')}
      />
      <div className="flex-grow min-w-0">
        <h3 className="text-sm sm:text-md font-semibold text-[#1E2229] truncate">{item.name}{pieceDisplay}</h3>
        <p className="text-xs sm:text-sm font-bold text-[#EDB403]">₹{item.price}</p>

        {reason && (
          <p className="text-xs text-[#475424] mt-1 italic line-clamp-2">{reason}</p>
        )}
      </div>
      <button
        onClick={handleAddItemClick}
        className="ml-auto flex-shrink-0 bg-[#EDB403] text-[#1E2229] hover:bg-[#c9a002] focus:outline-none focus:ring-2 focus:ring-[#475424] focus:ring-opacity-75 font-semibold py-1.5 px-3 rounded-md text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-150 flex items-center space-x-1"
        aria-label={`Add ${item.name} to cart`}
      >
        <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Add</span>
      </button>
    </div>
  );
};
