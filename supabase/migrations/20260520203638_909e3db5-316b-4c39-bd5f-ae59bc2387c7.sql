
REVOKE ALL ON FUNCTION public.next_quotation_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.next_quotation_number() TO authenticated;

REVOKE ALL ON FUNCTION public.user_owns_quotation(uuid) FROM PUBLIC, anon, authenticated;
