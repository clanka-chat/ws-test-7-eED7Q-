"use client";

import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MessageSquare } from "lucide-react";

type Conversation = {
  id: string;
  otherUser: {
    username: string;
    display_name: string | null;
    avatar_url: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

const MOCK_USER = {
  username: "spaghettipete",
  avatar_url:
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=spaghettipete",
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    otherUser: {
      username: "reactrachel",
      display_name: "Rachel",
      avatar_url:
        "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=reactrachel",
    },
    lastMessage:
      "Hey! I saw the Frontend Dev role on clanka.chat — I have 3 years of React/Next.js experience and would love to help out.",
    lastMessageAt: "2026-03-07T10:30:00Z",
    unreadCount: 2,
  },
  {
    id: "conv-2",
    otherUser: {
      username: "growthguru",
      display_name: "Marcus",
      avatar_url:
        "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=growthguru",
    },
    lastMessage:
      "Sounds good, let me know when you want to hop on a call to discuss the launch strategy.",
    lastMessageAt: "2026-03-06T18:15:00Z",
    unreadCount: 0,
  },
];

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffHours < 24 * 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  return (
    <>
      <Nav user={MOCK_USER} unreadMessages={2} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-h1 font-bold text-text-heading">Messages</h1>
        <p className="mt-1 text-body text-text-secondary">
          Private conversations with collaborators.
        </p>

        {MOCK_CONVERSATIONS.length > 0 ? (
          <div className="mt-6 divide-y divide-border-subtle rounded-lg border border-border-default">
            {MOCK_CONVERSATIONS.map((conv) => (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 px-4 py-4 transition-colors duration-150 hover:bg-bg-surface"
              >
                <img
                  src={conv.otherUser.avatar_url}
                  alt={conv.otherUser.username}
                  className="h-10 w-10 shrink-0 rounded-full border border-border-default bg-bg-elevated"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-small font-medium ${
                        conv.unreadCount > 0
                          ? "text-text-heading"
                          : "text-text-secondary"
                      }`}
                    >
                      {conv.otherUser.display_name ?? conv.otherUser.username}
                    </span>
                    <span className="shrink-0 text-caption text-text-muted">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p
                      className={`truncate text-small ${
                        conv.unreadCount > 0
                          ? "text-text-primary"
                          : "text-text-muted"
                      }`}
                    >
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-caption font-bold text-bg-base">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-border-subtle bg-bg-surface p-12 text-center">
            <MessageSquare
              size={32}
              className="mx-auto text-text-muted"
            />
            <p className="mt-3 text-body text-text-secondary">
              No messages yet.
            </p>
            <p className="mt-1 text-small text-text-muted">
              When you join a project or someone requests to join yours,
              conversations will appear here.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
