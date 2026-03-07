"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useUser } from "@/components/useUser";
import { MessageSquare, Loader2 } from "lucide-react";

type ApiConversation = {
  conversation_id: string;
  latest_message: {
    content: string;
    created_at: string;
  };
  other_user: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  unread_count: number;
};

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
  const { user, loading: userLoading } = useUser({ redirectTo: "/login" });
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data: ApiConversation[] = await res.json();
        setConversations(data);
      }
      setLoading(false);
    }
    if (!userLoading && user) {
      load();
    }
  }, [userLoading, user]);

  const totalUnread = conversations.reduce(
    (sum, c) => sum + c.unread_count,
    0
  );

  if (userLoading || loading) {
    return (
      <>
        <Nav user={user} loading={userLoading} />
        <main className="mx-auto flex max-w-2xl items-center justify-center px-4 py-24">
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav user={user} loading={userLoading} unreadMessages={totalUnread} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-h1 font-bold text-text-heading">Messages</h1>
        <p className="mt-1 text-body text-text-secondary">
          Private conversations with collaborators.
        </p>

        {conversations.length > 0 ? (
          <div className="mt-6 divide-y divide-border-subtle rounded-lg border border-border-default">
            {conversations.map((conv) => (
              <Link
                key={conv.conversation_id}
                href={`/messages/${conv.conversation_id}`}
                className="flex items-center gap-4 px-4 py-4 transition-colors duration-150 hover:bg-bg-surface"
              >
                <img
                  src={
                    conv.other_user.avatar_url ??
                    `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${conv.other_user.username}`
                  }
                  alt={conv.other_user.username}
                  className="h-10 w-10 shrink-0 rounded-full border border-border-default bg-bg-elevated"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-small font-medium ${
                        conv.unread_count > 0
                          ? "text-text-heading"
                          : "text-text-secondary"
                      }`}
                    >
                      {conv.other_user.display_name ??
                        conv.other_user.username}
                    </span>
                    <span className="shrink-0 text-caption text-text-muted">
                      {formatTime(conv.latest_message.created_at)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p
                      className={`truncate text-small ${
                        conv.unread_count > 0
                          ? "text-text-primary"
                          : "text-text-muted"
                      }`}
                    >
                      {conv.latest_message.content}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-caption font-bold text-bg-base">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-border-subtle bg-bg-surface p-12 text-center">
            <MessageSquare size={32} className="mx-auto text-text-muted" />
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
