/* eslint-disable @typescript-eslint/consistent-type-imports */
'use client';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IRequestMoreInfoProps } from '@/shared/types';
import React, { useState, useEffect } from 'react';

const RequestDocuments: React.FC<IRequestMoreInfoProps> = ({ isOpen, onClose }) => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setMessage(text);
        if (!text.trim()) {
            setError('Message is required');
        } else {
            setError('');
        }
    };

    const handleSend = () => {
        if (!message.trim()) {
            setError('Message is required');
            return;
        }
        console.log('Sending request for documents:', message);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-4xl px-2 shadow-xl w-[90%] md:w-[650px] md:h-[310px] h-[340px]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 pt-4 pb-2">
                    <h2 className="text-xl font-semibold text-[#00A8FF]">
                        Request More Info / Documents
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-6 h-6 flex items-center justify-center font-bold bg-[#00A8FF] rounded-full text-white cursor-pointer hover:bg-[#00A8FF]/85 transition"
                    >
                        ×
                    </button>
                </div>

                <div className="px-6 pt-2 relative">
                    <div className="mb-4">
                        <Label htmlFor="message" className="text-black text-xl mb-1">
                            Write Text Here<span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Textarea
                                name="message"
                                id="message"
                                placeholder="Type here..."
                                value={message}
                                onChange={handleMessageChange}
                                className="min-h-[150px] w-full resize-none text-sm sm:text-base md:min-h-[120px]"
                                maxLength={500}
                            />
                            <div className="absolute right-2 bottom-2 text-xs text-gray-400 sm:right-3 sm:bottom-2 sm:text-sm">
                                {message.length}/500
                            </div>
                        </div>
                        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>
                </div>

                <div className="flex justify-end pt-1 px-6 pb-4">
                    <button
                        onClick={handleSend}
                        className="cursor-pointer w-[155px] h-[41px] bg-[#00A8FF] hover:bg-[#00A8FF]/85 text-white px-[15.67px] py-2 rounded-[22.5px] font-medium transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestDocuments;