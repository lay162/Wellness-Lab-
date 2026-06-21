-- Optional: allow products without a fixed price (enquiry only)
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_on_enquiry BOOLEAN DEFAULT false;
