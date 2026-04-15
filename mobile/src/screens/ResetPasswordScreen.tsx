import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useResetPasswordMutation } from "../graphql/__generated__/hooks";
import type { AuthStackParamList } from "../../App";

const schema = yup.object({
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

type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

export function ResetPasswordScreen({ route, navigation }: Props) {
  const { token } = route.params;
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const [resetPassword, { loading }] = useResetPasswordMutation({
    onCompleted: () => setDone(true),
    onError: (error) => setError("root", { message: error.message }),
  });

  const onSubmit = (values: FormValues) => {
    resetPassword({ variables: { token, ...values } });
  };

  if (done) {
    return (
      <View className="flex-1 p-6 justify-center bg-white">
        <Text className="text-2xl font-bold mb-3 text-center">Senha redefinida</Text>
        <Text className="text-sm text-neutral-500 text-center mb-8 leading-5">
          Sua senha foi atualizada com sucesso. Faça login com a nova senha.
        </Text>
        <TouchableOpacity className="bg-blue-600 rounded-lg p-4 items-center mb-4" onPress={() => navigation.navigate("Login")}>
          <Text className="text-white text-base font-semibold">Ir para login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-6 justify-center bg-white">
      <Text className="text-2xl font-bold mb-3 text-center">Nova senha</Text>
      <Text className="text-sm text-neutral-500 text-center mb-8 leading-5">Escolha uma nova senha para sua conta.</Text>

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput
              className={`border rounded-lg p-3 text-base ${errors.password ? "border-red-500" : "border-neutral-300"}`}
              placeholder="Nova senha"
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
              placeholder="Confirmar nova senha"
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
          <Text className="text-white text-base font-semibold">Redefinir senha</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text className="text-blue-600 text-center mt-2 text-sm">Voltar para login</Text>
      </TouchableOpacity>
    </View>
  );
}
