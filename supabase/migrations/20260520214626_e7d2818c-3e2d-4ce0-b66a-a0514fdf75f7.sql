ALTER TABLE public.os_quotations
  ALTER COLUMN quotation_number SET DEFAULT ('IK-QTN-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.os_quotation_seq')::text, 4, '0'));

GRANT USAGE, SELECT ON SEQUENCE public.os_quotation_seq TO authenticated;
REVOKE EXECUTE ON FUNCTION public.next_quotation_number() FROM authenticated;