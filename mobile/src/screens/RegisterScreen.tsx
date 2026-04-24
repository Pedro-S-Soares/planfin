import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRegisterUserMutation } from "../graphql/__generated__/hooks";
import { useAuth } from "../context/AuthContext";
import { Btn } from "../components/ui/Btn";
import { FieldInput } from "../components/ui/FieldInput";
import { Colors } from "../theme/tokens";
import type { AuthStackParamList } from "../../App";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
  password: yup.string().min(8, "A senha deve ter pelo menos 8 caracteres").required("Senha é obrigatória"),
  passwordConfirmation: yup.string().oneOf([yup.ref("password")], "As senhas não coincidem").required("Confirmação é obrigatória"),
});

type FormValues = yup.InferType<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { signIn } = useAuth();

  const { control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const [registerUser, { loading }] = useRegisterUserMutation({
    onCompleted: async (data) => {
      const token = data.registerUser?.token;
      const user = data.registerUser?.user;
      if (token && user?.id && user?.email) {
        await signIn(token, { id: user.id, email: user.email });
      }
    },
    onError: (error) => setError("root", { message: error.message }),
  });

  const onSubmit = (values: FormValues) => registerUser({ variables: values });

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
          Criar conta
        </Text>
        <Text style={{ fontSize: 13, color: Colors.textSec, marginTop: 3 }}>
          Comece a planejar seus gastos
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
              placeholder="Mínimo 8 caracteres"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              hint="Pelo menos 8 caracteres"
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
          <Text style={{ color: Colors.danger, fontSize: 13, textAlign: "center", marginBottom: 12 }}>
            {errors.root.message}
          </Text>
        )}

        <Btn label="Criar conta" onPress={handleSubmit(onSubmit)} loading={loading} />

        <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "center", gap: 4 }}>
          <Text style={{ color: Colors.textSec, fontSize: 14 }}>Já tem conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: "700" }}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
