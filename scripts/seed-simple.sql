-- Formfy Database Seeder
-- This script populates the database with realistic sample data

-- Clear existing data (in reverse order of dependencies)
DELETE FROM submissions;
DELETE FROM forms;
DELETE FROM api_keys;
DELETE FROM projects;
DELETE FROM users WHERE id IN ('user_1', 'user_2');

-- Insert sample users
INSERT INTO users (id, email, first_name, last_name, profile_image_url, created_at, updated_at) VALUES
('user_1', 'demo@formfy.com', 'Demo', 'User', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', NOW(), NOW()),
('user_2', 'sarah@company.com', 'Sarah', 'Johnson', 'https://images.unsplash.com/photo-1494790108755-2616b332e2c0?w=150&h=150&fit=crop&crop=face', NOW(), NOW());

-- Insert sample projects
INSERT INTO projects (id, name, description, project_id, project_key, user_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Marketing Website', 'Forms for our marketing website and landing pages', 'mkt_12345678', 'mk_abcdefghijklmnop', 'user_1', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Customer Support', 'Support tickets and feedback collection', 'sup_87654321', 'sp_qrstuvwxyzabcdef', 'user_1', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Event Management', 'Event registration and management forms', 'evt_11223344', 'ev_ghijklmnopqrstuv', 'user_2', NOW(), NOW());

-- Insert API keys
INSERT INTO api_keys (id, name, key, project_id, environment, is_active, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Production Key', 'pk_live_abcdefghijklmnopqrstuvwxyz123456', '550e8400-e29b-41d4-a716-446655440001', 'production', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440002', 'Development Key', 'pk_test_zyxwvutsrqponmlkjihgfedcba654321', '550e8400-e29b-41d4-a716-446655440001', 'development', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440003', 'Production Key', 'pk_live_mnbvcxzasdfghjklpoiuytrewq987654', '550e8400-e29b-41d4-a716-446655440002', 'production', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440004', 'Development Key', 'pk_test_qwertyuiopasdfghjklzxcvbnm135792', '550e8400-e29b-41d4-a716-446655440002', 'development', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440005', 'Production Key', 'pk_live_lkjhgfdsapoiuytrewqmnbvcxz246810', '550e8400-e29b-41d4-a716-446655440003', 'production', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440006', 'Development Key', 'pk_test_zxcvbnmasdfghjklqwertyuiop369258', '550e8400-e29b-41d4-a716-446655440003', 'development', true, NOW(), NOW());

-- Insert sample forms with realistic schemas
INSERT INTO forms (id, name, project_id, description, schema, is_active, created_at, updated_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Contact Form', '550e8400-e29b-41d4-a716-446655440001', 'Main contact form for the website', '{
  "fields": [
    {
      "id": "field_1",
      "type": "text",
      "label": "Full Name",
      "placeholder": "Enter your full name",
      "required": true,
      "order": 0
    },
    {
      "id": "field_2",
      "type": "email",
      "label": "Email Address",
      "placeholder": "your@email.com",
      "required": true,
      "order": 1
    },
    {
      "id": "field_3",
      "type": "tel",
      "label": "Phone Number",
      "placeholder": "(555) 123-4567",
      "required": false,
      "order": 2
    },
    {
      "id": "field_4",
      "type": "select",
      "label": "How did you hear about us?",
      "placeholder": "Select an option",
      "required": false,
      "order": 3,
      "options": [
        {"label": "Search Engine", "value": "search"},
        {"label": "Social Media", "value": "social"},
        {"label": "Friend Referral", "value": "referral"},
        {"label": "Advertisement", "value": "ad"}
      ]
    },
    {
      "id": "field_5",
      "type": "textarea",
      "label": "Message",
      "placeholder": "Tell us how we can help you...",
      "required": true,
      "order": 4
    }
  ],
  "settings": {
    "title": "Contact Us",
    "description": "Get in touch with our team",
    "showLabels": true,
    "buttonLayout": "right",
    "submitButtonText": "Send Message",
    "submitButtonColor": "#3b82f6"
  }
}', true, NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440002', 'Newsletter Signup', '550e8400-e29b-41d4-a716-446655440001', 'Simple email collection form', '{
  "fields": [
    {
      "id": "field_1",
      "type": "email",
      "label": "Email Address",
      "placeholder": "Enter your email",
      "required": true,
      "order": 0
    }
  ],
  "settings": {
    "title": "Newsletter Signup",
    "description": "Stay updated with our latest news",
    "showLabels": false,
    "buttonLayout": "right",
    "submitButtonText": "Subscribe",
    "submitButtonColor": "#3b82f6"
  }
}', true, NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440003', 'Customer Feedback', '550e8400-e29b-41d4-a716-446655440002', 'Collect customer feedback and ratings', '{
  "fields": [
    {
      "id": "field_1",
      "type": "text",
      "label": "Your Name",
      "placeholder": "Enter your name",
      "required": true,
      "order": 0
    },
    {
      "id": "field_2",
      "type": "radio",
      "label": "Overall Satisfaction",
      "required": true,
      "order": 1,
      "options": [
        {"label": "Very Satisfied", "value": "very_satisfied"},
        {"label": "Satisfied", "value": "satisfied"},
        {"label": "Neutral", "value": "neutral"},
        {"label": "Dissatisfied", "value": "dissatisfied"},
        {"label": "Very Dissatisfied", "value": "very_dissatisfied"}
      ]
    },
    {
      "id": "field_3",
      "type": "number",
      "label": "Rate us (1-10)",
      "placeholder": "10",
      "required": false,
      "order": 2
    },
    {
      "id": "field_4",
      "type": "textarea",
      "label": "Additional Comments",
      "placeholder": "Share your thoughts...",
      "required": false,
      "order": 3
    }
  ],
  "settings": {
    "title": "Feedback Survey",
    "description": "Help us improve our service",
    "showLabels": true,
    "buttonLayout": "center",
    "submitButtonText": "Submit Feedback",
    "submitButtonColor": "#10b981"
  }
}', true, NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440004', 'Bug Report', '550e8400-e29b-41d4-a716-446655440002', 'Technical issue reporting form', '{
  "fields": [
    {
      "id": "field_1",
      "type": "text",
      "label": "Issue Title",
      "placeholder": "Brief description of the issue",
      "required": true,
      "order": 0
    },
    {
      "id": "field_2",
      "type": "select",
      "label": "Priority",
      "placeholder": "Select priority level",
      "required": true,
      "order": 1,
      "options": [
        {"label": "Low", "value": "low"},
        {"label": "Medium", "value": "medium"},
        {"label": "High", "value": "high"},
        {"label": "Critical", "value": "critical"}
      ]
    },
    {
      "id": "field_3",
      "type": "textarea",
      "label": "Description",
      "placeholder": "Detailed description of the issue...",
      "required": true,
      "order": 2
    }
  ],
  "settings": {
    "title": "Bug Report",
    "description": "Help us fix issues by reporting bugs",
    "showLabels": true,
    "buttonLayout": "right",
    "submitButtonText": "Submit Report",
    "submitButtonColor": "#ef4444"
  }
}', true, NOW(), NOW()),

('750e8400-e29b-41d4-a716-446655440005', 'Conference Registration', '550e8400-e29b-41d4-a716-446655440003', 'Registration form for annual conference', '{
  "fields": [
    {
      "id": "field_1",
      "type": "text",
      "label": "First Name",
      "placeholder": "John",
      "required": true,
      "order": 0
    },
    {
      "id": "field_2",
      "type": "text",
      "label": "Last Name",
      "placeholder": "Doe",
      "required": true,
      "order": 1
    },
    {
      "id": "field_3",
      "type": "email",
      "label": "Email",
      "placeholder": "john@example.com",
      "required": true,
      "order": 2
    },
    {
      "id": "field_4",
      "type": "select",
      "label": "Ticket Type",
      "placeholder": "Select ticket type",
      "required": true,
      "order": 3,
      "options": [
        {"label": "General Admission - $50", "value": "general"},
        {"label": "VIP - $150", "value": "vip"},
        {"label": "Student - $25", "value": "student"}
      ]
    },
    {
      "id": "field_5",
      "type": "date",
      "label": "Date of Birth",
      "required": false,
      "order": 4
    }
  ],
  "settings": {
    "title": "Conference Registration",
    "description": "Register for our upcoming conference",
    "showLabels": true,
    "buttonLayout": "right",
    "submitButtonText": "Register Now",
    "submitButtonColor": "#8b5cf6"
  }
}', true, NOW(), NOW());

-- Insert sample form submissions
INSERT INTO submissions (id, form_id, data, ip_address, user_agent, created_at) VALUES
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '{
  "field_1": "John Smith",
  "field_2": "john.smith@email.com",
  "field_3": "(555) 123-4567",
  "field_4": "search",
  "field_5": "I am interested in learning more about your services. Could you please contact me?"
}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '2 days'),

('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', '{
  "field_1": "Emily Johnson",
  "field_2": "emily.j@company.com",
  "field_3": "(555) 987-6543",
  "field_4": "referral",
  "field_5": "Looking for a partnership opportunity. Please reach out at your earliest convenience."
}', '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', NOW() - INTERVAL '1 day'),

('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002', '{
  "field_1": "newsletter@subscriber.com"
}', '203.0.113.5', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15', NOW() - INTERVAL '3 hours'),

('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440003', '{
  "field_1": "Alex Chen",
  "field_2": "very_satisfied",
  "field_3": "9",
  "field_4": "Great platform! The form builder is intuitive and the API documentation is excellent."
}', '172.16.0.10', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', NOW() - INTERVAL '6 hours'),

('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440005', '{
  "field_1": "Maria",
  "field_2": "Garcia", 
  "field_3": "maria.garcia@startup.com",
  "field_4": "vip",
  "field_5": "1990-05-15"
}', '198.51.100.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '12 hours'),

('850e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440004', '{
  "field_1": "Login page not loading",
  "field_2": "high",
  "field_3": "Users are unable to access the login page. The page shows a 500 error and does not load properly. This started happening after the recent deployment."
}', '172.16.0.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '30 minutes');

-- Update statistics
SELECT 
  (SELECT COUNT(*) FROM users WHERE id IN ('user_1', 'user_2')) as users_created,
  (SELECT COUNT(*) FROM projects WHERE user_id IN ('user_1', 'user_2')) as projects_created,
  (SELECT COUNT(*) FROM api_keys) as api_keys_created,
  (SELECT COUNT(*) FROM forms) as forms_created,
  (SELECT COUNT(*) FROM submissions) as submissions_created;