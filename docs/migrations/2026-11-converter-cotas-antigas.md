# Conversão das cotas antigas para o modelo por fatura (CX-79)

Exceção aprovada pelo dono à regra "não mexer em lançamentos antigos", **só para cotas**.

## O que roda no deploy
1. `20261128000003_create_quota_conversion_audit` (estrutura): tabela `quota_conversion_audit`.
2. `20261128000004_convert_legacy_quotas` (dados), `Finance.QuotaConversion.run/1`, em uma transação:
   - **Vínculos** (só cotas ativas, como a regra antiga): `expenses.quota_id = cota` onde estava nulo, para cada
     lançamento que a regra antiga somava: mesmo grupo e subcategoria, tipo gasto, data num mês-calendário em que a
     cota existia (do mês de criação até `last_month`, ou só o `once_month`), **qualquer** que seja o flag de
     orçamento, a origem ou se é parcela (reprodução exata do `quota_spent` antigo). Nada mais do lançamento muda.
   - **Cotas**: `per_invoice = true`. Nome, valor, conta/cartão, subcategoria (fica como metadado), `active` e
     `inserted_at` ficam. No cartão, `once_month`/`last_month` M (mês-calendário) vira a **fatura que cobre a maior
     parte de M**: M+1 se o cartão fecha entre os dias 1 e 15, M se fecha de 16 a 28. Fora do cartão não muda.
     Recorrente continua recorrente; de um mês só continua de uma fatura só.
   - Valores antigos de cada cota e de cada lançamento vinculado vão antes para `quota_conversion_audit`.
   - Log: só contagens (`[CX-79] Cotas convertidas…: N; lançamentos vinculados: M`).
   - Idempotente (só cotas `per_invoice = false` e lançamentos sem `quota_id`).
3. Reverter: `mix ecto.rollback --step 1` ou `PlanfinBackend.Finance.QuotaConversion.revert("migration")`:
   desvincula exatamente os lançamentos da auditoria (só se ainda apontam para a mesma cota) e devolve
   `per_invoice = false`, `once_month` e `last_month` antigos.

## Ajustes de código no mesmo PR
- **Bug em produção corrigido**: a regra de existência "cota no cartão começa na fatura aberta na criação" valia
  também para cotas antigas (o ajuste do PR #63 não foi aplicado). Uma cota antiga criada depois do fechamento
  sumia do seu mês-calendário (na cópia: a cota de R$ 150 não aparecia em novembro, R$ 100 de gasto invisível).
- **Excesso não conta em dobro**: compra vinculada que já conta no orçamento (vinculada pela conversão) enche a cota
  mas não gera excesso no limite diário — ela já está nele.

## Prova na cópia decriptada do backup de 2026-11-27 (local, dados agregados)
3 cotas, todas no cartão que fecha dia 5 e vence dia 15. Resultado: 3 cotas convertidas, **20 lançamentos
vinculados**; checksum de todas as outras colunas de `expenses` idêntico antes/depois; 2ª execução 0/0;
rollback → 3 cotas legadas e 0 vínculos; migrar de novo → mesmo estado.

| Cota | Antes (regra antiga, por mês-calendário) | Depois (por fatura) |
|---|---|---|
| A · R$ 150, recorrente, criada 05/11 | nov: gasto 100 (resta 50)¹ | fatura dez (05/11–04/12): gasto 100, resta 50 |
| B · R$ 350, recorrente, criada 04/10 | out: 259,99 · nov: 325,00 | fatura out (até 04/10): 55,00 · fatura nov (05/10–04/11): 204,99 · fatura dez: 325,00 |
| C · R$ 2.000, só nov/2026 | nov: 1.848,42 (resta 151,58) | só a fatura dez: 1.848,42 (resta 151,58) |

¹ Em produção hoje essa cota não aparece em novembro (bug acima); pela regra antiga correta, como na tabela.

- **Ciclo atual (fatura dez, aberta)**: gastos e o que resta de cada cota **iguais** ao mês de novembro de antes.
- **Diferença em fatura passada**: só a cota B, cujo outubro-calendário se divide entre as faturas de out (compra antes
  do dia 5) e nov. Nenhuma sobra de cota entra hoje no carry (a fatura atual está aberta).
- **Planejamento**:
  - fatura atual: resultado **−171,29 → +102,13 (+273,42)**. Antes, a regra antiga reservava as cotas A+B do
    mês-calendário **dezembro** inteiras (500,00, com vencimento 01/12 dentro desta fatura) e não reservava o que
    restava das cotas de novembro. Depois, reserva o que resta das cotas **desta fatura** (50 + 25 + 151,58 = 226,58).
    500,00 − 226,58 = 273,42.
  - próxima fatura (jan): resultado **igual** (3.008,10); as cotas A+B (500,00) saem das "fixas do cartão" e
    aparecem na seção de cotas.
- **Hoje / limite diário**: "Disponível hoje", gasto do dia e total restante do período **iguais**.
