import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLoginMutation } from "../graphql/__generated__/hooks";
import { useAuth } from "../context/AuthContext";
import type { AuthStackParamList } from "../../App";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
  password: yup.string().required("Senha é obrigatória"),
});

type FormValues = yup.InferType<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
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
    onError: (error) => {
      setError("root", { message: error.message });
    },
  });

  const onSubmit = (values: FormValues) => {
    login({ variables: values });
  };

  return (
    <View className="flex-1 p-6 justify-center bg-white">
      <Text className="text-3xl font-bold mb-2 text-center">Planfin</Text>
      <Text className="text-base text-neutral-500 mb-8 text-center">Entrar na sua conta</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput
              className={`border rounded-lg p-3 text-base ${errors.email ? "border-red-500" : "border-neutral-300"}`}
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput
              className={`border rounded-lg p-3 text-base ${errors.password ? "border-red-500" : "border-neutral-300"}`}
              placeholder="Senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoComplete="password"
            />
            {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password.message}</Text>}
          </View>
        )}
      />

      {errors.root && <Text className="text-red-500 text-sm text-center mb-3">{errors.root.message}</Text>}

      <TouchableOpacity className="bg-blue-600 rounded-lg p-4 items-center mb-4" onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-semibold">Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text className="text-blue-600 text-center mt-2 text-sm">Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text className="text-blue-600 text-center mt-2 text-sm">Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}
