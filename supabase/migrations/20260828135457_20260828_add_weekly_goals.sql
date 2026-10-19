/*
# Add weekly goal columns to user_profiles

## Summary
Adds two new columns to the `user_profiles` table so users can set
weekly study-time and weekly question-count goals, alongside the existing
daily-minutes goal. These power the new weekly-goal tracking feature.

## Modified Tables
- `user_profiles`
  - `goal_weekly_minutes` (integer, default 600 = 10 hours/week)
  - `goal_weekly_questions` (integer, default 300 questions/week)

## Security
No security changes — the table already has RLS enabled with owner-scoped
policies. The new columns inherit the existing SELECT/UPDATE policies.
*/

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS goal_weekly_minutes integer NOT NULL DEFAULT 600,
  ADD COLUMN IF NOT EXISTS goal_weekly_questions integer NOT NULL DEFAULT 300;
