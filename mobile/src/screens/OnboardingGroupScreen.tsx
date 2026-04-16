import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useGroup } from "../context/GroupContext";
import { useAuth } from "../context/AuthContext";

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
    if (!groupName.trim()) {
      setError("Digite um nome para o grupo.");
      return;
    }
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
    if (normalized.length < 6) {
      setError("Código deve ter pelo menos 6 caracteres.");
      return;
    }
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
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-3xl font-bold text-center mb-2">Bem-vindo ao Planfin</Text>
      <Text className="text-base text-neutral-500 text-center mb-10">
        Para começar, crie um grupo ou entre em um existente com um código de convite.
      </Text>

      {mode === "menu" && (
        <>
          <TouchableOpacity
            className="bg-blue-600 rounded-lg p-4 items-center mb-3"
            onPress={() => {
              setError(null);
              setMode("create");
            }}
          >
            <Text className="text-white text-base font-semibold">Criar novo grupo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border border-blue-600 rounded-lg p-4 items-center"
            onPress={() => {
              setError(null);
              setMode("join");
            }}
          >
            <Text className="text-blue-600 text-base font-semibold">Entrar com código</Text>
          </TouchableOpacity>
        </>
      )}

      {mode === "create" && (
        <>
          <Text className="text-sm text-neutral-600 mb-2">Nome do grupo</Text>
          <TextInput
            className="border border-neutral-300 rounded-lg p-3 text-base mb-3"
            placeholder="Ex.: Casa, Família, República"
            value={groupName}
            onChangeText={setGroupName}
            maxLength={80}
            autoFocus
          />

          {error && <Text className="text-red-500 text-sm mb-2">{error}</Text>}

          <TouchableOpacity
            className="bg-blue-600 rounded-lg p-4 items-center mb-2"
            onPress={handleCreate}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">Criar grupo</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode("menu")} disabled={busy}>
            <Text className="text-blue-600 text-center mt-2 text-sm">Voltar</Text>
          </TouchableOpacity>
        </>
      )}

      {mode === "join" && (
        <>
          <Text className="text-sm text-neutral-600 mb-2">Código de convite</Text>
          <TextInput
            className="border border-neutral-300 rounded-lg p-3 text-base mb-3 tracking-widest text-center"
            placeholder="AB12CD34"
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase())}
            maxLength={8}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
          />

          {error && <Text className="text-red-500 text-sm mb-2">{error}</Text>}

          <TouchableOpacity
            className="bg-blue-600 rounded-lg p-4 items-center mb-2"
            onPress={handleJoin}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">Entrar no grupo</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode("menu")} disabled={busy}>
            <Text className="text-blue-600 text-center mt-2 text-sm">Voltar</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={handleSignOut} className="mt-8">
        <Text className="text-neutral-500 text-center text-xs">Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}
