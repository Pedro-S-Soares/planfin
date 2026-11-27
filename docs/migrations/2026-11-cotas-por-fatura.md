# Cotas por fatura: plano de migração de dados (CX-75)

## O que roda no deploy

`scripts/deploy.sh` → `/app/bin/migrate` executa, nesta ordem:

1. **`20261127000001_add_quota_link_to_expenses`** (estrutura, aditiva)
   - `expenses.quota_id` (uuid, nulo, FK para `recurring_bills`, `ON DELETE SET NULL`) + índice.
   - `expenses.quota_backfilled` (boolean, padrão `false`): marca os vínculos feitos pela migração seguinte.
   - Nada é removido ou alterado. `recurring_bills.subcategory_id` continua existindo (vira opcional para cotas novas).

2. **`20261127000002_backfill_quota_links`** (dados)
   Até agora uma compra "era da cota" quando tinha a subcategoria da cota: o app a gravava fora do orçamento diário
   (`counts_in_budget = false`) e a somava no gasto da cota do mês. A migração vincula **essas mesmas compras**
   explicitamente, para que cada cota continue mostrando o gasto que mostrava.

   Vincula (`quota_id` = cota, `quota_backfilled = true`) os lançamentos que atendem **todas** as condições:
   - mesmo grupo e mesma subcategoria de uma cota **ativa**;
   - `type = 'expense'` e `counts_in_budget = false` (as que a regra antiga tirou do orçamento);
   - `source IS NULL` (digitadas à mão: não é pagamento de fixa, salário, crédito do vale nem ajuste de fatura);
   - não é parcela (`installment_group_id IS NULL`);
   - data em um mês em que a cota existia: a partir do mês de criação, até `last_month`, ou só o `once_month`.
   - Se duas cotas ativas dividem a subcategoria, fica com a mais antiga.

   **Não muda nenhum valor nem o `counts_in_budget`**: totais do histórico, limite diário e faturas ficam iguais.

## O que NÃO é vinculado (e por quê)

| Caso | Por quê |
|---|---|
| Compra da subcategoria que contava no orçamento (`counts_in_budget = true`), ex.: feita antes de a cota existir | Ela já saiu do limite diário; vinculá-la mudaria o histórico. |
| Pagamento de fixa, salário, crédito do vale, ajuste de fatura (`source` preenchido) | Não são compras da cota. |
| Parcelas | Caem em faturas seguintes. |
| Compras de cotas apagadas (inativas) | A cota não existe mais para escolher. |
| Compras anteriores ao mês de criação da cota | A regra antiga também não as contava. |

## Efeitos visíveis depois do deploy

- **Cota no cartão passa a ser da fatura**, não do mês-calendário. Ex.: cartão que fecha dia 25 — uma compra vinculada
  em 26/11 entra na cota da fatura de dezembro (antes contava em novembro). O total vinculado não muda; só muda em
  qual fatura ele aparece. Cotas em conta corrente continuam por mês.
- **Compras novas não entram sozinhas na cota**: é preciso escolher "Entra na cota" ao lançar (ou editar).
- **Excesso da cota sai do limite diário**: calculado na hora (não é gravado). Se, no período ativo, alguma cota já
  passou do valor com compras vinculadas, o "Disponível hoje" cai nesse excesso a partir do deploy. Períodos
  anteriores já fechados guardaram o saldo carregado e não mudam.

## Idempotência e reversão

- Idempotente: só toca linhas com `quota_id IS NULL`; rodar o UPDATE de novo afeta 0 linhas.
- Reversível: `down` da migração 2 zera exatamente os vínculos com `quota_backfilled = true`; `down` da migração 1
  remove as colunas. O código anterior ignora essas colunas, então um rollback de app + `mix ecto.rollback --step 2`
  volta ao estado anterior.

## Como foi testado

Banco local `planfin_quota_restore` (dados fake no formato de produção) com: duas cotas na mesma subcategoria,
cota apagada, cota de um mês só, compra anterior à cota, compra dentro do orçamento, parcela e pagamento de fixa na
subcategoria. Resultado:

- vinculadas só as 4 compras esperadas; as outras 9 da mesma subcategoria ficaram sem vínculo;
- checksum de `id, counts_in_budget, period_id, budget_day_id, amount` de todos os lançamentos **idêntico** antes e
  depois;
- rodar de novo: `UPDATE 0`; `rollback --step 1` → 0 vínculos; `migrate` → os mesmos 4; `rollback --step 2` →
  colunas removidas; `migrate` → mesmos 4 e mesmo checksum.
