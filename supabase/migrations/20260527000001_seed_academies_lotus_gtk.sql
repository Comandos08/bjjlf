-- Cadastro manual de academias afiliadas
-- Execute este script no Supabase SQL Editor (Dashboard > SQL Editor)
-- O trigger trg_generate_academy_permit_number gera o permit_number automaticamente.

-- 1. Lotus Club Brazilian Jiu-Jitsu Milano (Itália)
INSERT INTO public.academy_permits (
  academy_name,
  responsible_name,
  email,
  phone,
  address,
  city,
  state,
  country,
  country_code,
  country_flag,
  status,
  amount_cents
) VALUES (
  'Lotus Club Brazilian Jiu-Jitsu Milano',
  'Ricardo Luís Carpentieri Mendes',
  'cuordileonebjj@gmail.com',
  '+39 3313188503',
  'Via Napo Torriani 19, 20124 Milano',
  'Milano',
  'MI',
  'Itália',
  'IT',
  '🇮🇹',
  'active',
  0
);

-- 2. Rio Jiu-Jitsu Old School (Brasil)
-- NOTA: confirmar e-mail e telefone com a academia antes de aplicar
INSERT INTO public.academy_permits (
  academy_name,
  responsible_name,
  email,
  address,
  city,
  state,
  country,
  country_code,
  country_flag,
  notes,
  status,
  amount_cents
) VALUES (
  'Rio Jiu-Jitsu Old School',
  'José Roberto Camargo',
  'contato@riojjoldschool.com.br',    -- PLACEHOLDER: confirmar e-mail
  'Av. Marechal Henrique Lott 120, Sala 204, Barra da Tijuca',
  'Rio de Janeiro',
  'RJ',
  'Brasil',
  'BR',
  '🇧🇷',
  '2ª unidade: Estrada dos Bandeirantes 22.774, Vargem Grande – Faixa Preta 6º Grau',
  'active',
  0
);

-- 3. GTK Academy of Martial Arts (EUA)
-- NOTA: confirmar e-mail com a academia antes de aplicar
INSERT INTO public.academy_permits (
  academy_name,
  responsible_name,
  email,
  phone,
  address,
  city,
  state,
  country,
  country_code,
  country_flag,
  website,
  status,
  amount_cents
) VALUES (
  'GTK Academy of Martial Arts',
  'Godfrey Allen Knowles',
  'info@gtkmartialartsacademy.com',
  '(571) 322-1722',
  '2105 Palm Bay Road NE #8, Palm Bay, FL 32905',
  'Palm Bay',
  'FL',
  'EUA',
  'US',
  '🇺🇸',
  'https://gtkmartialartsacademy.com/',
  'active',
  0
);
