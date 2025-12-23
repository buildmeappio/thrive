"use client";

import { MessageSquare } from "lucide-react";
import Link from "next/link";
import type { DashboardMessage } from "../types/messages.types";

type Props = {
  messages: DashboardMessage[];
  unreadCount: number;
};

export default function MessagesPanel({ messages, unreadCount }: Props) {
  const displayMessages = messages.slice(0, 5); // Show 5 messages

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "normal":
        return "bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)]";
      case "low":
        return "bg-gray-400";
      default:
        return "bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)]";
    }
  };

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
          <MessageSquare
            className="h-[20px] sm:h-[16px] w-[20px] sm:w-[16px]"
            style={{ color: "#00A8FF" }}
          />
          {/* notification badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 sm:h-4 sm:w-4 rounded-full bg-red-500 text-white text-[13px] sm:text-[10px] font-medium flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </span>
        <h3
          id="messages-heading"
          className="text-[22px] sm:text-[18.64px] font-medium tracking-[-0.02em] text-black whitespace-nowrap"
        >
          Recent Messages
        </h3>
      </div>

      {/* List */}
      <div className="space-y-2 overflow-hidden max-h-[400px] overflow-y-auto">
        {displayMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No messages
          </div>
        ) : (
          displayMessages.map((message) => (
            <Link
              key={message.id}
              href={message.actionUrl || "#"}
              className="flex items-start gap-2 w-full rounded-md py-4 sm:py-2 bg-[#F2F2F2] px-4 hover:bg-[#E8E8E8] transition-colors cursor-pointer"
            >
              {/* priority dot */}
              <span
                className={`h-[11px] sm:h-[9px] w-[11px] sm:w-[9px] rounded-full mt-1.5 flex-shrink-0 ${getPriorityColor(message.priority)}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[17px] sm:text-[13px] tracking-[-0.02em] text-[#444] truncate">
                  {message.title}
                </p>
                {message.description && (
                  <p className="text-[14px] sm:text-[11px] text-gray-500 mt-0.5 truncate">
                    {message.description}
                  </p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* CTA */}
      <div className="mt-auto pt-4 flex justify-center">
        <Link
          href="/dashboard/messages"
          className="h-[40px] sm:h-[34px] rounded-[20px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-5 sm:px-4 text-white text-[15px] sm:text-sm font-medium grid place-items-center hover:shadow-lg transition-shadow whitespace-nowrap shrink-0"
        >
          View All
        </Link>
      </div>
    </section>
  );
}
