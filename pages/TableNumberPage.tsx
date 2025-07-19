
import React, { useState } from 'react';

interface TableNumberPageProps {
  onTableNumberSubmit: (tableNumber: string) => void;
}

const TableNumberPage: React.FC<TableNumberPageProps> = ({ onTableNumberSubmit }) => {
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(tableNumber);
    if (tableNumber.trim() === '' || isNaN(num) || num <= 0 || !Number.isInteger(num)) {
      setError('Please enter a valid whole table number.');
      return;
    }
    setError('');
    onTableNumberSubmit(tableNumber.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="bg-white/80 backdrop-blur-sm p-8 sm:p-10 rounded-xl shadow-2xl border border-[#EDB403]/50 max-w-md w-full">
        <h1 className="text-3xl sm:text-4xl font-['Pacifico'] text-[#475424] mb-6">
          Your Table Number
        </h1>
        <p className="text-md text-[#1E2229] mb-8">
          Please enter your table number to start ordering.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => {
                setTableNumber(e.target.value);
                if (error) setError('');
            }}
            placeholder="e.g., 12"
            className="w-full max-w-xs text-center text-lg p-3 rounded-lg outline-none transition-all duration-200 
              bg-white text-[#1E2229] placeholder-[#1E2229]/50 shadow-sm
              focus:ring-2 focus:ring-[#EDB403] border border-transparent focus:border-[#EDB403]
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Table Number Input"
            aria-describedby="table-number-error"
            autoFocus
          />
          {error && (
             <p id="table-number-error" className="text-sm text-red-600 bg-red-100 border border-red-300 px-3 py-1 rounded-md" role="alert">
                {error}
             </p>
          )}
          <button
            type="submit"
            disabled={!tableNumber.trim()}
            className="w-full max-w-xs bg-[#EDB403] text-[#1E2229] font-semibold py-3 px-8 rounded-lg hover:bg-[#c9a002] focus:outline-none focus:ring-2 focus:ring-[#475424] focus:ring-opacity-75 transition-all duration-150 text-lg shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Continue to menu"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default TableNumberPage;
