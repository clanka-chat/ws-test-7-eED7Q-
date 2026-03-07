"use client";

import { useState, useRef, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ApiMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  project_id: string | null;
  read: boolean;
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
};

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
  const { id: conversationId } = use(params);
  const router = useRouter();
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [user, setUser] = useState<{
    username: string;
    avatar_url: string;
  } | null>(null);
  const [otherUser, setOtherUser] = useState<{
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/login");
        return;
      }

      setCurrentUserId(authUser.id);

      // Get profile for Nav
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", authUser.id)
        .single();

      if (profile) {
        setUser({
          username: profile.username,
          avatar_url:
            profile.avatar_url ??
            `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${profile.username}`,
        });
      }

      // Fetch messages
      const res = await fetch(`/api/messages/${conversationId}`);
      if (res.ok) {
        const data: ApiMessage[] = await res.json();
        setMessages(data);

        // Determine the other user from messages
        const otherMsg = data.find((m) => m.sender_id !== authUser.id);
        if (otherMsg) {
          setOtherUser(otherMsg.profiles);
        } else if (data.length > 0) {
          // All messages are from current user — get receiver info from profile query
          const receiverId = data[0].receiver_id;
          const { data: receiverProfile } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("id", receiverId)
            .single();
          if (receiverProfile) {
            setOtherUser(receiverProfile);
          }
        }
      }

      // Mark messages as read
      await fetch("/api/messages/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId }),
      });

      setLoading(false);
    }
    load();
  }, [conversationId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !currentUserId) return;

    // Determine receiver_id from existing messages
    const receiverId = messages.length > 0
      ? messages[0].sender_id === currentUserId
        ? messages[0].receiver_id
        : messages[0].sender_id
      : null;

    if (!receiverId) return;

    setSending(true);
    setInput("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiver_id: receiverId,
        content: text,
      }),
    });

    if (res.ok) {
      const newMsg: ApiMessage = await res.json();
      // The POST response doesn't include the joined profiles, so add it
      const supabase = createClient();
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url")
        .eq("id", currentUserId)
        .single();

      newMsg.profiles = senderProfile ?? {
        username: user?.username ?? "",
        display_name: null,
        avatar_url: user?.avatar_url ?? null,
      };

      setMessages((prev) => [...prev, newMsg]);
    }

    setSending(false);
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: ApiMessage[] }[] = [];
  for (const msg of messages) {
    const dateKey = new Date(msg.created_at).toDateString();
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] });
    }
  }

  if (loading) {
    return (
      <>
        <Nav user={user} />
        <main className="mx-auto flex max-w-2xl items-center justify-center px-4 py-24">
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav user={user} />
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
          {otherUser && (
            <>
              <img
                src={
                  otherUser.avatar_url ??
                  `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${otherUser.username}`
                }
                alt={otherUser.username}
                className="h-8 w-8 rounded-full border border-border-default bg-bg-elevated"
              />
              <div>
                <p className="text-small font-medium text-text-heading">
                  {otherUser.display_name ?? otherUser.username}
                </p>
                <p className="text-caption text-text-muted">
                  @{otherUser.username}
                </p>
              </div>
            </>
          )}
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
                  const isMine = msg.sender_id === currentUserId;
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
                        <p className="whitespace-pre-wrap text-small leading-relaxed">
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
          className="sticky bottom-0 flex gap-2 border-t border-border-subtle bg-bg-base pb-2 pt-4"
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
