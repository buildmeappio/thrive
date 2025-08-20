'use client';
import React, { useState } from 'react';

interface RequestMoreInfoProps {
  isOpen: boolean;
  onClose: () => void;
  examinerName: string;
}

const RequestMoreInfo: React.FC<RequestMoreInfoProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 200;

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setMessage(text);
      setCharCount(text.length);
    }
  };

  const handleSend = () => {
    console.log('Sending request for more info:', message);
    // Add your send logic here
    setMessage('');
    setCharCount(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-4xl px-2 shadow-xl w-[5px] md:w-[650px] h-[320px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <h2 className="text-xl font-semibold text-[#000093]">
            Request More Info
          </h2>
          <button
            onClick={onClose}
            className="text-[#000093] text-xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-2">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Write Text Here
            </label>
            <textarea
              value={message}
              onChange={handleMessageChange}
              placeholder="Type here..."
              className="w-full p-3 focus:border-none bg-[#F6F6F6] rounded-2xl resize-none"
              rows={4}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-500">
                {charCount}/{maxChars}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1 px-6 pb-4">
          <button
            onClick={handleSend}
            disabled={message.trim().length === 0}
            className="w-[155px] h-[41px] bg-[#000080] text-white px-[15.67px] py-2 rounded-[22.5px] font-medium hover:bg-[#000066] disabled:bg-[#000080] disabled:cursor-not-allowed transition-colors gap-[11.25px] rotate-0 opacity-100"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestMoreInfo;

