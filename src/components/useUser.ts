"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type NavUser = {
  username: string;
  avatar_url: string;
};

export function useUser(options?: { redirectTo?: string; skipUnread?: boolean }) {
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

      // Parallelize independent fetches
      const [profileResult, unreadCount] = await Promise.all([
        supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", authUser.id)
          .single(),
        options?.skipUnread
          ? Promise.resolve(0)
          : fetch("/api/messages")
              .then(async (res) => {
                if (!res.ok) return 0;
                const conversations: { unread_count: number }[] = await res.json();
                return conversations.reduce((sum, c) => sum + c.unread_count, 0);
              })
              .catch(() => 0),
      ]);

      // Batch all state updates synchronously so React renders once
      const profile = profileResult.data;
      setUserId(authUser.id);
      if (profile) {
        setUser({
          username: profile.username,
          avatar_url:
            profile.avatar_url ??
            `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${profile.username}`,
        });
      }
      setUnreadMessages(unreadCount);
      setLoading(false);
    }
    load();
  }, [router, options?.redirectTo, options?.skipUnread]);

  return { user, userId, loading, unreadMessages };
}
