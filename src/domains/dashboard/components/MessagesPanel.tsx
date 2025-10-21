"use client";

import { MessageSquare } from "lucide-react";

type Props = { items: string[] };

export default function MessagesPanel({ items }: Props) {
  return (
    <section
      className="rounded-[29px] w-full bg-white shadow-[0_0_36.92px_rgba(0,0,0,0.08)] p-5 flex flex-col"
      aria-labelledby="messages-heading"
      style={{ fontFamily: "Poppins, system-ui" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 w-full">
        <span className="relative grid h-[40px] sm:h-[30.5px] w-[40px] sm:w-[30.5px] place-items-center rounded-full bg-[#EEEFFF]">
          {/* gradient message icon */}
          <MessageSquare className="h-[20px] sm:h-[16px] w-[20px] sm:w-[16px]" style={{ color: "#00A8FF" }} />
          {/* notification badge */}
          <span className="absolute -top-1 -right-1 h-6 w-6 sm:h-4 sm:w-4 rounded-full bg-red-500 text-white text-[13px] sm:text-[10px] font-medium flex items-center justify-center">
            1
          </span>
        </span>
        <h3
          id="messages-heading"
          className="text-[22px] sm:text-[18.64px] font-medium tracking-[-0.02em] text-black whitespace-nowrap"
        >
          Recent Messages
        </h3>
      </div>

      {/* List */}
      <div className="space-y-2 overflow-hidden">
        {items.slice(0, 5).map((message, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 w-full rounded-md py-4 sm:py-2 bg-[#F2F2F2] px-4"
          >
            {/* gradient dot */}
            <span className="h-[11px] sm:h-[9px] w-[11px] sm:w-[9px] rounded-full bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)]" />
            <p className="text-[17px] sm:text-[13px] tracking-[-0.02em] text-[#444] truncate">{message}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-auto pt-4 flex justify-center">
        <button
          type="button"
          className="py-3 sm:py-2 px-6 sm:px-4 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white text-[17px] sm:text-[15px] tracking-[-0.01em] hover:from-[#00A8FF]/80 hover:to-[#01F4C8]/80 transition-all duration-200"
        >
          View All
        </button>
      </div>
    </section>
  );
}

