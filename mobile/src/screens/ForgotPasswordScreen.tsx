import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import type { AuthStackParamList } from "../../App";

const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION, {
    onCompleted: () => {
      setSent(true);
    },
    onError: (error) => {
      Alert.alert("Erro", error.message);
    },
  });

  const handleSubmit = () => {
    if (!email) {
      Alert.alert("Erro", "Informe seu email");
      return;
    }
    forgotPassword({ variables: { email } });
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Email enviado</Text>
        <Text style={styles.description}>
          Se esse email estiver cadastrado, você receberá um link para redefinir sua senha.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.buttonText}>Voltar para login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Esqueceu a senha?</Text>
      <Text style={styles.description}>
        Informe seu email e enviaremos instruções para redefinir sua senha.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enviar instruções</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Voltar</Text>
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
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
