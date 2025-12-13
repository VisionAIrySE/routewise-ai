-- Add Russ Wright as admin
INSERT INTO user_roles (user_id, role) 
VALUES ('074d35cc-0312-4c62-b623-5fbb6e477ba9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;