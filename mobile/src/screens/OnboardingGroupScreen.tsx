import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGroup } from "../context/GroupContext";
import { useAuth } from "../context/AuthContext";
import { Btn } from "../components/ui/Btn";
import { FieldInput } from "../components/ui/FieldInput";
import { Colors, Radius, Shadow } from "../theme/tokens";

type Mode = "menu" | "create" | "join";

export function OnboardingGroupScreen() {
  const { createGroup, redeemCode } = useGroup();
  const { signOut } = useAuth();
  const [mode, setMode] = useState<Mode>("menu");
  const [groupName, setGroupName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!groupName.trim()) { setError("Digite um nome para o grupo."); return; }
    setBusy(true);
    setError(null);
    try {
      const group = await createGroup(groupName.trim());
      if (!group) setError("Não foi possível criar o grupo.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar grupo.");
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    const normalized = code.trim().toUpperCase();
    if (normalized.length < 6) { setError("Código deve ter pelo menos 6 caracteres."); return; }
    setBusy(true);
    setError(null);
    try {
      const group = await redeemCode(normalized);
      if (!group) setError("Não foi possível entrar no grupo.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Código inválido.");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View style={{
        backgroundColor: Colors.bg,
        paddingTop: 72,
        paddingBottom: 28,
        alignItems: "center",
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
      }}>
        <LinearGradient
          colors={[Colors.gradStart, Colors.gradEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: Colors.fabShadow,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <Text style={{ fontSize: 32 }}>👥</Text>
        </LinearGradient>
        <Text style={{ marginTop: 14, fontSize: 22, fontWeight: "800", color: Colors.text, letterSpacing: -0.4 }}>
          Bem-vindo ao Planfin
        </Text>
        <Text style={{ marginTop: 5, fontSize: 13, color: Colors.textSec, textAlign: "center", paddingHorizontal: 32, lineHeight: 20 }}>
          Crie um grupo ou entre em um existente para começar.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 24 }}>
        {mode === "menu" && (
          <>
            <Btn label="Criar novo grupo" onPress={() => { setError(null); setMode("create"); }} size="lg" />
            <View style={{ height: 10 }} />
            <Btn label="Entrar com código" variant="secondary" size="lg" onPress={() => { setError(null); setMode("join"); }} />
            <TouchableOpacity onPress={handleSignOut} style={{ marginTop: 28, alignItems: "center" }}>
              <Text style={{ color: Colors.textSec, fontSize: 13 }}>Sair da conta</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === "create" && (
          <>
            <TouchableOpacity
              onPress={() => setMode("menu")}
              style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 16 }}
            >
              <Text style={{ color: Colors.primary, fontSize: 18 }}>‹</Text>
              <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: "600" }}>Voltar</Text>
            </TouchableOpacity>
            <FieldInput
              label="Nome do grupo"
              placeholder="Ex.: Casa, Família, República"
              value={groupName}
              onChange={setGroupName}
              autoFocus
            />
            {error && <Text style={{ color: Colors.danger, fontSize: 13, marginBottom: 12 }}>{error}</Text>}
            <Btn label="Criar grupo" onPress={handleCreate} loading={busy} />
          </>
        )}

        {mode === "join" && (
          <>
            <TouchableOpacity
              onPress={() => setMode("menu")}
              style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 16 }}
            >
              <Text style={{ color: Colors.primary, fontSize: 18 }}>‹</Text>
              <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: "600" }}>Voltar</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>
              Código de convite
            </Text>
            <TextInput
              value={code}
              onChangeText={(v) => setCode(v.toUpperCase())}
              maxLength={8}
              placeholder="AB12CD34"
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
              style={{
                height: 56,
                textAlign: "center",
                letterSpacing: 6,
                fontSize: 22,
                fontWeight: "800",
                color: Colors.text,
                borderWidth: 1.5,
                borderColor: Colors.border,
                borderRadius: Radius.md,
                backgroundColor: Colors.surface,
                marginBottom: 16,
              }}
              placeholderTextColor={Colors.textTer}
            />
            {error && <Text style={{ color: Colors.danger, fontSize: 13, marginBottom: 12 }}>{error}</Text>}
            <Btn label="Entrar no grupo" onPress={handleJoin} loading={busy} />
          </>
        )}
      </ScrollView>
    </View>
  );
}
