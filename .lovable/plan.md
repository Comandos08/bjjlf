
## Problema

No mobile (390px), o hero da home usa `aspectRatio: 20/9`, o que dá uma altura de só ~175px. Dentro desse espaço estão empilhados: tag vermelha, título grande (mínimo 48px), subtítulo, badges e 2 botões de CTA. Resultado: título e CTAs ficam cortados pela barra de thumbnails na base.

## Correção proposta (apenas CSS, sem mudar conteúdo)

**`src/pages/HomePage.tsx` — `<HeroSlider />` (~linha 104-167):**

1. **Altura responsiva** — manter `20/9` no desktop, mas no mobile usar uma proporção mais alta e min-height adequado:
   - Mobile: `aspect-[4/5]` com `min-height: 560px`
   - Desktop (md+): manter `aspect-[20/9]` com `max-height: 720px`

2. **Tipografia do título** — reduzir o piso do `clamp` para caber bem no mobile sem espremer:
   - `clamp(36px, 8vw, 96px)` em vez de `clamp(48px, 7vw, 96px)`

3. **Subtítulo no mobile** — `text-base` no mobile, `text-lg` em md+ (atualmente fixo `text-lg`).

4. **Padding interno** — adicionar `py-20 md:py-0` para o conteúdo respirar acima dos thumbs no mobile.

5. **Gradiente** — no mobile o gradiente horizontal (40% preto → transparente à direita) deixa o texto pouco legível porque o conteúdo agora ocupa altura cheia. Trocar para um gradiente vertical no mobile (`to top`, preto embaixo) e manter o horizontal no desktop.

6. **Barra de thumbs (~linha 280)** — verificar se a `bottom-[88px]` dos dots ainda faz sentido com a nova altura; se a barra de thumbs for ocultada ou reduzida no mobile, ajustar.

## Fora do escopo

- Não mexer em conteúdo, traduções, dados do slider nem em outros componentes.
- Não tocar em desktop/tablet acima de `md` além do necessário.

Confirma que ataco só esses ajustes?
