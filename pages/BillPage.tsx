
import React from 'react';
import { OrderItem, MenuItem } from '../types';
import { GST_RATE } from '../constants'; // Import GST_RATE
import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebase'; // adjust path if needed


interface BillPageProps {
  orderData: {
    items: OrderItem[];
    subtotal: string;
    gstAmount: string;
    grandTotal: string;
    tableNumber: string; 
  };
  onConfirmAndProceed: () => void;
  navigateToChat: () => void;
  getItemNameWithPieces: (item: OrderItem) => string; // Expects function that includes customization
}

const BillPage: React.FC<BillPageProps> = ({ orderData, onConfirmAndProceed, navigateToChat, getItemNameWithPieces }) => {
  const { items, subtotal, gstAmount, grandTotal, tableNumber } = orderData;
  const currentDate = new Date();

  const parsePrice = (price: string | number): number => {
  if (typeof price === "number") return price;
  if (typeof price === "string") return parseFloat(price.replace("₹", "").trim());
  return 0; // fallback if price is undefined or invalid
};

  const formatPrice = (priceNumber: number): string => `₹${priceNumber.toFixed(2)}`;
  const handleConfirmOrder = async () => {
  const parsedItems = items.map(item => ({
    id: item.id,
    name: getItemNameWithPieces(item), // includes customization details
    quantity: item.quantity,
    price: item.price,
    customizationNotes: item.customizationNotes || '',
  }));
  const calculatedSubtotal = parsedItems.reduce((sum, item) => {
    return sum + item.quantity * parsePrice(item.price);
  }, 0);

  const calculatedGst = calculatedSubtotal * GST_RATE;
  const calculatedGrandTotal = calculatedSubtotal + calculatedGst;

  const bill = {
    items: parsedItems,
    subtotal: Number(calculatedSubtotal.toFixed(2)),
    gstAmount: Number(calculatedGst.toFixed(2)),
    grandTotal: Number(calculatedGrandTotal.toFixed(2)),
    tableNumber,
    timestamp: new Date().toISOString(),
    status: "pending"
  };

  try {
    await addDoc(collection(db, "bills"), bill);
    alert("✅ Order sent to kitchen!");
    onConfirmAndProceed(); // Continue to final page
  } catch (error) {
    console.error("❌ Error sending bill:", error);
    alert("Failed to send the bill to the kitchen.");
  }
};


  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-[#BBD69D] flex flex-col">
      <div className="text-center mb-6 sm:mb-8">
        <h1 
            className="font-['Pacifico'] text-3xl sm:text-4xl text-[#475424] cursor-pointer"
            onClick={navigateToChat} 
            aria-label="Fire & Froast Restaurant Title, click to go to chat"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && navigateToChat()}
        >
            Fire & Froast
        </h1>
        <p className="text-lg sm:text-xl font-semibold text-[#1E2229] mt-1">Order Snap</p>
        <p className="text-xs sm:text-sm text-[#475424]/80 mt-1">
          Date: {currentDate.toLocaleDateString()} | Time: {currentDate.toLocaleTimeString()}
        </p>
      
      </div>

      <div className="mb-6 flex-grow">
        <h2 className="text-lg font-semibold text-[#475424] border-b border-[#BBD69D] pb-2 mb-3">Order Details:</h2>
        {items.length > 0 ? (
          <table className="w-full text-sm text-left text-[#1E2229]">
            <thead className="text-xs text-[#475424] uppercase bg-[#F5F0E5]">
              <tr>
                <th scope="col" className="py-2 px-3">Item</th>
                <th scope="col" className="py-2 px-3 text-center">Qty</th>
                <th scope="col" className="py-2 px-3 text-right">Unit Price</th>
                <th scope="col" className="py-2 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id + (item.customizationNotes || '')} className="border-b border-[#BBD69D]/50 hover:bg-[#F5F0E5]/50"> {/* Ensure key is unique for customized items */}
                  {/* Use getItemNameWithPieces to display name with customizations */}
                  <td className="py-2 px-3 font-medium whitespace-normal break-words">{getItemNameWithPieces(item)}</td>
                  <td className="py-2 px-3 text-center">{item.quantity}</td>
                  <td className="py-2 px-3 text-right">{formatPrice(parsePrice(item.price))}</td>
                  <td className="py-2 px-3 text-right font-semibold">{formatPrice(parsePrice(item.price) * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-[#1E2229]">No items in this order.</p>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[#BBD69D]">
          <div className="flex justify-end items-center mb-1">
            <span className="text-md text-[#1E2229] mr-2">Subtotal:</span>
            <span className="text-md font-semibold text-[#1E2229]">{subtotal}</span>
          </div>
          <div className="flex justify-end items-center mb-2">
            <span className="text-md text-[#1E2229] mr-2">GST ({(GST_RATE * 100).toFixed(0)}%):</span>
            <span className="text-md font-semibold text-[#1E2229]">{gstAmount}</span>
          </div>
          <div className="flex justify-end items-center mt-2 pt-2 border-t border-[#BBD69D]/50">
            <span className="text-lg font-bold text-[#475424] mr-2">Grand Total:</span>
            <span className="text-lg font-bold text-[#475424]">{grandTotal}</span>
          </div>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-[#BBD69D]/30">
        <div className="flex justify-between items-center"> 
            <button
              onClick={navigateToChat}
              className="flex items-center text-[#475424] hover:text-[#EDB403] focus:outline-none focus:text-[#EDB403] transition-colors duration-150 group py-2 px-1"
              aria-label="Go back to chat to modify order"
            >
              <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-0.5 transition-transform duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              <span className="font-semibold text-sm">Back to Chat</span>
            </button>
            <button
              onClick={handleConfirmOrder}
              className="bg-[#EDB403] text-[#1E2229] font-semibold py-2 px-3 sm:px-4 rounded-lg hover:bg-[#c9a002] focus:outline-none focus:ring-2 focus:ring-[#475424] focus:ring-opacity-75 transition-colors duration-150 text-sm"
              aria-label="Confirm order and proceed"
              disabled={items.length === 0}
            >
              Confirm Order
            </button>
        </div>
      </div>
    </div>
  );
};

export default BillPage;