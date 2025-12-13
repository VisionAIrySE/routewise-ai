-- Allow app admins to update any user profile
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (is_app_admin(auth.uid()))
WITH CHECK (is_app_admin(auth.uid()));