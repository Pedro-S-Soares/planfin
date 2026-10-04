/**
 * User-facing messages for mutations: what to say when each one succeeds, and
 * how to translate the backend error messages.
 */

type Variables = Record<string, unknown>;
type Data = Record<string, unknown> | null | undefined;
type SuccessMessage = string | ((variables: Variables, data: Data) => string | null);

const SUCCESS: Record<string, SuccessMessage> = {
  CreateExpense: (v) => {
    if (v.type === "income") return "Receita registrada";
    const n = typeof v.installments === "number" ? v.installments : 1;
    return n > 1 ? `Compra em ${n}x registrada` : "Gasto registrado";
  },
  UpdateExpense: (v) => (v.type === "income" ? "Receita atualizada" : "Lançamento atualizado"),
  DeleteExpense: "Lançamento excluído",
  SetInvoiceTotal: "Fatura ajustada",
  StartFreshPlan: "Planejamento iniciado a partir de hoje",
  AnticipateInstallments: "Parcelas antecipadas na fatura desta parcela",
  CreatePeriod: "Planejamento criado",
  UpdatePeriod: "Planejamento atualizado",
  CreateCategory: "Categoria criada",
  UpdateCategory: "Categoria atualizada",
  DeleteCategory: "Categoria excluída",
  CreateSubcategory: "Subcategoria criada",
  DeleteSubcategory: "Subcategoria excluída",
  CreateFinancialAccount: "Conta adicionada",
  UpdateFinancialAccount: "Conta atualizada",
  MakePrimaryAccount: "Conta principal alterada",
  ArchiveFinancialAccount: "Conta arquivada",
  SetAccountBalance: "Saldo ajustado",
  CreateTransfer: "Transferência registrada",
  PayInvoice: "Pagamento da fatura registrado",
  AssignEntriesToAccount: (_v, data) => {
    const count = data?.assignEntriesToAccount;
    if (typeof count !== "number") return "Lançamentos movidos";
    if (count === 0) return "Nenhum lançamento sem conta nesse período";
    return count === 1 ? "1 lançamento foi para o cartão" : `${count} lançamentos foram para o cartão`;
  },
  SetInvoiceGoal: "Meta da fatura salva",
  CreateRecurringBill: "Despesa fixa adicionada",
  UpdateRecurringBill: "Despesa fixa atualizada",
  DeleteRecurringBill: "Despesa fixa excluída",
  PayBill: "Pagamento registrado",
  UnpayBill: "Pagamento desfeito",
  UpdateFinancialSettings: "Salário salvo",
  SetSalaryDate: "Data do salário atualizada",
  RegisterSalary: "Salário registrado",
  DistributeAllowance: "Mesada distribuída",
  SetReserveGoal: "Meta da reserva salva",
  CreateGroup: "Grupo criado",
  RenameGroup: "Grupo renomeado",
  DeleteGroup: "Grupo excluído",
  SwitchActiveGroup: "Grupo trocado",
  LeaveGroup: "Você saiu do grupo",
  RemoveMember: "Membro removido",
  GenerateInviteCode: "Convite gerado",
  RevokeInviteCode: "Convite revogado",
  RedeemInviteCode: "Você entrou no grupo",
  CreateInvite: "Convite criado",
  RevokeInvite: "Convite revogado",
  UpdateProfile: "Perfil atualizado",
  ForgotPassword: "Se o e-mail existir, enviamos o link",
  ResetPassword: "Senha alterada",
};

/** Mutations whose outcome the screen already shows; no toast at all. */
const SILENT = new Set(["Login", "Logout", "RegisterUser"]);

const ERRORS: [RegExp, string][] = [
  [/not enough left for variable spending/i, "Não sobra dinheiro para gastos variáveis com essa gordura."],
  [/no active period/i, "Não há planejamento ativo. Crie um período antes."],
  [/out of the period range/i, "A data está fora do período. Ative \"Conta no orçamento\" só para datas do período."],
  [/installments require a credit card/i, "Parcelamento só no cartão de crédito."],
  [/invalid number of installments/i, "Número de parcelas inválido."],
  [/installments are on invoices already due/i, "Todas as parcelas já venceram; não há o que lançar."],
  [/no installments left to anticipate/i, "Não há parcelas restantes para antecipar."],
  [/not an installment/i, "Esse lançamento não é uma parcela."],
  [/account not found/i, "Conta não encontrada. Atualize a tela e tente de novo."],
  [/not a credit card/i, "Essa conta não é um cartão."],
  [/bill not found/i, "Despesa fixa não encontrada."],
  [/already paid/i, "Este mês já está pago."],
  [/is not paid/i, "Este mês não está pago."],
  [/allowance is not available/i, "A mesada só libera no fechamento do ciclo."],
  [/exceeds what is left over/i, "O valor passa do que sobrou no ciclo."],
  [/salary amount not configured/i, "Cadastre o salário primeiro."],
  [/owner must be a member/i, "O dono da mesada precisa ser do grupo."],
  [/only a checking account can be primary/i, "Só conta corrente pode ser a principal."],
  [/invalid amount/i, "Valor inválido."],
  [/invalid date/i, "Data inválida."],
  [/invalid month/i, "Mês inválido."],
  [/must be at least daily_limit/i, "O orçamento total precisa cobrir o limite diário de todos os dias."],
  [/must be greater than 0/i, "O valor precisa ser maior que zero."],
  [/can't be blank/i, "Preencha os campos obrigatórios."],
  [/has already been taken/i, "Já existe um item com esse nome."],
  [/must match subcategory type/i, "A subcategoria é de outro tipo (gasto ou receita)."],
  [/no active group/i, "Nenhum grupo ativo."],
];

export function successMessage(operationName: string, variables: Variables, data: Data): string | null {
  if (SILENT.has(operationName)) return null;
  const message = SUCCESS[operationName];
  if (message === undefined) return null;
  return typeof message === "function" ? message(variables, data) : message;
}

export function isSilent(operationName: string): boolean {
  return SILENT.has(operationName);
}

export function translateError(raw: string): string {
  const match = ERRORS.find(([pattern]) => pattern.test(raw));
  return match ? match[1] : `Não foi possível concluir: ${raw}`;
}
