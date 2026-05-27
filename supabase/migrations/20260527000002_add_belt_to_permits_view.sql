-- Adiciona belt/belt_degree diretamente em academy_permits
-- para que a faixa do professor apareça mesmo sem perfil de atleta vinculado.

ALTER TABLE public.academy_permits
  ADD COLUMN IF NOT EXISTS belt text,
  ADD COLUMN IF NOT EXISTS belt_degree integer DEFAULT 0;

-- Atualiza a view pública para expor os novos campos
CREATE OR REPLACE VIEW public.affiliated_academies_view AS
SELECT
  id,
  academy_name    AS name,
  academy_logo_url AS logo_url,
  city, state, country, country_code, country_flag,
  phone, website, instagram, athlete_id,
  responsible_name AS professor,
  issued_at        AS approved_at,
  expires_at, permit_number,
  belt, belt_degree
FROM public.academy_permits
WHERE status = 'active';

GRANT SELECT ON public.affiliated_academies_view TO anon, authenticated;
