import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForgotPasswordMutation } from "../graphql/__generated__/hooks";
import type { AuthStackParamList } from "../../App";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
});

type FormValues = yup.InferType<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const [forgotPassword, { loading }] = useForgotPasswordMutation({
    onCompleted: () => setSent(true),
    onError: () => setSent(true),
  });

  const onSubmit = (values: FormValues) => {
    forgotPassword({ variables: values });
  };

  if (sent) {
    return (
      <View className="flex-1 p-6 justify-center bg-white">
        <Text className="text-2xl font-bold mb-3 text-center">Email enviado</Text>
        <Text className="text-sm text-neutral-500 text-center mb-8 leading-5">
          Se esse email estiver cadastrado, você receberá um link para redefinir sua senha.
        </Text>
        <TouchableOpacity className="bg-blue-600 rounded-lg p-4 items-center mb-4" onPress={() => navigation.navigate("Login")}>
          <Text className="text-white text-base font-semibold">Voltar para login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 p-6 justify-center bg-white">
      <Text className="text-2xl font-bold mb-3 text-center">Esqueceu a senha?</Text>
      <Text className="text-sm text-neutral-500 text-center mb-8 leading-5">
        Informe seu email e enviaremos instruções para redefinir sua senha.
      </Text>

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

      <TouchableOpacity className="bg-blue-600 rounded-lg p-4 items-center mb-4" onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-base font-semibold">Enviar instruções</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text className="text-blue-600 text-center mt-2 text-sm">Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}
