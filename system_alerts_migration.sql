-- Migration script for system alerts table
-- Run this in your Supabase SQL editor

-- Create system_alerts table
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    recommendations TEXT[],
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON system_alerts(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON system_alerts(created_at);

-- Create RLS policies
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read alerts
CREATE POLICY "Allow authenticated users to read system alerts" ON system_alerts
    FOR SELECT TO authenticated
    USING (true);

-- Policy for authenticated users to update alerts (acknowledge/resolve)
CREATE POLICY "Allow authenticated users to update system alerts" ON system_alerts
    FOR UPDATE TO authenticated
    USING (true);

-- Policy for service role to insert alerts
CREATE POLICY "Allow service role to insert system alerts" ON system_alerts
    FOR INSERT TO service_role
    WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_system_alerts_updated_at 
    BEFORE UPDATE ON system_alerts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample alerts for testing
INSERT INTO system_alerts (type, severity, title, message, data, recommendations) VALUES
('system', 'low', 'Analytics System Online', 'The automated analytics system is now operational and monitoring for alert conditions.', 
 '{"system": "analytics", "status": "online"}', 
 ARRAY['Monitor system performance', 'Review alert thresholds', 'Test alert generation']),
('performance', 'medium', 'High Response Time Detected', 'Average response time for report verification is above target threshold.', 
 '{"avgResponseTime": 26, "threshold": 24}', 
 ARRAY['Review verification workflow', 'Assign additional staff', 'Implement automation']);

-- Create view for active alerts summary
CREATE OR REPLACE VIEW active_alerts_summary AS
SELECT 
    type,
    severity,
    COUNT(*) as count,
    MIN(created_at) as earliest_alert,
    MAX(created_at) as latest_alert
FROM system_alerts 
WHERE status = 'active'
GROUP BY type, severity
ORDER BY 
    CASE severity 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
    END,
    count DESC;

-- Grant permissions on the view
GRANT SELECT ON active_alerts_summary TO authenticated;
