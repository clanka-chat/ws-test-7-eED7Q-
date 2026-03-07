"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type NavUser = {
  username: string;
  avatar_url: string;
};

export function useUser(options?: { redirectTo?: string }) {
  const router = useRouter();
  const [user, setUser] = useState<NavUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        if (options?.redirectTo) {
          router.push(options.redirectTo);
        }
        setLoading(false);
        return;
      }

      setUserId(authUser.id);

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

      // Fetch unread message count
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const conversations: { unread_count: number }[] = await res.json();
          const total = conversations.reduce((sum, c) => sum + c.unread_count, 0);
          setUnreadMessages(total);
        }
      } catch {
        // Silently fail — badge just won't show
      }

      setLoading(false);
    }
    load();
  }, [router, options?.redirectTo]);

  return { user, userId, loading, unreadMessages };
}
