import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLoginMutation } from "../graphql/__generated__/hooks";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/ui/Logo";
import { Btn } from "../components/ui/Btn";
import { FieldInput } from "../components/ui/FieldInput";
import { Colors } from "../theme/tokens";
import type { AuthStackParamList } from "../../App";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
  password: yup.string().required("Senha é obrigatória"),
});

type FormValues = yup.InferType<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();

  const { control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const [login, { loading }] = useLoginMutation({
    onCompleted: async (data) => {
      const token = data.login?.token;
      const user = data.login?.user;
      if (token && user?.id && user?.email) {
        await signIn(token, { id: user.id, email: user.email });
      }
    },
    onError: (error) => setError("root", { message: error.message }),
  });

  const onSubmit = (values: FormValues) => login({ variables: values });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View style={{
        backgroundColor: Colors.bg,
        paddingTop: 72,
        paddingBottom: 32,
        alignItems: "center",
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}>
        <Logo size={60} />
        <Text style={{ marginTop: 14, fontSize: 27, fontWeight: "800", color: Colors.text, letterSpacing: -0.6 }}>
          Planfin
        </Text>
        <Text style={{ marginTop: 4, fontSize: 13, color: Colors.textSec }}>
          Controle financeiro em grupo
        </Text>
      </View>

      {/* Form */}
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 28 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: Colors.text, letterSpacing: -0.4, marginBottom: 20 }}>
          Entrar na conta
        </Text>

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
              placeholder="••••••••"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              secureTextEntry
              autoComplete="password"
            />
          )}
        />

        {errors.root && (
          <Text style={{ color: Colors.danger, fontSize: 13, textAlign: "center", marginBottom: 12 }}>
            {errors.root.message}
          </Text>
        )}

        <View style={{ marginBottom: 12 }}>
          <Btn label="Entrar" onPress={handleSubmit(onSubmit)} loading={loading} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={{ color: Colors.primary, textAlign: "center", fontSize: 14, fontWeight: "500", paddingVertical: 8 }}>
            Esqueci minha senha
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: "row", justifyContent: "center", gap: 4 }}>
          <Text style={{ color: Colors.textSec, fontSize: 14 }}>Não tem conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: "700" }}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
