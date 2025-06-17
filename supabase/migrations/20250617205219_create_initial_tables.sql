-- Starcritters MVP - Supabase Schema v1.0

-- =================================================================
-- TABLE 1: profiles
-- Stocke les données publiques des utilisateurs, étend la table auth.users
-- =================================================================
CREATE TABLE public.profiles (
    id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamp with time zone,
    username text NOT NULL,
    has_captain_pass boolean NOT NULL DEFAULT false,
    avatar_url text,

    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20)
);

-- TABLE 2: ships
CREATE TABLE public.ships (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    energy_cores integer NOT NULL DEFAULT 100,
    chrono_particles bigint NOT NULL DEFAULT 0,
    engine_level integer NOT NULL DEFAULT 1,
    reactor_level integer NOT NULL DEFAULT 1,
    fabricator_level integer NOT NULL DEFAULT 1,
    scanner_level integer NOT NULL DEFAULT 1,
    CONSTRAINT ships_pkey PRIMARY KEY (id),
    CONSTRAINT ships_player_id_key UNIQUE (player_id)
);

-- TABLE 3: relics
CREATE TABLE public.relics (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    value_usd numeric(10, 2) NOT NULL,
    desirability_score integer NOT NULL,
    total_fragments integer NOT NULL DEFAULT 100,
    CONSTRAINT relics_pkey PRIMARY KEY (id),
    CONSTRAINT desirability_score_check CHECK (desirability_score >= 0 AND desirability_score <= 100)
);

-- TABLE 4: player_relic_fragments
CREATE TABLE public.player_relic_fragments (
    id bigserial,
    player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relic_id uuid NOT NULL REFERENCES public.relics(id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT player_relic_fragments_pkey PRIMARY KEY (id),
    CONSTRAINT player_relic_unique UNIQUE (player_id, relic_id)
);

-- TABLE 5: daily_grids
CREATE TABLE public.daily_grids (
    id bigserial,
    grid_date date NOT NULL,
    mystery_image_theme text NOT NULL,
    mystery_image_url text NOT NULL,
    grid_distribution jsonb NOT NULL,
    CONSTRAINT daily_grids_pkey PRIMARY KEY (id),
    CONSTRAINT daily_grids_grid_date_key UNIQUE (grid_date)
);

-- TABLE 6: grid_discoveries
CREATE TABLE public.grid_discoveries (
    id bigserial,
    grid_id bigint NOT NULL REFERENCES public.daily_grids(id) ON DELETE CASCADE,
    player_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relic_id uuid NOT NULL REFERENCES public.relics(id) ON DELETE CASCADE,
    coord_x integer NOT NULL,
    coord_y integer NOT NULL,
    discovered_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT grid_discoveries_pkey PRIMARY KEY (id),
    CONSTRAINT first_click_wins_unique UNIQUE (grid_id, coord_x, coord_y)
);

-- TABLE 7: daily_economic_reports
CREATE TABLE public.daily_economic_reports (
    id bigserial,
    report_date date NOT NULL,
    total_revenue_usd numeric(12, 4) NOT NULL DEFAULT 0.00,
    active_players integer NOT NULL DEFAULT 0,
    CONSTRAINT daily_economic_reports_pkey PRIMARY KEY (id),
    CONSTRAINT daily_economic_reports_report_date_key UNIQUE (report_date)
);

-- INITIAL SEED DATA
-- On insère un rapport économique factice pour le test
INSERT INTO public.daily_economic_reports (report_date, total_revenue_usd, active_players)
VALUES ('2025-06-16', 1000.00, 150);

-- On insère les reliques de départ
INSERT INTO public.relics (name, description, value_usd, desirability_score, total_fragments)
VALUES
  ('Casque Audio Pro-Gamer', 'Un casque de haute qualité pour une immersion totale.', 150.00, 95, 200),
  ('Carte Cadeau Steam 20€', '20€ à dépenser sur la boutique de jeux Steam.', 20.00, 70, 100);

  -- =================================================================
-- Trigger pour la création automatique du profil et du vaisseau
-- =================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Crée une ligne dans la table `profiles`
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, 'Prospector' || floor(random() * 100000)::text);

  -- Crée une ligne dans la table `ships`
  INSERT INTO public.ships (player_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

-- Le déclencheur qui appelle la fonction après la création d'un utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();