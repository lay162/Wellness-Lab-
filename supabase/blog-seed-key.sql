-- Optional: links starter blog rows to built-in seed content (safe to re-run)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seed_key TEXT UNIQUE;
