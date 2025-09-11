-- ====================
-- ENUMS (Optional)
-- ====================
CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'resolved');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- ====================
-- TABLE: profiles
-- ====================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ====================
-- TABLE: reports
-- ====================
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    title TEXT,
    description TEXT,
    type TEXT,
    status report_status DEFAULT 'pending',
    image_url TEXT,
    latitude FLOAT8,
    longitude FLOAT8,
    created_at TIMESTAMP DEFAULT now()
);

-- ====================
-- TABLE: alerts
-- ====================
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    title TEXT,
    type TEXT,
    severity alert_severity,
    region TEXT,
    expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

-- ====================
-- TABLE: notices
-- ====================
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    content TEXT,
    region TEXT,
    expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

-- ====================
-- TABLE: user_notifications
-- ====================
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    title TEXT,
    message TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- ====================
-- TABLE: system_logs
-- ====================
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT,
    level TEXT,
    created_at TIMESTAMP DEFAULT now()
);
