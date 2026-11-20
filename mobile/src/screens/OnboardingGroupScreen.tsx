import { useState } from "react";
import { View, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { confirm } from "../lib/alert";
import { useGroup } from "../context/GroupContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { FieldInput } from "../components/ui/FieldInput";
import { palette, radius } from "../theme";
import { Text } from "../components/ui/Text";
import { Icon } from "../components/ui/Icon";
import { BackLink } from "../components/ui/BackLink";
import { TextInput } from "../components/ui/TextInput";

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
    confirm(
      { title: "Sair", message: "Tem certeza que deseja sair?", confirmLabel: "Sair", destructive: true },
      () => signOut()
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.sheet }}>
      {/* Header */}
      <View style={{
        backgroundColor: palette.paper,
        paddingTop: 72,
        paddingBottom: 28,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: palette.rule,
      }}>
        <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: palette.accent, alignItems: "center", justifyContent: "center" }}>
          <Icon name="account-group-outline" size={36} tone="onAccent" />
        </View>
        <Text style={{ marginTop: 14, fontSize: 22, fontWeight: "800", color: palette.ink, letterSpacing: -0.4 }}>
          Bem-vindo ao Planfin
        </Text>
        <Text style={{ marginTop: 5, fontSize: 13, color: palette.muted, textAlign: "center", paddingHorizontal: 32, lineHeight: 20 }}>
          Crie um grupo ou entre em um existente para começar.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 24 }}>
        {mode === "menu" && (
          <>
            <Button label="Criar novo grupo" onPress={() => { setError(null); setMode("create"); }} />
            <View style={{ height: 10 }} />
            <Button label="Entrar com código" variant="secondary" onPress={() => { setError(null); setMode("join"); }} />
            <TouchableOpacity onPress={handleSignOut} style={{ marginTop: 28, alignItems: "center" }}>
              <Text style={{ color: palette.muted, fontSize: 13 }}>Sair da conta</Text>
            </TouchableOpacity>
          </>
        )}

        {mode === "create" && (
          <>
            <BackLink onPress={() => setMode("menu")} />
            <FieldInput
              label="Nome do grupo"
              placeholder="Ex.: Casa, Família, República"
              value={groupName}
              onChange={setGroupName}
              autoFocus
            />
            {error && <Text style={{ color: palette.danger, fontSize: 13, marginBottom: 12 }}>{error}</Text>}
            <Button label="Criar grupo" onPress={handleCreate} isLoading={busy} />
          </>
        )}

        {mode === "join" && (
          <>
            <BackLink onPress={() => setMode("menu")} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted, marginBottom: 7 }}>
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
                color: palette.ink,
                borderWidth: 1.5,
                borderColor: palette.rule,
                borderRadius: radius.control,
                backgroundColor: palette.sheet,
                marginBottom: 16,
              }}
              placeholderTextColor={palette.muted}
            />
            {error && <Text style={{ color: palette.danger, fontSize: 13, marginBottom: 12 }}>{error}</Text>}
            <Button label="Entrar no grupo" onPress={handleJoin} isLoading={busy} />
          </>
        )}
      </ScrollView>
    </View>
  );
}
