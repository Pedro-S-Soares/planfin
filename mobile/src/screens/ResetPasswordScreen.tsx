import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

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

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $password: String!, $passwordConfirmation: String!) {
    resetPassword(token: $token, password: $password, passwordConfirmation: $passwordConfirmation)
  }
`;

type ResetPasswordVars = { token: string; password: string; passwordConfirmation: string };

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

  const [resetPassword, { loading }] = useMutation<{ resetPassword: boolean }, ResetPasswordVars>(
    RESET_PASSWORD_MUTATION,
    {
      onCompleted: () => setDone(true),
      onError: (error) => setError("root", { message: error.message }),
    }
  );

  const onSubmit = (values: FormValues) => {
    resetPassword({ variables: { token, ...values } });
  };

  if (done) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Senha redefinida</Text>
        <Text style={styles.description}>
          Sua senha foi atualizada com sucesso. Faça login com a nova senha.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.buttonText}>Ir para login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova senha</Text>
      <Text style={styles.description}>Escolha uma nova senha para sua conta.</Text>

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Nova senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoComplete="new-password"
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="passwordConfirmation"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, errors.passwordConfirmation && styles.inputError]}
              placeholder="Confirmar nova senha"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoComplete="new-password"
            />
            {errors.passwordConfirmation && (
              <Text style={styles.errorText}>{errors.passwordConfirmation.message}</Text>
            )}
          </View>
        )}
      />

      {errors.root && <Text style={styles.rootError}>{errors.root.message}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Redefinir senha</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Voltar para login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  rootError: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    color: "#2563EB",
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
  },
});
