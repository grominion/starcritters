-- Cette fonction gère l'ajout d'un fragment à l'inventaire d'un joueur.
-- Elle insère une nouvelle ligne si le joueur n'a pas ce type de fragment,
-- ou incrémente la quantité de 1 si la ligne existe déjà.
create or replace function public.award_relic_fragment(
  p_player_id uuid,
  p_relic_id uuid
)
returns void as $$
begin
  insert into public.player_relic_fragments (player_id, relic_id, quantity)
  values (p_player_id, p_relic_id, 1)
  on conflict (player_id, relic_id)
  do update set quantity = player_relic_fragments.quantity + 1;
end;
$$ language plpgsql security definer;