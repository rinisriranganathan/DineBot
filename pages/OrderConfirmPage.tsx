
import React from 'react';
import { OrderItem, MenuItem } from '../types'; 

interface BillDataType { 
  items: OrderItem[];
  subtotal: string;
  gstAmount: string;
  grandTotal: string;
  tableNumber: string;
}

interface FinalConfirmationPageProps {
  orderData: BillDataType | null; 
  onStartNewOrder: () => void; 
  getItemNameWithPieces: (item: OrderItem) => string; // Expects function that includes customization
}

const OrderConfirmPage: React.FC<FinalConfirmationPageProps> = ({ orderData, onStartNewOrder, getItemNameWithPieces }) => {
  
  const parsePrice = (price: string | number): number => {
  if (typeof price === "number") return price;
  if (typeof price === "string") return parseFloat(price.replace("₹", "").trim());
  return 0; // fallback if price is undefined or invalid
};

  const formatPrice = (priceNumber: number): string => `₹${priceNumber.toFixed(2)}`;

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 h-full">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl border border-[#BBD69D] max-w-lg w-full">
        <svg 
          className="w-16 h-16 md:w-20 md:h-20 text-[#EDB403] mx-auto mb-6 animate-pulse" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-3xl md:text-4xl font-bold text-[#475424] mb-4">
          Order Successful!
        </h2>
        <p className="text-md md:text-lg text-[#1E2229] mb-6">
          Thank you for choosing Fire & Froast! Your order has been placed and a bill has been downloaded.
        </p>
        
        {orderData && orderData.items.length > 0 && (
          <div className="text-left my-6 p-4 border border-[#BBD69D]/50 rounded-lg bg-[#F5F0E5]/50 max-h-48 overflow-y-auto">
            <h3 className="text-md font-semibold text-[#475424] mb-2">Your Order Summary:</h3>
            <ul className="text-xs space-y-1">
              {orderData.items.map(item => (
                <li key={item.id + (item.customizationNotes || '')} className="flex justify-between"> {/* Ensure key is unique */}
                  {/* Use getItemNameWithPieces to display name with customizations */}
                  <span className="whitespace-normal break-words pr-2">{getItemNameWithPieces(item)} (Qty: {item.quantity})</span>
                  <span>{formatPrice(parsePrice(item.price) * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm font-bold text-[#475424] mt-3 pt-2 border-t border-[#BBD69D]/70 flex justify-between">
              <span>Grand Total:</span>
              <span>{orderData.grandTotal}</span>
            </p>
          </div>
        )}

        <p className="text-md md:text-lg text-[#1E2229] mb-8">
          We hope you enjoy your meal!
        </p>

        <button
          onClick={onStartNewOrder}
          className="bg-[#EDB403] text-[#1E2229] font-semibold py-3 px-8 rounded-lg hover:bg-[#c9a002] focus:outline-none focus:ring-2 focus:ring-[#475424] focus:ring-opacity-75 transition-colors duration-150 text-lg"
          aria-label="Start a new order"
        >
          Start New Order
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmPage;