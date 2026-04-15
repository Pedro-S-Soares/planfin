import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRegisterUserMutation } from "../graphql/__generated__/hooks";
import { useAuth } from "../context/AuthContext";
import type { AuthStackParamList } from "../../App";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
  password: yup
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .required("Senha é obrigatória"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não coincidem")
    .required("Confirmação de senha é obrigatória"),
});

type FormValues = yup.InferType<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { signIn } = useAuth();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
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
    onError: (error) => {
      setError("root", { message: error.message });
    },
  });

  const onSubmit = (values: FormValues) => {
    registerUser({ variables: values });
  };

  return (
    <View className="flex-1 p-6 justify-center bg-white">
      <Text className="text-2xl font-bold mb-8 text-center">Criar conta</Text>

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
              autoComplete="new-password"
            />
            {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="passwordConfirmation"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput
              className={`border rounded-lg p-3 text-base ${errors.passwordConfirmation ? "border-red-500" : "border-neutral-300"}`}
              placeholder="Confirmar senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoComplete="new-password"
            />
            {errors.passwordConfirmation && (
              <Text className="text-red-500 text-xs mt-1">{errors.passwordConfirmation.message}</Text>
            )}
          </View>
        )}
      />

      {errors.root && <Text className="text-red-500 text-sm text-center mb-3">{errors.root.message}</Text>}

      <TouchableOpacity className="bg-blue-600 rounded-lg p-4 items-center mb-4" onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-base font-semibold">Criar conta</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text className="text-blue-600 text-center mt-2 text-sm">Já tenho conta</Text>
      </TouchableOpacity>
    </View>
  );
}
