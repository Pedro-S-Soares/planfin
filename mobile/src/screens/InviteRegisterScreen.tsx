import { View, TouchableOpacity, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRegisterUserMutation } from "../graphql/__generated__/hooks";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { FieldInput } from "../components/ui/FieldInput";
import type { AuthStackParamList } from "../../App";
import { palette } from "../theme";
import { Text } from "../components/ui/Text";
import { BackLink } from "../components/ui/BackLink";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
  password: yup
    .string()
    .min(12, "A senha deve ter pelo menos 12 caracteres")
    .required("Senha é obrigatória"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não coincidem")
    .required("Confirmação é obrigatória"),
});

type FormValues = yup.InferType<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, "InviteRegister">;

export function InviteRegisterScreen({ navigation, route }: Props) {
  const { token } = route.params;
  const { signIn } = useAuth();

  const { control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const [registerUser, { loading }] = useRegisterUserMutation({
    onCompleted: async (data) => {
      const apiToken = data.registerUser?.token;
      const user = data.registerUser?.user;
      if (apiToken && user?.id && user?.email) {
        await signIn(apiToken, { id: user.id, email: user.email, isAdmin: user.isAdmin });
      }
    },
    onError: (error) => setError("root", { message: error.message }),
  });

  const onSubmit = (values: FormValues) =>
    registerUser({
      variables: {
        email: values.email,
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
        inviteToken: token,
      },
    });

  return (
    <View style={{ flex: 1, backgroundColor: palette.sheet }}>
      <View style={{
        backgroundColor: palette.paper,
        paddingTop: 62,
        paddingBottom: 22,
        paddingHorizontal: 22,
        borderBottomWidth: 1,
        borderBottomColor: palette.rule,
      }}>
        <BackLink onPress={() => navigation.navigate("Login")} />
        <Text style={{ fontSize: 26, fontWeight: "800", color: palette.ink, letterSpacing: -0.5 }}>
          Criar conta
        </Text>
        <Text style={{ fontSize: 13, color: palette.muted, marginTop: 3 }}>
          Você foi convidado para o Planfin
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 22 }}>
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
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <FieldInput
              label="Senha"
              placeholder="Mínimo 12 caracteres"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              hint="Pelo menos 12 caracteres"
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
              label="Confirmar senha"
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
          <Text style={{ color: palette.danger, fontSize: 13, textAlign: "center", marginBottom: 12 }}>
            {errors.root.message}
          </Text>
        )}

        <Button label="Criar conta" onPress={handleSubmit(onSubmit)} isLoading={loading} />

        <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "center", gap: 4 }}>
          <Text style={{ color: palette.muted, fontSize: 14 }}>Já tem conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: palette.accent, fontSize: 14, fontWeight: "700" }}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
