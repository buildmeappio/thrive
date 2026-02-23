"use client";

import { MessageSquare, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  markMessageAsReadAction,
  markMessageAsUnreadAction,
} from "../actions/messages.actions";
import type { DashboardMessage } from "../types/messages.types";

type Props = {
  messages: DashboardMessage[];
  unreadCount: number;
};

export default function MessagesPanel({ messages, unreadCount }: Props) {
  const displayMessages = messages.slice(0, 5); // Show 5 messages
  const [isPending, setIsPending] = useState<string | null>(null);
  const router = useRouter();

  const handleToggleReadStatus = async (
    e: React.MouseEvent,
    message: DashboardMessage,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!message.id || isPending === message.id) {
      return;
    }

    setIsPending(message.id);

    try {
      // Execute the async action - server will handle revalidation
      if (message.isRead) {
        await markMessageAsUnreadAction(message.id);
      } else {
        await markMessageAsReadAction(message.id);
      }

      // Refresh the router to get updated data from server
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle message read status:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsPending(null);
    }
  };

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
          displayMessages.map((message) => {
            const isRead = message.isRead;
            return (
              <div
                key={message.id}
                className={`flex items-start gap-2 w-full rounded-md py-4 sm:py-2 px-4 transition-colors ${
                  isRead
                    ? "bg-[#F8F8F8] hover:bg-[#F0F0F0] opacity-75"
                    : "bg-[#F2F2F2] hover:bg-[#E8E8E8]"
                }`}
              >
                {/* priority dot */}
                <span
                  className={`h-[11px] sm:h-[9px] w-[11px] sm:w-[9px] rounded-full mt-1.5 flex-shrink-0 ${getPriorityColor(message.priority)}`}
                />
                <Link
                  href={message.actionUrl || "#"}
                  className="flex-1 min-w-0"
                  onClick={(e) => {
                    // Don't navigate if clicking on the link while button is pending
                    if (isPending) {
                      e.preventDefault();
                    }
                  }}
                >
                  <p className="text-[17px] sm:text-[13px] tracking-[-0.02em] text-[#444] truncate">
                    {message.title}
                  </p>
                  {message.description && (
                    <p className="text-[14px] sm:text-[11px] text-gray-500 mt-0.5 truncate">
                      {message.description}
                    </p>
                  )}
                </Link>
                {/* Read/Unread toggle button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleReadStatus(e, message)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  disabled={isPending === message.id}
                  className="mt-1.5 flex items-center gap-1.5 sm:gap-2 flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded-md hover:bg-gray-100 z-10 relative"
                  aria-label={isRead ? "Mark as unread" : "Mark as read"}
                  title={isRead ? "Mark as unread" : "Mark as read"}
                >
                  {isRead ? (
                    <>
                      <MailCheck className="h-[14px] sm:h-[12px] w-[14px] sm:w-[12px] text-gray-400" />
                      <span className="text-[11px] sm:text-[12px] text-gray-600 font-medium whitespace-nowrap">
                        Mark unread
                      </span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-[14px] sm:h-[12px] w-[14px] sm:w-[12px] text-[#00A8FF]" />
                      <span className="text-[11px] sm:text-[12px] text-[#00A8FF] font-medium whitespace-nowrap">
                        Mark read
                      </span>
                    </>
                  )}
                </button>
              </div>
            );
          })
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
