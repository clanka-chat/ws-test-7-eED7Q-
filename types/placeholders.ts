// Shared placeholder types — used by Agent 2 until Agent 1 creates real types
// After merge, replace imports from here with imports from types/database.ts

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  owner_id: string;
  status: 'idea' | 'building' | 'launched';
};
