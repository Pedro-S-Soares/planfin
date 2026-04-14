import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useAuth } from "../context/AuthContext";

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export function HomeScreen() {
  const { user, signOut } = useAuth();

  const [logout, { loading }] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => signOut(),
    onError: () => signOut(), // Sign out locally even if server fails
  });

  const handleLogout = () => logout();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Planfin</Text>
      {user && <Text style={styles.email}>{user.email}</Text>}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
});
