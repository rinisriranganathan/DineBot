
import React from 'react';
import { OrderItem } from '../types';
import { TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

interface LiveOrderSummaryProps {
  orderItems: OrderItem[];
  isLoading: boolean;
  onUpdateQuantity: (itemId: string, newQuantity: number, itemCustomizationNotes?: string) => void;
  onRemoveItem: (itemId:string, itemCustomizationNotes?: string) => void;
  onPlaceOrder: () => void; 
  parsePrice: (priceString: string) => number;
  formatPrice: (priceNumber: number | string) => string; 
  calculateOrderTotal: (orderItems: OrderItem[]) => string;
  getItemNameWithPieces: (item: OrderItem) => string; // Expects the updated function from App.tsx
}

export const LiveOrderSummary: React.FC<LiveOrderSummaryProps> = ({
  orderItems,
  isLoading,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  parsePrice,
  formatPrice,
  calculateOrderTotal,
  getItemNameWithPieces // Use the prop
}) => {
  const grandTotalString = calculateOrderTotal(orderItems);
  const subtotalString = grandTotalString; 

  // getItemNameWithPieces is now passed as a prop and used directly

  return (
    <div className="bg-white rounded-xl shadow-xl border border-[#BBD69D] flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-[#BBD69D]">
        <h2 className="text-lg font-semibold text-[#475424] flex items-center">
          <ShoppingCartIcon className="h-5 w-5 mr-2 text-[#EDB403]" />
          Your Culinary Cart
        </h2>
      </div>

      {orderItems.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <ShoppingCartIcon className="h-12 w-12 text-[#BBD69D] mb-3" />
          <p className="text-md font-medium text-[#475424]">Your cart is empty.</p>
          <p className="text-xs text-[#1E2229]/80">Let's add some delicious food!</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto p-1 md:p-2" style={{maxHeight: 'calc(100vh - 280px)'}}>
          <ul className="divide-y divide-[#BBD69D]/50">
            {orderItems.map(item => (
              <li key={item.id + (item.customizationNotes || '')} className="py-2 px-1 flex items-center space-x-2"> {/* Ensure key is unique for customized items */}
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-md object-cover border border-[#BBD69D]/50"
                  onError={(e) => (e.currentTarget.src = 'https://picsum.photos/100/100?grayscale')}
                />
                <div className="flex-grow min-w-0">
                  {/* Use getItemNameWithPieces prop to display name with customizations */}
                  <h3 className="text-xs sm:text-sm font-semibold text-[#475424] break-words"> 
                    {getItemNameWithPieces(item)}
                  </h3>
                  <p className="text-xs text-[#1E2229]">{formatPrice(parsePrice(item.price))}</p>
                  <div className="flex items-center mt-1 space-x-1">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.customizationNotes)}
                      disabled={isLoading || item.quantity <= 0}
                      className="bg-[#475424] text-[#BBD69D] hover:bg-[#353f1c] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded transition-colors disabled:opacity-50"
                      aria-label={`Decrease quantity of ${getItemNameWithPieces(item)}`}
                    >
                      -
                    </button>
                    <span className="text-[#1E2229] font-medium w-4 text-center text-xs sm:text-sm">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.customizationNotes)}
                      disabled={isLoading}
                      className="bg-[#475424] text-[#BBD69D] hover:bg-[#353f1c] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded transition-colors disabled:opacity-50"
                      aria-label={`Increase quantity of ${getItemNameWithPieces(item)}`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                    <p className="text-xs sm:text-sm font-semibold text-[#EDB403] whitespace-nowrap">
                        {formatPrice(parsePrice(item.price) * item.quantity)}
                    </p>
                    <button
                        onClick={() => onRemoveItem(item.id, item.customizationNotes)}
                        disabled={isLoading}
                        className="text-[#475424]/70 hover:text-[#475424] disabled:opacity-50 mt-0.5"
                        aria-label={`Remove ${getItemNameWithPieces(item)} from cart`}
                    >
                        <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {orderItems.length > 0 && (
        <div className="p-3 border-t border-[#BBD69D] bg-[#F5F0E5]/50">
          <div className="space-y-1 text-xs mb-2">
            <div className="flex justify-between text-[#1E2229]">
              <span>Subtotal:</span>
              <span>{subtotalString}</span>
            </div>
            <div className="flex justify-between font-bold text-[#475424] text-sm pt-1 border-t border-[#BBD69D]/50">
              <span>Grand Total:</span>
              <span>{grandTotalString}</span>
            </div>
          </div>
          <button
            onClick={onPlaceOrder} 
            disabled={isLoading || orderItems.length === 0}
            className="w-full bg-[#EDB403] text-[#1E2229] font-semibold py-2 px-3 rounded-lg hover:bg-[#c9a002] focus:outline-none focus:ring-2 focus:ring-[#475424] focus:ring-opacity-75 transition-colors duration-150 text-sm disabled:bg-[#BBD69D]/70 disabled:text-[#475424]/70 disabled:cursor-not-allowed"
            aria-label="View your bill"
          >
            {isLoading ? 'Processing...' : 'View Bill'}
          </button>
        </div>
      )}
    </div>
  );
};