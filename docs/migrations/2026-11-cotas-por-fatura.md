# Cotas por fatura: o que roda no deploy (CX-75)

Decisão do dono (2026-11-27): **nenhum lançamento, pagamento ou cota existente é reescrito.** Sem backfill e sem
migração de dados. O comportamento novo vale só para o que for criado ou editado a partir do deploy.

## Migração (só estrutura, aditiva)

`20261127000001_add_quota_link_to_expenses`, executada por `/app/bin/migrate`:

| Tabela | Coluna | Tipo | Efeito nas linhas existentes |
|---|---|---|---|
| `expenses` | `quota_id` | uuid nulo, FK `recurring_bills` `ON DELETE SET NULL`, com índice | fica `NULL` em todas |
| `recurring_bills` | `per_invoice` | boolean `NOT NULL DEFAULT false` | fica `false` em todas (inclusive nas cotas atuais) |

Nada é removido ou alterado. `recurring_bills.subcategory_id` continua lá. Rollback: `mix ecto.rollback --step 1`
remove as duas colunas; o código anterior não as usa.

## Como ficam as cotas que já existem

Toda cota atual fica com `per_invoice = false` ("formato antigo") e **continua exatamente como hoje**:
- soma sozinha os gastos da sua subcategoria no **mês-calendário**;
- compra nova dessa subcategoria continua saindo do limite diário sozinha;
- excesso não mexe no limite diário (como antes);
- entra no Planejamento, no painel e em Fixas pelos mesmos caminhos de antes.

Na lista de Fixas ela aparece como "cota do mês (pela categoria)". Ao abrir para editar, o formulário avisa que está
no formato antigo. **Ao salvar**, ela passa para o formato novo (`per_invoice = true`):
- passa a valer por fatura no cartão, ou por mês fora dele;
- compras novas só entram nela escolhendo "Entra na cota";
- as compras antigas continuam como estão: sem vínculo, com o mesmo `counts_in_budget`. Por isso o "gasto" da cota
  na fatura em curso começa do zero após a conversão.

Os testes da regra antiga (`legacy_quota_test.exs`, copiados da main) rodam contra uma cota `per_invoice = false` e
passam sem mudança, mais um teste da conversão.

## Teste no banco com formato de produção

Banco local `planfin_quota_restore` (dados fake com cotas na mesma subcategoria, cota apagada, cota de um mês, compra
anterior à cota, compra no orçamento, parcela e pagamento de fixa). Checksum de todas as colunas antigas de
`expenses`, `recurring_bills` e `bill_payments`: **idêntico** antes da migração, depois dela e depois do rollback.
Nenhuma linha recebeu `quota_id`.

## Despesa prevista sem data (CX-76)

`20261127000002_add_no_due_day_to_recurring_bills` (só estrutura, aditiva): `recurring_bills.no_due_day` boolean
`NOT NULL DEFAULT false`. Fica `false` em todas as linhas existentes, que seguem com dia como antes. Checksum das
colunas antigas de `recurring_bills` idêntico antes e depois no banco com formato de produção.
