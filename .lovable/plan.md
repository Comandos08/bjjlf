Fiz uma varredura somente leitura no código, logs do navegador, rede, servidor de preview e dados públicos. Encontrei alguns problemas claros que explicam por que “tudo fica sem atualização”.

Principais problemas encontrados:

1. O hero público não usa os slides do admin/banco
   - Existe `useHeroSlides()` em `src/lib/queries.ts`, mas a Home usa um array fixo `SLIDES` em `src/pages/HomePage.tsx`.
   - Resultado: alterar `/admin/hero` ou dados de `hero_slides` não muda o hero da página inicial.
   - Confirmei no banco que há slides ativos com `/src/assets/hero-1-mundial.jpg` e `/src/assets/hero-3-bjj.jpg`, mas a Home ainda renderiza slides hardcoded/Unsplash.

2. A chave de cache do hero está errada no admin
   - A query pública usa `queryKey: ["hero_slides"]`.
   - O admin invalida `queryKey: ["hero-slides"]`.
   - Mesmo se a Home usasse a query pública, salvar no admin não invalidaria a cache correta.

3. O cache-busting do registry não é aplicado a imports diretos de assets
   - `asset-registry.ts` aplica `?v=...` apenas quando a URL passa por `resolveAsset()` / `bustedAssetUrl()`.
   - Mas vários componentes importam assets direto, por exemplo `heroBlackBeltUrl`, `dragon-logo.png`, `youtube...jpg`, `news-european-open.jpg`.
   - Essas URLs não passam pelo registry, então podem não receber o token mostrado no painel.

4. Muitas imagens ainda usam `<img>` direto ou `backgroundImage` direto
   - Exemplos: `NewsPage`, páginas/admin previews, Navbar profile, logos, black belts, academies.
   - Elas não entram no `ImageDebugPanel` e nem sempre recebem cache-busting.
   - Isso faz parecer que o sistema “não detecta” ou “não atualiza”, porque só o que passa por `SafeImage` aparece no painel de debug de imagens.

5. A detecção “alterados desde último rebuild” depende de URL com hash, mas no dev as URLs locais são `/src/assets/...`
   - No preview/dev, Vite costuma servir assets importados como `/src/assets/arquivo.jpg`, sem hash de conteúdo.
   - O código compara `url.split('?')[0]`; se o caminho continua igual após substituir o arquivo, ele marca `0 changed`.
   - Eu vi no console: `[asset-cache-bust] tracking 9 assets · 0 changed`.
   - Ou seja: o painel lista assets, mas não consegue saber que o conteúdo mudou quando a URL base é igual.

6. O painel mostra só 9 assets porque só existem 9 arquivos em `src/assets/`
   - Isso está correto para assets locais, mas não cobre imagens externas/URLs do banco.
   - Várias imagens do site vêm de Unsplash, YouTube, perfis ou campos do banco; elas não fazem parte do registry de `src/assets/`.

7. Há uma imagem externa quebrando por ORB
   - No navegador, uma imagem Unsplash de evento falhou com `net::ERR_BLOCKED_BY_ORB`.
   - Isso não é diretamente cache do hero, mas contribui para a sensação de imagens inconsistentes.

8. Há um erro recorrente no log do dev-server sobre `tailwind.config.ts`
   - O servidor ainda sobe, mas o log mostra erro ao tentar gerar `tailwind.config.lov.json` porque `tailwind.config.ts` não existe.
   - Como o projeto usa Tailwind v4 via `src/styles.css`, isso parece ruído/compatibilidade do tooling, mas vou confirmar e não mexer sem necessidade se não afetar o build.

Plano de correção:

1. Centralizar resolução/cache-busting de qualquer URL de imagem/asset
   - Criar/ajustar helpers em `src/lib/asset-registry.ts` para:
     - resolver `/src/assets/<arquivo>` e nomes simples via registry;
     - aplicar token dev a URLs locais resolvidas;
     - aplicar cache-busting também a URLs absolutas externas em preview, sem quebrar produção;
     - expor metadados úteis para o painel: URL original, URL final, origem (`registry`, `external`, `unknown`).

2. Fazer a Home usar `useHeroSlides()` de verdade
   - Substituir o array fixo do hero por dados vindos de `hero_slides`.
   - Manter fallback local/hardcoded se o banco estiver vazio ou indisponível.
   - Preservar texto, botões, thumbs e rotação atual.
   - Garantir que os caminhos `/src/assets/...` vindos do banco sejam resolvidos e cache-busted.

3. Corrigir a invalidação do admin
   - Trocar a chave pública do hero de `"hero-slides"` para `"hero_slides"` em `useUpsertHero`, `useDeleteHero` e `useToggleHeroField`.
   - Revisar as outras chaves públicas para garantir que `events`, `news`, `academies`, `rankings`, `youtube_videos` invalidam exatamente as queries usadas.

4. Aplicar cache-busting nos pontos que hoje usam `<img>` direto para conteúdo variável
   - Converter áreas públicas importantes para `SafeImage` ou passar a URL por um helper/hook central:
     - `NewsPage` featured e cards;
     - previews/admin de hero, notícias, eventos, academias, black belts e YouTube;
     - imagens de perfil/academia/black belt quando vierem do banco.
   - Para logos/assets estáticos importados diretamente, aplicar `bustedAssetUrl()` ou `resolveAsset()` onde fizer sentido.

5. Melhorar detecção de “arquivo alterado” no preview
   - Como em dev a URL pode continuar `/src/assets/arquivo.jpg`, não dá para detectar mudança de conteúdo apenas comparando URL base.
   - Vou alterar a estratégia para comparar uma assinatura mais confiável no navegador:
     - manter URL final com token;
     - quando possível, fazer `HEAD`/`fetch` leve dos assets locais e registrar `last-modified`, `etag`, `content-length` ou uma assinatura derivada;
     - salvar snapshot no `localStorage`.
   - Assim, trocar `hero-1-mundial.jpg` por outro arquivo com mesmo nome deve aparecer como alterado.

6. Melhorar o painel de debug
   - Mostrar separadamente:
     - assets locais descobertos em `src/assets/`;
     - URLs externas/cache-busted vistas em componentes públicos;
     - assets alterados desde último snapshot;
     - token aplicado;
     - URL original e URL final.
   - Adicionar botão para “recalcular snapshot”/“limpar snapshot” para testes rápidos.
   - Fazer o painel indicar quando a detecção por conteúdo não conseguiu ler headers, em vez de simplesmente mostrar `0 changed`.

7. Corrigir o problema de imagens externas inconsistentes
   - Para a imagem que falha com ORB e outras Unsplash problemáticas, trocar por fallback local ou garantir que `SafeImage` mostre fallback limpo.
   - Não vou substituir todo conteúdo visual sem sua aprovação, mas vou impedir que falhas silenciosas confundam o diagnóstico.

8. Validação pós-implementação
   - Verificar no preview:
     - console com `[asset-cache-bust]` listando token e URLs finais;
     - painel exibindo assets locais e URLs externas;
     - hero vindo dos slides ativos do banco;
     - ao salvar hero/notícia no admin, query pública invalidada corretamente;
     - imagens públicas com token em preview e sem token em produção.

Se você aprovar, implemento essas correções agora.