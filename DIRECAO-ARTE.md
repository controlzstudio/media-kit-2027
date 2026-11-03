# Direção de arte: Mídia Kit 2027, Dennis Santana / Control Z Studio

## Origem
Redesign do mídia kit 2026, feito a partir do briefing do Dennis (paleta, comportamento por seção e textos PT/EN).

## Conceito
Branding sem firula com rock ao fundo. O clima é de palco: fundo quase preto com luz roxa, nome em caixa alta gigante e movimento constante, sem ficar barulhento.

## Paleta (valores em src/styles/tokens.css)
- Fundo: #120f14 (página), #16121a (faixa de Formatos), #1d1820 (cards), #262029 (card em hover)
- Divisórias: #2a2430 e #2e2733; contorno de botão #4a3f50
- Texto: #f4f0f6 (principal), #b9afbe (parágrafos), #a99fae (rótulos)
- Roxo: #8e3fa8 (botão, barras, bordas), #a452c2 (hover), #c58be0 (kickers e números), #5e2d70 (barras não selecionadas)
- Rosa: #f2a7cb (dado de Mulheres)

## Tipografia
Space Grotesk (400–700), servida localmente. Títulos em 700, tracking de -0,03em a -0,045em, entrelinha de 0,9 a 1. Kickers com 13px, 700, caixa alta e tracking de 0,2em.

## Forma e ritmo
- Botões com raio de 4px e altura de 52px (60px no CTA final); cards com raio de 8px e sem borda
- Largura máxima de 1200px e 24px de respiro lateral
- Alvos de toque com no mínimo 44px

## Hero
Nome em duas linhas à esquerda. À direita, a foto em moldura circular com anel de texto girando, anel pontilhado no sentido contrário e chips com os seguidores. Ao fundo, o nome vazado rolando.

## Movimento
- Reveal no scroll com `animation-timeline: view()`, com IntersectionObserver como fallback
- Contadores e gráficos animam uma vez, ao entrar na tela
- Só `transform` e `opacity`; tudo desliga com `prefers-reduced-motion`

## Evitar
- Emoji no lugar de ícone (usar SVG em traço)
- Número decorativo de fundo
- Gradiente colorido fora da família roxa
