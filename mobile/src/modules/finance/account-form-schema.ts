import * as yup from "yup";

export const accountFormSchema = yup.object({
  name: yup.string().trim().required("Dê um nome").max(60, "Máximo de 60 caracteres"),
  kind: yup
    .mixed<"checking" | "credit_card" | "allowance" | "reserve" | "benefit">()
    .oneOf(["checking", "credit_card", "allowance", "reserve", "benefit"])
    .required(),
  balance: yup.string().default("0,00"),
  isNegative: yup.boolean().default(false),
  closingDay: yup.string().when("kind", {
    is: "credit_card",
    then: (s) =>
      s.required("Informe o dia").test("day", "Entre 1 e 28", (v) => !!v && Number(v) >= 1 && Number(v) <= 28),
    otherwise: (s) => s.optional(),
  }),
  dueDay: yup.string().when("kind", {
    is: "credit_card",
    then: (s) =>
      s.required("Informe o dia").test("day", "Entre 1 e 28", (v) => !!v && Number(v) >= 1 && Number(v) <= 28),
    otherwise: (s) => s.optional(),
  }),
  ownerUserId: yup.string().nullable().optional(),
  monthlyCredit: yup.string().default("0,00"),
  creditDay: yup.string().when("kind", {
    is: "benefit",
    then: (s) =>
      s.required("Informe o dia").test("day", "Entre 1 e 31", (v) => !!v && Number(v) >= 1 && Number(v) <= 31),
    otherwise: (s) => s.optional(),
  }),
});

export type AccountFormValues = yup.InferType<typeof accountFormSchema>;
