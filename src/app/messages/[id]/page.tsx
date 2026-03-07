"use client";

import { useState, useRef, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { ArrowLeft, Send } from "lucide-react";
import type { Message } from "../../../../types/database";

type ConversationMessage = Message & {
  senderName: string;
  senderAvatar: string;
};

const MOCK_USER = {
  id: "u1",
  username: "spaghettipete",
  avatar_url:
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=spaghettipete",
};

const MOCK_OTHER_USER = {
  id: "u7",
  username: "reactrachel",
  display_name: "Rachel",
  avatar_url:
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=reactrachel",
};

const MOCK_MESSAGES: ConversationMessage[] = [
  {
    id: "m1",
    conversation_id: "conv-1",
    sender_id: "u7",
    receiver_id: "u1",
    content:
      "Hey! I saw the Frontend Dev role on clanka.chat — I have 3 years of React/Next.js experience and would love to help out.",
    project_id: "1",
    read: true,
    created_at: "2026-03-06T14:00:00Z",
    senderName: "Rachel",
    senderAvatar:
      "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=reactrachel",
  },
  {
    id: "m2",
    conversation_id: "conv-1",
    sender_id: "u1",
    receiver_id: "u7",
    content:
      "Hey Rachel! That's awesome. What kind of projects have you worked on? We're looking for someone comfortable with Tailwind and the App Router.",
    project_id: "1",
    read: true,
    created_at: "2026-03-06T14:30:00Z",
    senderName: "Pete",
    senderAvatar:
      "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=spaghettipete",
  },
  {
    id: "m3",
    conversation_id: "conv-1",
    sender_id: "u7",
    receiver_id: "u1",
    content:
      "I've built a couple SaaS dashboards with Next.js 14/15 and Tailwind. I'm also familiar with Supabase for auth and data. Happy to share my GitHub if you want to see some code.",
    project_id: "1",
    read: false,
    created_at: "2026-03-07T10:15:00Z",
    senderName: "Rachel",
    senderAvatar:
      "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=reactrachel",
  },
  {
    id: "m4",
    conversation_id: "conv-1",
    sender_id: "u7",
    receiver_id: "u1",
    content:
      "Also — the 30% revenue split for the Frontend role works for me. When would you want to get started?",
    project_id: "1",
    read: false,
    created_at: "2026-03-07T10:30:00Z",
    senderName: "Rachel",
    senderAvatar:
      "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=reactrachel",
  },
];

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setSending(true);
    // TODO: POST /api/messages — Agent 1 builds this
    const newMessage: ConversationMessage = {
      id: `m-${Date.now()}`,
      conversation_id: id,
      sender_id: MOCK_USER.id,
      receiver_id: MOCK_OTHER_USER.id,
      content: text,
      project_id: null,
      read: false,
      created_at: new Date().toISOString(),
      senderName: "Pete",
      senderAvatar: MOCK_USER.avatar_url,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setSending(false);
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: ConversationMessage[] }[] =
    [];
  for (const msg of messages) {
    const dateKey = new Date(msg.created_at).toDateString();
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] });
    }
  }

  return (
    <>
      <Nav user={MOCK_USER} unreadMessages={2} />
      <main className="mx-auto flex max-w-2xl flex-col px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
          <Link
            href="/messages"
            className="rounded-md p-1.5 text-text-muted transition-colors duration-150 hover:text-text-primary"
            aria-label="Back to messages"
          >
            <ArrowLeft size={18} />
          </Link>
          <img
            src={MOCK_OTHER_USER.avatar_url}
            alt={MOCK_OTHER_USER.username}
            className="h-8 w-8 rounded-full border border-border-default bg-bg-elevated"
          />
          <div>
            <p className="text-small font-medium text-text-heading">
              {MOCK_OTHER_USER.display_name ?? MOCK_OTHER_USER.username}
            </p>
            <p className="text-caption text-text-muted">
              @{MOCK_OTHER_USER.username}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-6 py-6">
          {groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="mb-4 flex justify-center">
                <span className="rounded-full bg-bg-elevated px-3 py-1 text-caption text-text-muted">
                  {formatMessageDate(group.messages[0].created_at)}
                </span>
              </div>
              <div className="space-y-3">
                {group.messages.map((msg) => {
                  const isMine = msg.sender_id === MOCK_USER.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-3 ${
                          isMine
                            ? "bg-accent text-bg-base"
                            : "bg-bg-surface text-text-primary"
                        }`}
                      >
                        <p className="text-small leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        <p
                          className={`mt-1.5 text-caption ${
                            isMine ? "text-bg-base/60" : "text-text-muted"
                          }`}
                        >
                          {formatMessageTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="sticky bottom-0 flex gap-2 border-t border-border-subtle bg-bg-base pt-4 pb-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="h-10 flex-1 rounded-md border border-border-default bg-bg-input px-3 text-small text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <Button
            type="submit"
            size="md"
            disabled={sending || !input.trim()}
          >
            <Send size={16} />
          </Button>
        </form>
      </main>
      <Footer />
    </>
  );
}
