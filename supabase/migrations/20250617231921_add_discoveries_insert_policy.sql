CREATE POLICY "Les joueurs peuvent insérer leurs propres découvertes"
ON public.grid_discoveries
FOR INSERT
WITH CHECK (auth.uid() = player_id);