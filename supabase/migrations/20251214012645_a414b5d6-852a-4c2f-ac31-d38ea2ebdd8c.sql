-- Update the handle_new_user function to store referral_code_used from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, referral_code, referral_code_used)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'RW-' || upper(substr(md5(random()::text), 1, 6)),
    NULLIF(new.raw_user_meta_data->>'referral_code_used', '')
  );
  RETURN new;
END;
$function$;