-- Migration to add forwarded_reports table for tracking report forwarding history
-- This table will store information about reports that have been forwarded

CREATE TABLE IF NOT EXISTS forwarded_reports (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    forwarded_by UUID REFERENCES auth.users(id),
    forwarded_to TEXT NOT NULL, -- Department, authority, or person
    forwarding_reason TEXT,
    forwarding_notes TEXT,
    forwarded_at TIMESTAMP DEFAULT now(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'completed', 'rejected'))
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_forwarded_reports_report_id ON forwarded_reports(report_id);
CREATE INDEX IF NOT EXISTS idx_forwarded_reports_forwarded_by ON forwarded_reports(forwarded_by);
CREATE INDEX IF NOT EXISTS idx_forwarded_reports_status ON forwarded_reports(status);
CREATE INDEX IF NOT EXISTS idx_forwarded_reports_forwarded_at ON forwarded_reports(forwarded_at);

-- Add a column to reports table to track if it has been forwarded
ALTER TABLE reports ADD COLUMN IF NOT EXISTS is_forwarded BOOLEAN DEFAULT FALSE;

-- Add updated_at column to track when reports are resolved
ALTER TABLE reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_is_forwarded ON reports(is_forwarded);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_updated_at ON reports(updated_at);
