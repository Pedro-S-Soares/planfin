import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useUpdateProfileMutation, useLogoutMutation } from "../graphql/__generated__/hooks";
import { FieldInput } from "../components/ui/FieldInput";
import { Btn } from "../components/ui/Btn";
import { Card } from "../components/ui/Card";
import { ProfileMenuItem } from "../components/ui/ProfileMenuItem";
import { Colors, Radius } from "../theme/tokens";

export function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);

  const [updateProfile, { loading: saving }] = useUpdateProfileMutation({
    onCompleted: (data) => {
      if (data.updateProfile) {
        updateUser({ name: data.updateProfile.name });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    },
    onError: (err) => {
      Alert.alert("Erro", err.message);
    },
  });

  const [logout] = useLogoutMutation({
    onCompleted: () => signOut(),
    onError: () => signOut(),
  });

  const initial = (user?.name ?? user?.email ?? "U")[0].toUpperCase();

  const handleSave = () => {
    updateProfile({ variables: { name: name.trim() || null } });
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      {/* Gradient header */}
      <LinearGradient
        colors={[Colors.gradStart, Colors.gradEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: 56, paddingBottom: 28, paddingHorizontal: 18 }}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginBottom: 16 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: "600" }}>
            ‹ Voltar
          </Text>
        </TouchableOpacity>

        {/* Avatar + info */}
        <View style={{ alignItems: "center", gap: 10 }}>
          <View style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.4)",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Text style={{ fontSize: 28, color: "#fff", fontWeight: "700" }}>{initial}</Text>
          </View>
          <View style={{ alignItems: "center", gap: 3 }}>
            {user?.name ? (
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff", letterSpacing: -0.3 }}>
                {user.name}
              </Text>
            ) : null}
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{user?.email}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account data card */}
        <Card padding={16}>
          <Text style={{
            fontSize: 11,
            fontWeight: "700",
            color: Colors.textSec,
            letterSpacing: 0.7,
            textTransform: "uppercase",
            marginBottom: 12,
          }}>
            Dados da conta
          </Text>

          <FieldInput
            label="Nome"
            value={name}
            onChangeText={(v) => { setName(v); setSaved(false); }}
            placeholder="Seu nome"
            autoCapitalize="words"
          />

          {/* Email read-only */}
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.textSec, marginBottom: 5 }}>
              E-mail
            </Text>
            <View style={{
              height: 52,
              borderRadius: Radius.md,
              backgroundColor: Colors.bg,
              borderWidth: 1,
              borderColor: Colors.border,
              paddingHorizontal: 14,
              justifyContent: "center",
            }}>
              <Text style={{ fontSize: 15, color: Colors.textSec }}>{user?.email}</Text>
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            {saving ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Btn
                variant={saved ? "ghost" : "primary"}
                label={saved ? "✓ Salvo" : "Salvar alterações"}
                onPress={handleSave}
                disabled={saved}
              />
            )}
          </View>
        </Card>

        {/* Settings menu card — hidden until implemented
        <Card padding={16}>
          <Text style={{
            fontSize: 11,
            fontWeight: "700",
            color: Colors.textSec,
            letterSpacing: 0.7,
            textTransform: "uppercase",
            marginBottom: 4,
          }}>
            Configurações
          </Text>
          <ProfileMenuItem icon="🔔" label="Notificações" subtitle="Alertas e lembretes" />
          <View style={{ height: 1, backgroundColor: Colors.border }} />
          <ProfileMenuItem icon="🔒" label="Segurança" subtitle="Senha e autenticação" />
          <View style={{ height: 1, backgroundColor: Colors.border }} />
          <ProfileMenuItem icon="🌙" label="Aparência" subtitle="Tema claro ou escuro" />
        </Card>
        */}

        {/* Logout card */}
        <Card padding={16}>
          <ProfileMenuItem
            icon="📤"
            label="Sair da conta"
            danger
            onPress={handleLogout}
          />
        </Card>

        {/* Footer */}
        <Text style={{ textAlign: "center", fontSize: 12, color: Colors.textTer, marginTop: 4 }}>
          Planfin v1.0 · {user?.email}
        </Text>
      </ScrollView>
    </View>
  );
}
