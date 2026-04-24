import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useResetPasswordMutation } from "../graphql/__generated__/hooks";
import { Btn } from "../components/ui/Btn";
import { FieldInput } from "../components/ui/FieldInput";
import { Colors } from "../theme/tokens";
import type { AuthStackParamList } from "../../App";

const schema = yup.object({
  password: yup.string().min(8, "A senha deve ter pelo menos 8 caracteres").required("Senha é obrigatória"),
  passwordConfirmation: yup.string().oneOf([yup.ref("password")], "As senhas não coincidem").required("Confirmação é obrigatória"),
});

type FormValues = yup.InferType<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

export function ResetPasswordScreen({ route, navigation }: Props) {
  const { token } = route.params;
  const [done, setDone] = useState(false);

  const { control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const [resetPassword, { loading }] = useResetPasswordMutation({
    onCompleted: () => setDone(true),
    onError: (error) => setError("root", { message: error.message }),
  });

  const onSubmit = (values: FormValues) => resetPassword({ variables: { token, ...values } });

  if (done) {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: "center", backgroundColor: Colors.surface }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: Colors.text, textAlign: "center", marginBottom: 12 }}>
          Senha redefinida
        </Text>
        <Text style={{ fontSize: 14, color: Colors.textSec, textAlign: "center", marginBottom: 32, lineHeight: 22 }}>
          Sua senha foi atualizada com sucesso. Faça login com a nova senha.
        </Text>
        <Btn label="Ir para login" onPress={() => navigation.navigate("Login")} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={{
        backgroundColor: Colors.bg,
        paddingTop: 62,
        paddingBottom: 22,
        paddingHorizontal: 22,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: Colors.text, letterSpacing: -0.5 }}>
          Nova senha
        </Text>
        <Text style={{ fontSize: 13, color: Colors.textSec, marginTop: 3 }}>
          Escolha uma nova senha para sua conta.
        </Text>
      </View>

      <View style={{ padding: 22, paddingTop: 22 }}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <FieldInput
              label="Nova senha"
              placeholder="Mínimo 8 caracteres"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              secureTextEntry
              autoComplete="new-password"
            />
          )}
        />

        <Controller
          control={control}
          name="passwordConfirmation"
          render={({ field: { onChange, onBlur, value } }) => (
            <FieldInput
              label="Confirmar nova senha"
              placeholder="Repita a senha"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.passwordConfirmation?.message}
              secureTextEntry
              autoComplete="new-password"
            />
          )}
        />

        {errors.root && (
          <Text style={{ color: Colors.danger, fontSize: 13, textAlign: "center", marginBottom: 12 }}>
            {errors.root.message}
          </Text>
        )}

        <Btn label="Redefinir senha" onPress={handleSubmit(onSubmit)} loading={loading} />
        <View style={{ height: 12 }} />
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={{ color: Colors.primary, textAlign: "center", fontSize: 14 }}>Voltar para login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
