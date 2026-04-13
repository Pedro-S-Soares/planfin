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
import { useAuth } from "../context/AuthContext";
import type { AuthStackParamList } from "../../App";

const REGISTER_MUTATION = gql`
  mutation RegisterUser($email: String!, $password: String!, $passwordConfirmation: String!) {
    registerUser(email: $email, password: $password, passwordConfirmation: $passwordConfirmation) {
      token
      user {
        id
        email
      }
    }
  }
`;

type RegisterData = { registerUser: { token: string; user: { id: string; email: string } } };
type RegisterVars = { email: string; password: string; passwordConfirmation: string };

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const { signIn } = useAuth();

  const [registerUser, { loading }] = useMutation<RegisterData, RegisterVars>(REGISTER_MUTATION, {
    onCompleted: async (data) => {
      await signIn(data.registerUser.token, data.registerUser.user);
    },
    onError: (error) => {
      Alert.alert("Erro", error.message);
    },
  });

  const handleRegister = () => {
    if (!email || !password || !passwordConfirmation) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    if (password !== passwordConfirmation) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }
    registerUser({ variables: { email, password, passwordConfirmation } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        value={passwordConfirmation}
        onChangeText={setPasswordConfirmation}
        secureTextEntry
        autoComplete="new-password"
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Criar conta</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Já tenho conta</Text>
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
    marginBottom: 32,
    textAlign: "center",
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
