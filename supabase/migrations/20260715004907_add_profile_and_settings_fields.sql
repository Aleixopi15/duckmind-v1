/*
# Extend user_profiles with profile and settings fields

## Summary
Adds columns to `user_profiles` so users can customize their profile (avatar emoji, bio, daily study goal) and app settings (notifications toggle). These are all optional fields with safe defaults so existing rows remain valid.

## Modified Tables

### user_profiles (ALTER, additive only)
- `avatar_emoji` (text, default '🦆') — emoji the user picks as their avatar
- `bio` (text, default '') — short bio shown on the profile page
- `goal_daily_minutes` (int, default 120) — daily study goal in minutes (used for streaks/progress)
- `notifications_enabled` (boolean, default true) — master toggle for browser notifications

## Security
- No new tables. Existing owner-scoped RLS policies on `user_profiles` already cover SELECT/INSERT/UPDATE/DELETE for `auth.uid() = id`, so the new columns inherit the same protection.
*/

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS avatar_emoji text NOT NULL DEFAULT '🦆',
  ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS goal_daily_minutes int NOT NULL DEFAULT 120,
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean NOT NULL DEFAULT true;
