import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Share,
} from "react-native";
import { useQuery, useMutation } from "@apollo/client/react";
import { useGroup } from "../context/GroupContext";
import { useAuth } from "../context/AuthContext";
import {
  GROUP_INVITES,
  GENERATE_INVITE_CODE,
  REVOKE_INVITE_CODE,
  DELETE_GROUP,
  type Group,
  type GroupInvite,
} from "../graphql/groups";

type GroupInvitesData = { groupInvites: GroupInvite[] };

export function GroupsScreen() {
  const { groups, activeGroup, switchGroup, leaveGroup, createGroup, redeemCode, refetch } =
    useGroup();
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const handleSwitch = async (group: Group) => {
    if (group.id === activeGroup?.id) return;
    await switchGroup(group.id);
  };

  const handleLeave = (group: Group) => {
    const isOwner = user && group.ownerId === Number(user.id);
    Alert.alert(
      isOwner ? "Excluir grupo" : "Sair do grupo",
      isOwner
        ? `Tem certeza que deseja excluir "${group.name}"? Todos os gastos, períodos e categorias serão perdidos.`
        : `Sair do grupo "${group.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: isOwner ? "Excluir" : "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              const ok = await leaveGroup(group.id);
              if (!ok) {
                Alert.alert(
                  "Não foi possível sair",
                  isOwner
                    ? "Só o dono pode excluir o grupo."
                    : "Dono do grupo precisa transferir ou excluir.",
                );
              } else {
                await refetch();
              }
            } catch (err: unknown) {
              Alert.alert("Erro", err instanceof Error ? err.message : "Erro desconhecido");
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        ItemSeparatorComponent={() => <View className="h-px bg-neutral-200" />}
        ListEmptyComponent={
          <View className="p-6">
            <Text className="text-center text-neutral-500">Nenhum grupo ainda.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isActive = item.id === activeGroup?.id;
          const isOwner = user && item.ownerId === Number(user.id);

          return (
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-4"
              onPress={() => setSelectedGroup(item)}
            >
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-base font-semibold">{item.name}</Text>
                  {isActive && (
                    <Text className="ml-2 text-xs text-blue-600 font-semibold">(ativo)</Text>
                  )}
                  {isOwner && (
                    <Text className="ml-2 text-xs text-neutral-500">• dono</Text>
                  )}
                </View>
              </View>

              {!isActive && (
                <TouchableOpacity
                  className="px-3 py-1 bg-blue-50 rounded"
                  onPress={() => handleSwitch(item)}
                >
                  <Text className="text-blue-600 text-xs font-semibold">Tornar ativo</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <View className="p-4">
            <TouchableOpacity
              className="bg-blue-600 rounded-lg p-3 items-center mb-2"
              onPress={() => setShowCreate(true)}
            >
              <Text className="text-white text-sm font-semibold">+ Criar novo grupo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border border-blue-600 rounded-lg p-3 items-center"
              onPress={() => setShowJoin(true)}
            >
              <Text className="text-blue-600 text-sm font-semibold">Entrar com código</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {selectedGroup && (
        <GroupDetailModal
          group={selectedGroup}
          canDelete={!!user && selectedGroup.ownerId === Number(user.id)}
          onClose={() => setSelectedGroup(null)}
          onLeave={() => {
            const g = selectedGroup;
            setSelectedGroup(null);
            handleLeave(g);
          }}
        />
      )}

      <CreateGroupModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={async (name) => {
          await createGroup(name);
          await refetch();
          setShowCreate(false);
        }}
      />

      <JoinGroupModal
        visible={showJoin}
        onClose={() => setShowJoin(false)}
        onSubmit={async (code) => {
          await redeemCode(code);
          await refetch();
          setShowJoin(false);
        }}
      />
    </View>
  );
}

function GroupDetailModal({
  group,
  canDelete,
  onClose,
  onLeave,
}: {
  group: Group;
  canDelete: boolean;
  onClose: () => void;
  onLeave: () => void;
}) {
  const { data, loading, refetch } = useQuery<GroupInvitesData>(GROUP_INVITES, {
    variables: { groupId: group.id },
    fetchPolicy: "network-only",
  });

  const [generate, { loading: generating }] = useMutation<
    { generateInviteCode: GroupInvite },
    { groupId: string; expiresInDays?: number; maxUses?: number }
  >(GENERATE_INVITE_CODE);

  const [revoke] = useMutation<{ revokeInviteCode: boolean }, { inviteId: string }>(
    REVOKE_INVITE_CODE,
  );

  const [lastGenerated, setLastGenerated] = useState<GroupInvite | null>(null);

  const handleGenerate = useCallback(async () => {
    const { data } = await generate({
      variables: { groupId: group.id, expiresInDays: 7 },
    });
    if (data?.generateInviteCode) {
      setLastGenerated(data.generateInviteCode);
      await refetch();
    }
  }, [generate, group.id, refetch]);

  const handleRevoke = useCallback(
    async (id: string) => {
      await revoke({ variables: { inviteId: id } });
      await refetch();
    },
    [revoke, refetch],
  );

  const handleShare = useCallback(async (code: string) => {
    await Share.share({
      message: `Entre no grupo "${group.name}" no Planfin com o código: ${code}`,
    });
  }, [group.name]);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-neutral-200">
          <Text className="text-lg font-bold">{group.name}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-blue-600 text-base">Fechar</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 p-4">
          <Text className="text-sm font-semibold text-neutral-600 mb-2">CÓDIGOS DE CONVITE</Text>

          <TouchableOpacity
            className="bg-blue-600 rounded-lg p-3 items-center mb-4"
            onPress={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-sm font-semibold">Gerar novo código (7 dias)</Text>
            )}
          </TouchableOpacity>

          {lastGenerated && (
            <View className="bg-blue-50 rounded-lg p-4 mb-4">
              <Text className="text-xs text-neutral-600 mb-1">Código gerado</Text>
              <Text className="text-3xl font-bold tracking-widest text-center mb-3">
                {lastGenerated.code}
              </Text>
              <TouchableOpacity
                className="bg-blue-600 rounded p-2 items-center"
                onPress={() => handleShare(lastGenerated.code)}
              >
                <Text className="text-white text-sm font-semibold">Compartilhar</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <ActivityIndicator />
          ) : (
            <FlatList
              data={data?.groupInvites ?? []}
              keyExtractor={(i) => i.id}
              ListEmptyComponent={
                <Text className="text-neutral-500 text-sm text-center py-4">
                  Nenhum código ativo.
                </Text>
              }
              renderItem={({ item }) => (
                <View className="flex-row items-center justify-between border-b border-neutral-100 py-3">
                  <View className="flex-1">
                    <Text className="font-mono text-base font-semibold">{item.code}</Text>
                    <Text className="text-xs text-neutral-500">
                      {item.usesCount} uso(s)
                      {item.maxUses ? ` de ${item.maxUses}` : ""}
                      {item.expiresAt
                        ? ` · expira ${new Date(item.expiresAt).toLocaleDateString("pt-BR")}`
                        : ""}
                    </Text>
                  </View>

                  <View className="flex-row">
                    <TouchableOpacity
                      className="px-3 py-1 mr-2"
                      onPress={() => handleShare(item.code)}
                    >
                      <Text className="text-blue-600 text-xs">Compartilhar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="px-3 py-1"
                      onPress={() =>
                        Alert.alert("Revogar código", `Revogar "${item.code}"?`, [
                          { text: "Cancelar", style: "cancel" },
                          {
                            text: "Revogar",
                            style: "destructive",
                            onPress: () => handleRevoke(item.id),
                          },
                        ])
                      }
                    >
                      <Text className="text-red-500 text-xs">Revogar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        <View className="p-4 border-t border-neutral-200">
          <TouchableOpacity
            className="border border-red-500 rounded-lg p-3 items-center"
            onPress={onLeave}
          >
            <Text className="text-red-500 text-sm font-semibold">
              {canDelete ? "Excluir grupo" : "Sair do grupo"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function CreateGroupModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onSubmit(name.trim());
      setName("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-2xl p-6">
          <Text className="text-lg font-bold mb-3">Criar novo grupo</Text>
          <TextInput
            className="border border-neutral-300 rounded-lg p-3 text-base mb-3"
            placeholder="Nome do grupo"
            value={name}
            onChangeText={setName}
            maxLength={80}
            autoFocus
          />
          <TouchableOpacity
            className="bg-blue-600 rounded-lg p-3 items-center mb-2"
            onPress={handleSubmit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-sm font-semibold">Criar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} disabled={busy}>
            <Text className="text-blue-600 text-center text-sm">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function JoinGroupModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const normalized = code.trim().toUpperCase();
    if (normalized.length < 6) {
      setError("Código deve ter pelo menos 6 caracteres.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(normalized);
      setCode("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Código inválido.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-2xl p-6">
          <Text className="text-lg font-bold mb-3">Entrar com código</Text>
          <TextInput
            className="border border-neutral-300 rounded-lg p-3 text-base tracking-widest text-center mb-3"
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
            className="bg-blue-600 rounded-lg p-3 items-center mb-2"
            onPress={handleSubmit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-sm font-semibold">Entrar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} disabled={busy}>
            <Text className="text-blue-600 text-center text-sm">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
