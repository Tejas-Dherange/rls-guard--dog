-- Quick fix for your current user
-- Step 1: Add YOUR profile first (replace with your actual user ID from /debug page)

-- Replace 'YOUR_USER_ID_FROM_DEBUG_PAGE' with the actual UUID shown on /debug page
INSERT INTO profiles (id, email, full_name, role) VALUES
  ('YOUR_USER_ID_FROM_DEBUG_PAGE', 'tejudherange2182@gmail.com', 'Tejas Dherange', 'head_teacher')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;