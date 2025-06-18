-- Ceci est le fichier de remplissage. Il sera exécuté après les migrations
-- lors d'un `supabase db reset`.

-- 1. On insère les reliques de base
INSERT INTO public.relics (id, name, description, value_usd, desirability_score, total_fragments)
VALUES
    ('8f5c8f8b-327c-4a95-8a2b-28a6f42b3a32', 'Casque Audio Pro-Gamer', 'Un casque de haute qualité pour une immersion totale.', 150.00, 95, 200),
    ('e2d4f8c1-6b2c-4a39-8e4a-5b1f3c3d3a31', 'Carte Cadeau Steam 20€', '20€ à dépenser sur la boutique de jeux Steam.', 20.00, 70, 100)
ON CONFLICT (id) DO NOTHING;


-- 2. On insère un rapport économique pour que la fonction "Central Bank" puisse être testée
INSERT INTO public.daily_economic_reports (report_date, total_revenue_usd, active_players)
VALUES
    (CURRENT_DATE - INTERVAL '1 day', 1000.00, 150)
ON CONFLICT (report_date) DO NOTHING;


-- 3. On insère directement une grille de jeu pour aujourd'hui, pour que le frontend ait quelque chose à charger
INSERT INTO public.daily_grids (grid_date, mystery_image_theme, mystery_image_url, grid_distribution)
VALUES
    (CURRENT_DATE, 'A raccoon discovering a crystal cave', 'https://example.com/image.png',
    '{
        "10_15": { "relic_id": "e2d4f8c1-6b2c-4a39-8e4a-5b1f3c3d3a31" },
        "25_40": { "relic_id": "8f5c8f8b-327c-4a95-8a2b-28a6f42b3a32" },
        "5_5": { "relic_id": "e2d4f8c1-6b2c-4a39-8e4a-5b1f3c3d3a31" }
    }')
ON CONFLICT (grid_date) DO NOTHING;