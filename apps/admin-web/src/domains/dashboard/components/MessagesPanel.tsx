'use client';

import { MessageSquare, Mail, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { markMessageAsReadAction, markMessageAsUnreadAction } from '../actions/messages.actions';
import type { DashboardMessage } from '../types/messages.types';

type Props = {
  messages: DashboardMessage[];
  unreadCount: number;
};

export default function MessagesPanel({ messages, unreadCount }: Props) {
  const displayMessages = messages.slice(0, 5); // Show 5 messages
  const [isPending, setIsPending] = useState<string | null>(null);
  const router = useRouter();

  const handleToggleReadStatus = async (e: React.MouseEvent, message: DashboardMessage) => {
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
      console.error('Failed to toggle message read status:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsPending(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'normal':
        return 'bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)]';
      case 'low':
        return 'bg-gray-400';
      default:
        return 'bg-[linear-gradient(270deg,#01F4C8_0%,#00A8FF_100%)]';
    }
  };

  return (
    <section
      className="flex w-full flex-col rounded-[29px] bg-white p-5 shadow-[0_0_36.92px_rgba(0,0,0,0.08)]"
      aria-labelledby="messages-heading"
      style={{ fontFamily: 'Poppins, system-ui' }}
    >
      {/* Header */}
      <div className="flex w-full items-center gap-3 pb-3">
        <span className="relative grid h-[40px] w-[40px] place-items-center rounded-full bg-[#EEEFFF] sm:h-[30.5px] sm:w-[30.5px]">
          {/* gradient message icon */}
          <MessageSquare
            className="h-[20px] w-[20px] sm:h-[16px] sm:w-[16px]"
            style={{ color: '#00A8FF' }}
          />
          {/* notification badge */}
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[13px] font-medium text-white sm:h-4 sm:w-4 sm:text-[10px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
        <h3
          id="messages-heading"
          className="whitespace-nowrap text-[22px] font-medium tracking-[-0.02em] text-black sm:text-[18.64px]"
        >
          Recent Messages
        </h3>
      </div>

      {/* List */}
      <div className="max-h-[400px] space-y-2 overflow-hidden overflow-y-auto">
        {displayMessages.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">No messages</div>
        ) : (
          displayMessages.map(message => {
            const isRead = message.isRead;
            return (
              <div
                key={message.id}
                className={`flex w-full items-start gap-2 rounded-md px-4 py-4 transition-colors sm:py-2 ${
                  isRead
                    ? 'bg-[#F8F8F8] opacity-75 hover:bg-[#F0F0F0]'
                    : 'bg-[#F2F2F2] hover:bg-[#E8E8E8]'
                }`}
              >
                {/* priority dot */}
                <span
                  className={`mt-1.5 h-[11px] w-[11px] flex-shrink-0 rounded-full sm:h-[9px] sm:w-[9px] ${getPriorityColor(message.priority)}`}
                />
                <Link
                  href={message.actionUrl || '#'}
                  className="min-w-0 flex-1"
                  onClick={e => {
                    // Don't navigate if clicking on the link while button is pending
                    if (isPending) {
                      e.preventDefault();
                    }
                  }}
                >
                  <p className="truncate text-[17px] tracking-[-0.02em] text-[#444] sm:text-[13px]">
                    {message.title}
                  </p>
                  {message.description && (
                    <p className="mt-0.5 truncate text-[14px] text-gray-500 sm:text-[11px]">
                      {message.description}
                    </p>
                  )}
                </Link>
                {/* Read/Unread toggle button */}
                <button
                  type="button"
                  onClick={e => handleToggleReadStatus(e, message)}
                  onMouseDown={e => {
                    e.stopPropagation();
                  }}
                  disabled={isPending === message.id}
                  className="relative z-10 mt-1.5 flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 transition-opacity hover:bg-gray-100 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2"
                  aria-label={isRead ? 'Mark as unread' : 'Mark as read'}
                  title={isRead ? 'Mark as unread' : 'Mark as read'}
                >
                  {isRead ? (
                    <>
                      <MailCheck className="h-[14px] w-[14px] text-gray-400 sm:h-[12px] sm:w-[12px]" />
                      <span className="whitespace-nowrap text-[11px] font-medium text-gray-600 sm:text-[12px]">
                        Mark unread
                      </span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-[14px] w-[14px] text-[#00A8FF] sm:h-[12px] sm:w-[12px]" />
                      <span className="whitespace-nowrap text-[11px] font-medium text-[#00A8FF] sm:text-[12px]">
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
      <div className="mt-auto flex justify-center pt-4">
        <Link
          href="/dashboard/messages"
          className="grid h-[40px] shrink-0 place-items-center whitespace-nowrap rounded-[20px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-5 text-[15px] font-medium text-white transition-shadow hover:shadow-lg sm:h-[34px] sm:px-4 sm:text-sm"
        >
          View All
        </Link>
      </div>
    </section>
  );
}
