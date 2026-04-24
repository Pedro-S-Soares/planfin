import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForgotPasswordMutation } from "../graphql/__generated__/hooks";
import { Btn } from "../components/ui/Btn";
import { FieldInput } from "../components/ui/FieldInput";
import { Colors, Radius } from "../theme/tokens";
import type { AuthStackParamList } from "../../App";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
});

type FormValues = yup.InferType<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const [forgotPassword, { loading }] = useForgotPasswordMutation({
    onCompleted: () => setSent(true),
    onError: () => setSent(true),
  });

  const onSubmit = (values: FormValues) => forgotPassword({ variables: values });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View style={{
        backgroundColor: Colors.bg,
        paddingTop: 62,
        paddingBottom: 22,
        paddingHorizontal: 22,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 16 }}
        >
          <Text style={{ color: Colors.primary, fontSize: 18 }}>‹</Text>
          <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: "600" }}>Voltar</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: "800", color: Colors.text, letterSpacing: -0.5 }}>
          Recuperar senha
        </Text>
        <Text style={{ fontSize: 13, color: Colors.textSec, marginTop: 3 }}>
          Enviaremos um link para o seu e-mail
        </Text>
      </View>

      <View style={{ padding: 22, paddingTop: 22 }}>
        {sent ? (
          <View style={{
            backgroundColor: Colors.successLight,
            borderRadius: Radius.lg,
            padding: 18,
            borderWidth: 1,
            borderColor: "rgba(14,173,112,0.3)",
          }}>
            <Text style={{ fontSize: 15, color: Colors.successText, fontWeight: "700" }}>
              ✓ Link enviado!
            </Text>
            <Text style={{ fontSize: 13, color: Colors.successText, marginTop: 5, lineHeight: 20 }}>
              Verifique seu e-mail e siga as instruções para redefinir sua senha.
            </Text>
          </View>
        ) : (
          <>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoFocus
                />
              )}
            />
            <Btn label="Enviar link de recuperação" onPress={handleSubmit(onSubmit)} loading={loading} />
          </>
        )}
      </View>
    </View>
  );
}
