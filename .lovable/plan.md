# Ajuste do hero para 1600×720 (proporção 20:9)

## Situação atual

O container do hero em `src/pages/HomePage.tsx` (linha 95) usa altura fixa:

```tsx
style={{ height: "560px" }}
```

A imagem é renderizada com `object-cover` em largura total da viewport, então hoje a proporção exibida varia conforme a largura da tela (em 1812px de largura → ~3.24:1, bem mais "panorâmico" que 1600×720).

Para casar com 1600×720 (≈ **20:9** ou **2.22:1**), troco a altura fixa por uma proporção CSS.

## Mudança

**Arquivo:** `src/pages/HomePage.tsx` (linha 95)

Substituir:
```tsx
style={{ height: "560px" }}
```

por:
```tsx
style={{ aspectRatio: "20 / 9", maxHeight: "720px" }}
```

- `aspectRatio: 20/9` faz o container respeitar exatamente a proporção das imagens 1600×720, eliminando o corte lateral/vertical inesperado.
- `maxHeight: 720px` evita que em telas muito largas (>1600px) o hero fique gigante — trava no tamanho nativo da imagem.
- Em telas estreitas o hero fica proporcionalmente menor (ex.: 1200px → ~540px de altura; 768px → ~345px), o que é mais natural que forçar 560px.

## Atualizar a recomendação no admin (opcional)

Hoje não há texto de recomendação visível no formulário do hero — então nenhuma mudança de cópia é necessária. Se quiser, posso adicionar uma nota "Recomendado: 1600×720 (JPG)" no `ImageUploader` da tela `/admin/hero`.

## O que NÃO muda

- Imagens já cadastradas continuam funcionando (são exibidas com `object-cover`).
- Layout do conteúdo sobreposto (título, badges, CTAs, thumbs) permanece igual — só a altura do "palco" muda.
- Nenhuma mudança em banco de dados, queries ou lógica.

## Pergunta antes de implementar

Você prefere:

- **(A)** Aspect-ratio 20/9 com `maxHeight: 720px` (recomendado — fiel ao 1600×720, responsivo).
- **(B)** Altura fixa **720px** em todas as telas (mais "alto" que hoje, mas sem variação).
- **(C)** Manter altura fixa, só mudar o número (ex.: 600px) — sem aspect-ratio.
