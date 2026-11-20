# Auditoria de UI/UX do Planfin (20/11/2026)

App rodando local (Postgres em docker, dados falsos de um casal: conta corrente, cartão, mesada, vale, ~25 lançamentos em novembro), testado em 390px (PWA no celular) e em 1280px (desktop). Todas as imagens estão em [`img/`](img/).

## Telas capturadas

| Tela | Celular (390px) | Desktop |
|---|---|---|
| Login | [mobile-00-login](img/mobile-00-login.png) | — |
| Hoje | [mobile-01-hoje](img/mobile-01-hoje.png) | [desktop-01-hoje](img/desktop-01-hoje.png) |
| Histórico | [mobile-02-historico](img/mobile-02-historico.png) | [desktop-02-historico](img/desktop-02-historico.png) |
| Contas | [mobile-03-contas](img/mobile-03-contas.png) | [desktop-03-contas](img/desktop-03-contas.png) |
| Dashboard | [mobile-04-dashboard](img/mobile-04-dashboard.png) | [desktop-04-dashboard](img/desktop-04-dashboard.png) |
| Categorias | [mobile-05-categorias](img/mobile-05-categorias.png) | [desktop-05-categorias](img/desktop-05-categorias.png) |
| Editar gasto (antes) | [antes-2-editar-sai-da-tela](img/antes-2-editar-sai-da-tela.png) | — |
| Novo gasto (antes) | [antes-3-novo-gasto-pela-home](img/antes-3-novo-gasto-pela-home.png) | — |
| Fatura (antes) | [antes-7-fatura](img/antes-7-fatura.png) | — |

## Os 5 problemas que mais pesam

1. **Conciliar com o extrato obriga a sair do histórico.** Não havia como lançar a partir do histórico; o gasto que faltava era criado pelo botão da Home, e editar um valor abria outra tela. A volta recarregava a lista. Na fatura do cartão os lançamentos nem tinham data, então não dava para bater com a fatura do banco. *(Corrigido neste PR, ver abaixo.)*
2. **Excluir é fácil demais e fica colado no valor.** Cada linha do histórico tem um ✕ vermelho logo ao lado do valor, e um toque apagava o lançamento sem pedir confirmação. Num fluxo de conferência, em que se toca na linha o tempo todo, isso é um acidente esperando para acontecer. *(Neste PR o ✕ passou a pedir confirmação; o plano propõe tirá-lo da linha.)*
3. **A Home mostra números que brigam entre si.** "Posso gastar R$ 3.840,27" (verde, grande) e logo abaixo "Disponível hoje R$ 1.334,16" (roxo, maior ainda). São duas respostas para a mesma pergunta, e a mais destacada (o cartão roxo) não é a mais útil no dia. Os dois botões flutuantes (+ Receita, +) cobrem o card "Mesada do ciclo".
4. **Filtros comem um terço da tela.** No histórico, três fileiras de chips (conta, entrada/saída, tipo) ocupam ~140px antes do primeiro lançamento, e a fileira de contas corta na borda sem indicar que rola. "Período: Nov 2026 – Nov 2026" repete o mês.
5. **Inconsistência visual geral.** Valores aparecem em formatos diferentes ("R$ 10.607,00" no resumo e "+R$ 10607,00" na linha, sem separador de milhar); emojis como ícones de navegação e de conta (🏠 📋 💳 🏦) misturados com ícones vetoriais nas categorias; rótulos em CAIXA ALTA em todo card; quatro estilos de botão primário (gradiente, sólido, pílula, link); no desktop tudo estica a 100% da largura (lista de 1.900px com o valor longe do nome).

## Lista completa

### Visual
- **Hierarquia de números.** Cada card tem um número enorme; nada guia o olho. Na Home há 6 valores em destaque na primeira dobra.
- **Formatação de moeda.** `ExpenseRow` usa `toFixed(2).replace(".", ",")` (sem milhar) enquanto o resto usa `formatMoney`. Total do dia mostra "-R$ 11,00" com sinal para gastos, que são a maioria; o sinal deveria marcar a exceção (entrada).
- **Datas.** Histórico mostra "20/11/2026" sem dia da semana; o extrato do banco mostra "qua, 20/11". *(Corrigido neste PR.)*
- **Linhas.** A última linha de cada card tem borda inferior (linha dupla com a borda do card). Título "Alimentação - Restaurante" quebra em duas linhas a 390px, empurrando o valor.
- **Receita sem categoria** vira "Sem categoria" com um ponto verde e quebra em duas linhas ao lado do selo "Receita".
- **Cards demais.** Tudo é card branco com raio 24 e sombra roxa, inclusive o seletor Diário/Total e os blocos de 1 número. Fica pesado e sem diferenciação.
- **Campo de valor** tinha um contorno preto do navegador dentro da borda roxa quando focado. *(Corrigido neste PR.)*
- **Categorias**: "3 subcats", lápis e ✕ vermelho lado a lado em toda linha; selo "Despesa" esticado em barra rosa.
- **Desktop**: sem largura máxima; o app é um layout de celular esticado.
- **Erro no console**: `ExpoSecureStore.getValueWithKeyAsync is not a function` em todo carregamento web (alguma chamada direta ao SecureStore fora do `storage.ts`).

### Usabilidade
- **Formulário de gasto longo**: valor, data, 5 contas, 11 opções de parcela, 6 categorias, subcategorias, 2 interruptores e nota, tudo numa coluna. As parcelas aparecem antes da categoria, que é o que se escolhe em quase todo gasto.
- **Editar não mostrava a categoria**: o histórico abria a edição sem categoria marcada (só a subcategoria estava salva), então trocar de subcategoria exigia escolher a categoria de novo. *(Corrigido neste PR.)*
- **Sem retorno após salvar/excluir** no histórico (a lista simplesmente mudava). *(Toasts adicionados neste PR.)*
- **Ações principais escondidas**: "Lançar compra antiga ou ajuste na fatura" e "Trazer gastos já lançados" ficam no fim da tela do cartão, abaixo de um gráfico vazio.
- **Barra de abas com 5 itens** sendo "Categorias" um deles: é configuração, usada raramente; poderia ir para o perfil e liberar espaço para "Fatura" ou um botão central de lançar.
- **Estados vazios** só dizem "Nenhum gasto registrado ainda." sem ação.

## Plano priorizado

### Já entregue neste PR (dor principal)
- Histórico: botão **+ Lançar** no topo e em cada dia; abre uma folha (bottom sheet) sobre a lista com o dia e a conta do filtro já preenchidos; Gasto/Receita na própria folha.
- Tocar num lançamento abre a edição **na mesma folha**; salvar atualiza a lista no lugar, mantendo rolagem e filtros.
- Fatura do cartão: lançamentos **agrupados por dia** ("qua, 05/11"), mais recente primeiro, parcela "2/10" visível, + Lançar por dia e edição na folha.
- Confirmação antes de excluir pelo ✕; toasts de "Gasto registrado", "Alteração salva", "Lançamento excluído".

### Ganhos rápidos (1–2 dias cada) — entregues no CX-66, ver [abaixo](#ganhos-rápidos-cx-66)
1. Uma função só de moeda (`formatMoney`) em todo lugar, com milhar; sinal só em entradas.
2. Tirar o ✕ das linhas do histórico (excluir fica dentro da folha de edição, que já confirma).
3. Filtros do histórico numa linha só: "Conta ▾ · Tipo ▾" com um seletor compacto; chips só quando há filtro ativo, com "limpar".
4. Home: um número herói só ("Disponível hoje"), "Posso gastar" vira linha secundária; um único botão flutuante "+ Lançar" que abre a mesma folha (Gasto/Receita).
5. Ordem do formulário: valor → categoria → conta → data → resto em "Mais opções" (parcelas, fora do orçamento, extra, nota).
6. Largura máxima de 560px no desktop, centralizado.
7. Corrigir a chamada a `SecureStore` no web.

### Redesenho (1–2 semanas)
1. Aplicar os tokens abaixo num `theme/` único e trocar os estilos inline pelos componentes `Card`, `ListRow`, `MoneyText`, `Button`.
2. Trocar emojis por um conjunto de ícones vetoriais (o mesmo das categorias).
3. Reorganizar a navegação: Hoje · Histórico · [+] · Contas · Painel; Categorias vai para o perfil.
4. Folha de lançamento como padrão do app inteiro (Home, histórico, fatura, conta), aposentando as telas modais de criar/editar.

## Direção visual: "extrato da casa"

O dono confere o app contra o extrato do banco e contra o papel. A identidade deveria vir daí: **o app é um extrato bem impresso**, não um painel de SaaS. Linhas densas e alinhadas, números em coluna com dígitos de largura fixa, datas no formato do extrato, e um único lugar com cor forte. O roxo atual continua como marca, mas sai dos fundos em gradiente e vira só a cor da ação.

O que muda em relação ao que existe: menos cards (um bloco por dia, não um card por número), sem gradientes, sem CAIXA ALTA nos rótulos, sombra quase nenhuma, raio menor. O ousado fica num ponto só: o número do dia na Home, grande, em dígitos tabulares.

### Cores

| Token | Hex | Uso |
|---|---|---|
| `ink` | `#1C1A2E` | texto principal, valores |
| `paper` | `#F6F5FA` | fundo das telas |
| `sheet` | `#FFFFFF` | blocos, folhas, campos |
| `rule` | `#E4E1EE` | divisórias de 1px, bordas de campo |
| `muted` | `#6A6785` | texto secundário (contraste AA sobre `paper` e `sheet`) |
| `accent` | `#4B3FD1` | botão primário, links, seleção (roxo atual escurecido para AA com texto branco) |
| `accent-soft` | `#ECEAFC` | fundo de chip selecionado, botão secundário |
| `income` | `#0E7F57` | entradas (só o valor; nada de card verde) |
| `danger` | `#C2372C` | excluir, estourou o limite |

Gastos ficam em `ink` (são a regra); só a entrada ganha cor e sinal "+".

### Tipografia
- Uma família: **Manrope** (Google Fonts), que tem números largos e legíveis e personalidade sem ser "tech". Fallback do sistema.
- Valores sempre com `font-variant-numeric: tabular-nums` para alinhar em coluna, como no extrato.
- Escala (px): **12** legenda · **14** texto de linha / secundário · **16** texto base e campos · **20** título de tela · **28** valor de destaque · **44** número herói (só na Home). Pesos: 500 texto, 600 títulos de linha, 700 valores e títulos de tela. Rótulos em caixa normal (sentence case), nunca CAIXA ALTA espaçada.

### Espaçamento e forma
- Base 4: `4 · 8 · 12 · 16 · 24 · 32`. Margem lateral de tela 16; entre blocos 16; dentro do bloco 16; altura de linha de lista 56.
- Raio: `8` campos e botões, `12` blocos, `20` só no topo da folha, `full` só em chips.
- Sombra: nenhuma nos blocos (a divisória e o fundo `paper` já separam); sombra só na folha e no botão flutuante.

### Componentes
- **Bloco de dia (lista)**: cabeçalho fora do bloco — "qua, 05/11" à esquerda em 14/600, total do dia à direita em 14 tabular, "+ Lançar" como ícone. Dentro, linhas sem card próprio, separadas por `rule`, sem borda na última.
- **Linha**: ícone 32 (vetorial, fundo da cor da categoria a 12%), título 14/600 numa linha só (com reticências), detalhe 12 `muted` ("Banco Azul · 2/10 · Feira"), valor 16/700 tabular alinhado à direita. Selos (Recorrente, Receita) viram texto 12 no detalhe, não pílulas coloridas.
- **Botão primário**: sólido `accent`, texto branco 16/600, altura 48, raio 8, sem gradiente. **Secundário**: `accent-soft` com texto `accent`. **Destrutivo**: texto `danger` sem fundo, sempre com confirmação.
- **Folha (bottom sheet)**: o padrão para criar e editar qualquer lançamento; 90% da altura no celular, 560px centralizada no desktop; botão de salvar fixo no rodapé.
- **Chips**: só para escolha única curta (Gasto/Receita, contas); altura 36, raio full.

## Depois (este PR)

| | Antes | Depois |
|---|---|---|
| Histórico | [antes-1](img/antes-1-historico-rolado.png) | [depois-1: + Lançar no topo e em cada dia](img/depois-1-historico-com-lancar.png) |
| Lançar | [antes-3: só pela Home, outra tela](img/antes-3-novo-gasto-pela-home.png) | [depois-2: folha sobre a lista](img/depois-2-folha-novo-lancamento.png) · [depois-3: dia e conta já preenchidos](img/depois-3-folha-preenchida.png) · [depois-4: salvo no lugar, mesma rolagem](img/depois-4-salvo-no-lugar.png) |
| Editar valor | [antes-2: abre outra tela, sem categoria marcada](img/antes-2-editar-sai-da-tela.png) | [depois-5: edição na folha](img/depois-5-editar-na-folha.png) · [depois-6: valor ajustado na lista](img/depois-6-valor-ajustado.png) |
| Fatura | [antes-7: sem data](img/antes-7-fatura.png) | [depois-7: por dia, com data e parcela](img/depois-7-fatura.png) · [depois-8: lançar no dia da fatura](img/depois-8-fatura-lancar-no-dia.png) |
| Desktop | — | [folha centralizada](img/desktop-depois-2-folha-novo-lancamento.png) |

GIF do fluxo de conciliação: [depois-fluxo-conciliacao.gif](img/depois-fluxo-conciliacao.gif)

## Ganhos rápidos (CX-66)

| | Antes | Depois |
|---|---|---|
| Home: um número herói, "Posso gastar" como linha, um só "+ Lançar" | [antes](img/ganhos-antes-home.png) | [depois](img/ganhos-depois-home.png) · [fim da rolagem, nada cobre a Mesada](img/ganhos-depois-home-fim.png) · [+ Lançar abre a folha](img/ganhos-depois-home-folha.png) |
| Histórico: filtros numa linha, sem ✕, "Período: Nov 2026" | [antes](img/ganhos-antes-historico.png) | [depois](img/ganhos-depois-historico.png) · [seletor "Tipo"](img/ganhos-depois-filtro-tipo.png) · [chips só dos filtros ativos + limpar](img/ganhos-depois-filtros-rolado.png) |
| Formulário: valor → categoria → conta → data → Mais opções | — | [editar (abre "Mais opções" quando há nota/extra/parcelas)](img/ganhos-depois-editar.png) · [parcelas dentro de "Mais opções"](img/ganhos-depois-mais-opcoes.png) |
| Desktop: coluna de 560px centralizada | [Home](img/ganhos-antes-desktop-home.png) · [Histórico](img/ganhos-antes-desktop-historico.png) | [Home](img/ganhos-depois-desktop-home.png) · [Histórico](img/ganhos-depois-desktop-historico.png) · [folha](img/ganhos-depois-desktop-folha.png) |

- **Moeda**: `formatMoney` (em `src/lib/money.ts`) é o único formatador, com milhar. Modos de sinal: `auto` (saldos, "-" só se negativo), `flow` (lançamentos: "+" na entrada, gasto sem sinal) e `always` (diferenças e conta do planejamento).
- **Excluir**: só dentro da folha de edição, como texto vermelho e sempre com confirmação (antes o gasto avulso era excluído sem perguntar).
- **Console web**: a moeda escolhida era lida direto do `expo-secure-store`, que não existe no web; agora passa por `storage.ts`.

## Redesenho, fase 1 (CX-67): tema único e componentes base

Os tokens acima viraram um módulo só, `mobile/src/theme/`, e as telas mais usadas (Hoje, Histórico, Fatura e a folha de lançamento) foram reescritas com componentes, sem estilo inline. As outras telas seguem no visual antigo até a fase 2.

**Tema** (`import { palette, textVariants, space, layout, radius, shadow } from "src/theme"`)
- `colors.ts`: a paleta "extrato da casa", com o contraste de cada cor de texto anotado (todas passam AA, 4,5:1, sobre `paper` e `sheet`; texto branco sobre `accent` 7,2:1).
- `typography.ts`: Manrope com fallback do sistema, escala 12 · 14 · 16 · 20 · 28 · 44, `tabularNums`. No web a fonte vem do Google Fonts (`public/index.html`, `display=swap`); no nativo, do `@expo-google-fonts/manrope` via expo-font (o bundle web não carrega os .ttf).
- `spacing.ts` (base 4, margem 16, linha 56, coluna 560), `shape.ts` (raio 8/12/20/full; sombra só na folha e no botão flutuante).
- `tokens.ts` ficou com o legado (`Colors`, `Shadow`…) para as telas ainda não migradas; `Ledger` e `TABULAR_NUMS` agora são apelidos do tema.

**Componentes** (`mobile/src/components/ui/`)
- `AppText` (variantes da escala), `MoneyText` (moeda com dígitos tabulares; cor pelo sinal opcional), `Block` / `ListBlock` (bloco branco sem sombra; linhas separadas por `rule`, sem borda na última), `ListRow` (ícone 32, título numa linha, detalhe 12, valor à direita), `DayHeader` / `SectionHeader` ("qua, 05/11", total do dia, "+" como ícone), `Button` (primário sólido, secundário accent-soft, destrutivo só texto), `Chip` / `ChipGroup` (36 de altura, raio full), `Sheet` / `SheetFooter` (folha com botão de salvar fixo no rodapé), `IconButton`, `ScreenHeader`, `EmptyState`.
- Selos "Receita" e "Recorrente" viraram palavras no detalhe da linha. Rótulos sem CAIXA ALTA, nenhum gradiente nas telas migradas.

**Fluxos conferidos** (local, dados falsos): filtrar por conta, rolar, "+" num dia → folha com dia e conta preenchidos → salvar: a linha aparece no lugar, filtro e rolagem mantidos ([depois](img/f1-fluxo-salvo-no-lugar.png)); editar valor na folha; excluir pela folha pede confirmação, cancelar mantém, aceitar remove ([folha](img/f1-fluxo-excluir-na-folha.png)); "+" na fatura abre com o cartão marcado; Home: Diário/Total, seletor de período em folha ([seletor](img/f1-depois-mobile-seletor-periodo.png)), "Lançar" com Gasto/Receita.

| Tela | Antes | Depois |
|---|---|---|
| Hoje (390) | [topo](img/f1-antes-mobile-hoje.png) · [fim](img/f1-antes-mobile-hoje-fim.png) | [topo](img/f1-depois-mobile-hoje.png) · [fim](img/f1-depois-mobile-hoje-fim.png) |
| Histórico (390) | [antes](img/f1-antes-mobile-historico.png) | [depois](img/f1-depois-mobile-historico.png) |
| Folha: novo (390) | [antes](img/f1-antes-mobile-folha-nova.png) | [depois](img/f1-depois-mobile-folha-nova.png) |
| Folha: editar (390) | [antes](img/f1-antes-mobile-folha-editar.png) | [depois](img/f1-depois-mobile-folha-editar.png) |
| Fatura (390) | [topo](img/f1-antes-mobile-fatura.png) · [lista](img/f1-antes-mobile-fatura-lista.png) | [topo](img/f1-depois-mobile-fatura.png) · [lista](img/f1-depois-mobile-fatura-lista.png) |
| Hoje (1280) | [antes](img/f1-antes-desktop-hoje.png) | [depois](img/f1-depois-desktop-hoje.png) |
| Histórico (1280) | [antes](img/f1-antes-desktop-historico.png) | [depois](img/f1-depois-desktop-historico.png) |
| Fatura (1280) | [antes](img/f1-antes-desktop-fatura.png) | [depois](img/f1-depois-desktop-fatura.png) |
| Folha (1280) | [antes](img/f1-antes-desktop-folha-editar.png) | [depois](img/f1-depois-desktop-folha-editar.png) |

**Fica para a fase 2**: emojis ainda nas abas (🏠 📋 💳), nas contas dos chips "Pago com" (🏦 💳) e na tela de Contas; telas não migradas (Contas, detalhe de conta/cartão, Painel, Categorias, Perfil, formulários de fixas, transferência, salário, planejamento) ainda usam `Card`, `Btn` com gradiente, `FieldInput` com CAIXA ALTA e `Colors` legados. `Card`, `Btn`, `FieldInput` e `Colors` saem quando a última tela migrar. O cabeçalho das telas empilhadas (react-navigation) ainda usa a fonte do sistema.

## Redesenho, fase 2 (CX-68): ícones vetoriais e tema no app inteiro

- **Um conjunto de ícones**: Material Community Icons (o mesmo das categorias) via `components/ui/Icon`. Saíram todos os emojis: abas (contorno em repouso, cheio na aba atual), tipos de conta (`ACCOUNT_KIND_ICON` virou nome de ícone, usado nos chips "Pago com", em Contas e no formulário de conta), botões de Contas, Perfil, Grupos, Onboarding, Planejamentos, Categorias (lápis e lixeira), toasts, setas de mês (`MonthStepper`), "Voltar" (`BackLink`) e bandeiras de moeda (viraram o símbolo).
- **Tema em todas as telas**: `Card` → `Block`, `Btn` com gradiente → `Button`, `Colors`/`Radius`/`Shadow` → `palette`/`radius`/`shadow`. `FieldInput` sem CAIXA ALTA (rótulo 14/600 `muted`, campo 48, borda `rule` → `accent` no foco). Nenhum rótulo em caixa alta espaçada; textos de 10–11px subiram para 12 (mínimo da escala).
- **Manrope em tudo**: `components/ui/Text` e `TextInput` substituem os do react-native nas telas antigas (mantêm tamanho e peso, trocam a família). Cabeçalhos do react-navigation e barra de abas em Manrope e cores do tema; Perfil, Convites e Planejamentos usam o cabeçalho padrão no lugar dos cabeçalhos com gradiente.
- **Aba "Dashboard" → "Painel"** (só o rótulo; a reorganização da navegação é a fase 3).
- **Removidos**: `Card`, `Btn`, `ProfileMenuItem`, `TabHeader`, `PlanTotal` (sem uso), `theme/tokens.ts` e a dependência `expo-linear-gradient`. As cores de categoria foram para `theme/colors.ts` (`categoryColor`), com tokens novos `incomeSoft`, `dangerSoft`, `warning`, `warningSoft` (contraste AA anotado).
- **Correção de passagem**: o Painel no desktop decidia o layout largo pela largura da janela (1280) e não pela coluna (560), quebrando o título letra a letra; agora usa a largura da coluna.

| Tela (390px) | Capturas |
|---|---|
| Login | [antes](img/f2-antes-mobile-login.png) · [depois](img/f2-depois-mobile-login.png) |
| Hoje | [antes](img/f2-antes-mobile-hoje.png) · [depois](img/f2-depois-mobile-hoje.png) |
| Contas | [antes](img/f2-antes-mobile-contas.png) · [depois](img/f2-depois-mobile-contas.png) |
| Conta (detalhe) | [antes](img/f2-antes-mobile-conta-detalhe.png) · [depois](img/f2-depois-mobile-conta-detalhe.png) |
| Cartão | [antes](img/f2-antes-mobile-cartao-detalhe.png) · [depois](img/f2-depois-mobile-cartao-detalhe.png) |
| Nova conta | [antes](img/f2-antes-mobile-conta-nova.png) · [depois](img/f2-depois-mobile-conta-nova.png) |
| Ajustar saldo | [antes](img/f2-antes-mobile-ajustar-saldo.png) · [depois](img/f2-depois-mobile-ajustar-saldo.png) |
| Fixas | [antes](img/f2-antes-mobile-fixas.png) · [depois](img/f2-depois-mobile-fixas.png) |
| Item planejado | [antes](img/f2-antes-mobile-fixa-nova.png) · [depois](img/f2-depois-mobile-fixa-nova.png) |
| Salário e ciclo | [antes](img/f2-antes-mobile-salario.png) · [depois](img/f2-depois-mobile-salario.png) |
| Planejamento | [antes](img/f2-antes-mobile-planejamento.png) · [depois](img/f2-depois-mobile-planejamento.png) |
| Transferir | [antes](img/f2-antes-mobile-transferir.png) · [depois](img/f2-depois-mobile-transferir.png) |
| Pagar fatura | [antes](img/f2-antes-mobile-pagar-fatura.png) · [depois](img/f2-depois-mobile-pagar-fatura.png) |
| Painel | [antes](img/f2-antes-mobile-dashboard.png) · [depois](img/f2-depois-mobile-dashboard.png) |
| Painel (meio) | [antes](img/f2-antes-mobile-dashboard-meio.png) · [depois](img/f2-depois-mobile-dashboard-meio.png) |
| Categorias | [antes](img/f2-antes-mobile-categorias.png) · [depois](img/f2-depois-mobile-categorias.png) |
| Perfil | [antes](img/f2-antes-mobile-perfil.png) · [depois](img/f2-depois-mobile-perfil.png) |
| Planejamentos | [antes](img/f2-antes-mobile-periodos.png) · [depois](img/f2-depois-mobile-periodos.png) |
| Grupos | [antes](img/f2-antes-mobile-grupos.png) · [depois](img/f2-depois-mobile-grupos.png) |
| Editar período | [antes](img/f2-antes-mobile-editar-periodo.png) · [depois](img/f2-depois-mobile-editar-periodo.png) |

Desktop (1280px): login: [antes](img/f2-antes-desktop-login.png) / [depois](img/f2-depois-desktop-login.png) · hoje: [antes](img/f2-antes-desktop-hoje.png) / [depois](img/f2-depois-desktop-hoje.png) · contas: [antes](img/f2-antes-desktop-contas.png) / [depois](img/f2-depois-desktop-contas.png) · conta-detalhe: [antes](img/f2-antes-desktop-conta-detalhe.png) / [depois](img/f2-depois-desktop-conta-detalhe.png) · cartao-detalhe: [antes](img/f2-antes-desktop-cartao-detalhe.png) / [depois](img/f2-depois-desktop-cartao-detalhe.png) · dashboard: [antes](img/f2-antes-desktop-dashboard.png) / [depois](img/f2-depois-desktop-dashboard.png) · categorias: [antes](img/f2-antes-desktop-categorias.png) / [depois](img/f2-depois-desktop-categorias.png) · perfil: [antes](img/f2-antes-desktop-perfil.png) / [depois](img/f2-depois-desktop-perfil.png) · fixa-nova: [antes](img/f2-antes-desktop-fixa-nova.png) / [depois](img/f2-depois-desktop-fixa-nova.png) · grupos: [antes](img/f2-antes-desktop-grupos.png) / [depois](img/f2-depois-desktop-grupos.png).

**Fica para depois**: fase 3 (navegação Hoje · Histórico · [+] · Contas · Painel, Categorias no perfil) e fase 4 (folha como único padrão de criar/editar). Os gráficos do Painel mantêm a paleta própria de séries (`chart-tokens`, `palette.ts` do dashboard), agora derivada do tema.

## Redesenho, fase 3 (CX-69): navegação Hoje · Histórico · [+] · Contas · Painel

- A barra de abas ficou **Hoje · Histórico · [+] · Contas · Painel**. O [+] do meio não é uma tela: abre a mesma folha de lançamento do histórico (Gasto/Receita) por cima da aba atual, com a data de hoje dentro do período (`modules/history/use-quick-entry.tsx`, `AddTabButton`). Salvar fecha a folha e mostra o toast; o lançamento aparece no histórico.
- O botão flutuante "Lançar" da Home saiu (o [+] faz o mesmo); tocar num gasto de hoje continua editando na folha.
- **Categorias** saiu das abas e foi para o Perfil ("Planejamento → Categorias"), como rota de pilha `Categories` com cabeçalho padrão. Nenhuma rota sumiu: `CategoryDetail` (a partir do Painel) segue igual.
- Fluxos de #53–#56 conferidos: no histórico, filtro por conta + rolagem + "+" do dia abre a folha com o dia e a conta; fechar mantém a rolagem; excluir pede confirmação e mantém o filtro; na fatura o "+" do dia abre com o cartão marcado.

| Tela | Antes | Depois |
|---|---|---|
| Hoje (390) | [antes](img/f3-antes-mobile-hoje.png) | [depois](img/f3-depois-mobile-hoje.png) |
| [+] abre a folha (390) | [antes: botão flutuante](img/f3-antes-mobile-lancar.png) | [depois](img/f3-depois-mobile-lancar.png) · [salvo a partir do Painel](img/f3-depois-mobile-lancar-salvo-no-painel.png) |
| Histórico (390) | [antes](img/f3-antes-mobile-historico.png) | [depois](img/f3-depois-mobile-historico.png) · [+ do dia](img/f3-depois-mobile-historico-lancar-no-dia.png) |
| Categorias | [aba](img/f3-antes-mobile-categorias-aba.png) | [no Perfil](img/f3-depois-mobile-perfil.png) · [tela](img/f3-depois-mobile-categorias-perfil.png) |
| Desktop | [Hoje](img/f3-antes-desktop-hoje.png) · [Lançar](img/f3-antes-desktop-lancar.png) | [Hoje](img/f3-depois-desktop-hoje.png) · [Lançar](img/f3-depois-desktop-lancar.png) · [Categorias](img/f3-depois-desktop-categorias-perfil.png) |
