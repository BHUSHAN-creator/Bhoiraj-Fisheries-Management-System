ALTER TABLE public.dams ADD COLUMN IF NOT EXISTS map_url text;
ALTER TABLE public.dams ADD COLUMN IF NOT EXISTS location_name text;
CREATE OR REPLACE FUNCTION public.validate_membership_application() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
 IF TG_OP = 'UPDATE' AND NEW.phone IS NOT DISTINCT FROM OLD.phone AND NEW.alt_phone IS NOT DISTINCT FROM OLD.alt_phone AND NEW.status IS DISTINCT FROM OLD.status THEN
   NEW.updated_at = now(); RETURN NEW;
 END IF;
 IF NEW.aadhaar_number IS NOT NULL AND NEW.aadhaar_number <> '' AND NEW.aadhaar_number !~ '^[0-9]{12}$' THEN RAISE EXCEPTION 'आधार क्रमांक १२ अंकी असावा'; END IF;
 IF NEW.phone !~ '^[0-9]{10}$' THEN RAISE EXCEPTION 'मोबाईल क्रमांक १० अंकी असावा'; END IF;
 IF NEW.alt_phone IS NOT NULL AND NEW.alt_phone <> '' AND NEW.alt_phone !~ '^[0-9]{10}$' THEN RAISE EXCEPTION 'पर्यायी मोबाईल क्रमांक १० अंकी असावा'; END IF;
 IF NEW.alt_phone = NEW.phone THEN RAISE EXCEPTION 'पर्यायी मोबाईल क्रमांक वेगळा असावा'; END IF;
 IF NEW.dob > (CURRENT_DATE - INTERVAL '20 years') THEN RAISE EXCEPTION 'अर्जदाराचे वय किमान २० वर्षे असावे'; END IF;
 IF NEW.pan IS NOT NULL AND NEW.pan <> '' AND NEW.pan !~ '^[A-Z]{5}[0-9]{4}[A-Z]$' THEN RAISE EXCEPTION 'PAN क्रमांक ABCDE1234F या स्वरूपात असावा'; END IF;
 IF EXISTS (SELECT 1 FROM public.members m WHERE (NEW.user_id IS NULL OR m.user_id IS DISTINCT FROM NEW.user_id) AND (m.phone IN (NEW.phone,NULLIF(NEW.alt_phone,'')) OR m.alt_phone IN (NEW.phone,NULLIF(NEW.alt_phone,'')))) THEN RAISE EXCEPTION 'हा मोबाईल क्रमांक आधीच नोंदणीकृत आहे'; END IF;
 IF EXISTS (SELECT 1 FROM public.membership_applications a WHERE a.id <> NEW.id AND a.status <> 'rejected' AND (a.phone IN (NEW.phone,NULLIF(NEW.alt_phone,'')) OR a.alt_phone IN (NEW.phone,NULLIF(NEW.alt_phone,'')))) THEN RAISE EXCEPTION 'या मोबाईल क्रमांकाचा सक्रिय अर्ज आहे'; END IF;
 NEW.updated_at = now(); RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.remove_revoked_membership() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
 IF OLD.status='approved' AND NEW.status='rejected' THEN
 DELETE FROM public.members WHERE (NEW.user_id IS NOT NULL AND user_id=NEW.user_id) OR phone=NEW.phone;
 UPDATE public.profiles SET membership_number=NULL WHERE id=NEW.user_id;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER membership_revocation AFTER UPDATE OF status ON public.membership_applications FOR EACH ROW EXECUTE FUNCTION public.remove_revoked_membership();