-- On remplace l'ancienne fonction par cette version plus intelligente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- On vérifie d'abord si un profil existe déjà pour cet utilisateur
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, 'Prospector' || floor(random() * 100000)::text);
  END IF;

  -- On vérifie d'abord si un vaisseau existe déjà pour cet utilisateur
  IF NOT EXISTS (SELECT 1 FROM public.ships WHERE player_id = NEW.id) THEN
    INSERT INTO public.ships (player_id)
    VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$;