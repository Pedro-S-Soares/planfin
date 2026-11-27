# Parcelas na fatura certa: o que roda no deploy (CX-77)

## Regra
- Parcela 1: data da compra, fatura dessa data (sem mudança).
- Parcela k ≥ 2: fatura `fatura da parcela 1 + (k − 1)`, **datada no dia em que essa fatura abre** (o fechamento
  anterior), como o banco mostra. Antes: data da compra + (k − 1) meses.
- Mudou o dia de fechamento do cartão, ou a data da parcela 1: as parcelas seguintes são realinhadas na hora.

## Migrações
1. `20261128000001_create_installment_fix_audit` (estrutura, aditiva): tabela `installment_fix_audit`
   (`run_at, origin, expense_id, installment_group_id, installment_number, account_id, old_date, new_date,
   old_invoice, new_invoice, action, reason, reverted_at`).
2. `20261128000002_fix_installment_dates` (dados, pedido explícito do dono):
   - considera só parcelas **2..n** de compras parceladas **no cartão** (`installment_number >= 2`, tipo gasto);
   - muda **só a coluna `date`** (e `updated_at`); nunca valor, categoria, nota, conta, parcela 1 ou lançamentos que
     não são parcela;
   - `redate`: mesma fatura, só passa para o dia de abertura; `move`: muda de fatura;
   - **não mexe** (`skipped_locked`) quando a fatura de origem ou de destino tem pagamento registrado ou total ajustado
     pelo banco — fica listada no log e na tabela de auditoria;
   - grava cada linha avaliada em `installment_fix_audit` antes de mudar, na mesma transação;
   - imprime no deploy: totais e, por compra, cartão + id curto + contagens (sem descrições nem valores);
   - idempotente: a segunda execução não encontra nada.

## Efeito esperado em produção (simulado na cópia decriptada do backup de 2026-11-27, local)
- 9 compras parceladas, **75 parcelas só mudam de data dentro da mesma fatura**, **0 mudam de fatura**, 0 travadas.
- Totais e pagamentos de **todas** as faturas de todos os cartões (17 meses por cartão): idênticos antes e depois.
- Lançamentos que não são parcela 2..n: idênticos antes e depois (checksum).
- Segunda execução: 0 mudanças. `rollback --step 1`: 75 datas restauradas; `migrate` de novo: mesmo resultado.

## Reverter
- Só a correção: `mix ecto.rollback --step 1` (ou, na release,
  `bin/planfin_backend eval 'PlanfinBackend.Finance.Installments.revert("migration")'`): volta `date = old_date` das
  linhas `move`/`redate` da origem `migration` que ainda estão com a data nova, e marca `reverted_at`.
- Realinhamentos automáticos posteriores (mudança de fechamento, edição da parcela 1) também ficam na auditoria, com
  origem `closing_day_change` / `first_parcel_edit`, e podem ser revertidos pela mesma função com essa origem.
