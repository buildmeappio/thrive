import React from 'react'

const HomeSummary = () => {
    return (
        <div className="bg-white rounded-4xl px-8 py-6 border border-[#EAEAEA]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-[28px] font-semibold text-black">Summary</h2>
                <span
                    className="px-3 py-1 text-sm font-medium text-white rounded-full bg-[#0037A5]">
                    This Month
                </span>
            </div>
            <div className="space-y-6">
                <div className="flex justify-between">
                    <div>
                        <p className="text-[20px] font-semibold text-black mb-1">Earnings</p>
                        <p className="text-[26px] font-bold text-[#00A8FF]">
                            $2,250
                        </p>
                    </div>
                    <div>
                        <p className="text-[20px] font-semibold text-black mb-1">Invoiced</p>
                        <p className="text-[26px] font-bold text-[#00A8FF]">
                            $1,500
                        </p>
                    </div>
                </div>
                <div>
                    <p className="text-[20px] font-semibold text-black mb-1">Total IMEs</p>
                    <p className="text-[26px] font-bold text-[#00A8FF]">
                        3
                    </p>
                </div>
            </div>
        </div>
    )
}

export default HomeSummary