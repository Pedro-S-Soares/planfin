import * as yup from "yup";

export const billFormSchema = yup.object({
  name: yup.string().trim().required("Dê um nome").max(60, "Máximo de 60 caracteres"),
  amount: yup
    .string()
    .required("Informe o valor")
    .test("not-zero", "Informe um valor maior que zero", (v) => !!v && v !== "0,00"),
  dueDay: yup
    .string()
    .required("Informe o dia")
    .test("day", "Entre 1 e 31", (v) => !!v && Number(v) >= 1 && Number(v) <= 31),
  accountId: yup.string().nullable().optional(),
  categoryId: yup.string().optional(),
  subcategoryId: yup.string().optional(),
  direction: yup.mixed<"expense" | "income">().oneOf(["expense", "income"]).default("expense"),
  // "" = every month; "YYYY-MM" = only in that month
  onceMonth: yup.string().default(""),
});
