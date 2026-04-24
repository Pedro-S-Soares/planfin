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
  type Group,
  type GroupInvite,
} from "../graphql/groups";
import { Card } from "../components/ui/Card";
import { Btn } from "../components/ui/Btn";
import { Colors, Radius, Shadow } from "../theme/tokens";

type GroupInvitesData = { groupInvites: GroupInvite[] };

export function GroupsScreen() {
  const { groups, activeGroup, switchGroup, leaveGroup, createGroup, redeemCode, refetch } = useGroup();
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
        ? `Tem certeza que deseja excluir "${group.name}"? Todos os gastos serão perdidos.`
        : `Sair do grupo "${group.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: isOwner ? "Excluir" : "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              const ok = await leaveGroup(group.id);
              if (!ok) Alert.alert("Não foi possível sair", "Dono do grupo precisa transferir ou excluir.");
              else await refetch();
            } catch (err: unknown) {
              Alert.alert("Erro", err instanceof Error ? err.message : "Erro desconhecido");
            }
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={{ color: Colors.textSec, fontSize: 15 }}>Nenhum grupo ainda.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isActive = item.id === activeGroup?.id;
          const isOwner = user && item.ownerId === Number(user.id);

          return (
            <Card padding={14}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
                onPress={() => setSelectedGroup(item)}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 42,
                  height: 42,
                  borderRadius: Radius.md,
                  backgroundColor: Colors.primaryLight,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Text style={{ fontSize: 20 }}>🏠</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text }}>{item.name}</Text>
                    {isActive && (
                      <View style={{ backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full }}>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: Colors.primaryText, letterSpacing: 0.4, textTransform: "uppercase" }}>
                          Ativo
                        </Text>
                      </View>
                    )}
                    {isOwner && (
                      <Text style={{ fontSize: 11, color: Colors.textSec }}>· dono</Text>
                    )}
                  </View>
                </View>
                {!isActive && (
                  <TouchableOpacity
                    onPress={() => handleSwitch(item)}
                    style={{
                      backgroundColor: Colors.primaryLight,
                      borderRadius: Radius.sm,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.primaryText }}>Ativar</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </Card>
          );
        }}
        ListFooterComponent={
          <Card padding={14} style={{ borderWidth: 1.5, borderColor: Colors.border, borderStyle: "dashed" }}>
            <Btn label="+ Criar novo grupo" variant="ghost" onPress={() => setShowCreate(true)} />
            <View style={{ height: 8 }} />
            <Btn label="Entrar com código" variant="secondary" size="sm" onPress={() => setShowJoin(true)} />
          </Card>
        }
      />

      {selectedGroup && (
        <GroupDetailModal
          group={selectedGroup}
          canDelete={!!user && selectedGroup.ownerId === Number(user.id)}
          onClose={() => setSelectedGroup(null)}
          onLeave={() => { const g = selectedGroup; setSelectedGroup(null); handleLeave(g); }}
        />
      )}

      <CreateGroupModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={async (name) => { await createGroup(name); await refetch(); setShowCreate(false); }}
      />

      <JoinGroupModal
        visible={showJoin}
        onClose={() => setShowJoin(false)}
        onSubmit={async (code) => { await redeemCode(code); await refetch(); setShowJoin(false); }}
      />
    </View>
  );
}

function GroupDetailModal({ group, canDelete, onClose, onLeave }: {
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

  const [revoke] = useMutation<{ revokeInviteCode: boolean }, { inviteId: string }>(REVOKE_INVITE_CODE);
  const [lastGenerated, setLastGenerated] = useState<GroupInvite | null>(null);

  const handleGenerate = useCallback(async () => {
    const { data } = await generate({ variables: { groupId: group.id, expiresInDays: 7 } });
    if (data?.generateInviteCode) { setLastGenerated(data.generateInviteCode); await refetch(); }
  }, [generate, group.id, refetch]);

  const handleRevoke = useCallback(async (id: string) => {
    await revoke({ variables: { inviteId: id } });
    await refetch();
  }, [revoke, refetch]);

  const handleShare = useCallback(async (code: string) => {
    await Share.share({ message: `Entre no grupo "${group.name}" no Planfin com o código: ${code}` });
  }, [group.name]);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        {/* Header */}
        <View style={{
          backgroundColor: Colors.surface,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          paddingTop: 56,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: Colors.text }}>{group.name}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: Colors.primary, fontSize: 15, fontWeight: "600" }}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 12 }}>
            Códigos de convite
          </Text>

          <Btn
            label="Gerar código (7 dias)"
            onPress={handleGenerate}
            loading={generating}
          />

          {lastGenerated && (
            <Card padding={16} style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 12, color: Colors.textSec, marginBottom: 6 }}>Código gerado</Text>
              <View style={{ backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, padding: 16, alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 11, color: Colors.textSec, marginBottom: 6 }}>Código gerado · expira em 7 dias</Text>
                <Text style={{ fontSize: 30, fontWeight: "800", letterSpacing: 8, color: Colors.primaryText }}>
                  {lastGenerated.code}
                </Text>
              </View>
              <Btn label="Compartilhar código" size="sm" onPress={() => handleShare(lastGenerated.code)} />
            </Card>
          )}

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
          ) : (
            <FlatList
              data={data?.groupInvites ?? []}
              keyExtractor={(i) => i.id}
              style={{ marginTop: 12 }}
              ListEmptyComponent={
                <Text style={{ color: Colors.textSec, fontSize: 14, textAlign: "center", paddingVertical: 16 }}>
                  Nenhum código ativo.
                </Text>
              }
              renderItem={({ item }) => (
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", letterSpacing: 2, color: Colors.text }}>{item.code}</Text>
                    <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 2 }}>
                      {item.usesCount} uso(s){item.maxUses ? ` de ${item.maxUses}` : ""}
                      {item.expiresAt ? ` · expira ${new Date(item.expiresAt).toLocaleDateString("pt-BR")}` : ""}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity onPress={() => handleShare(item.code)}>
                      <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: "600" }}>Compartilhar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert("Revogar", `Revogar "${item.code}"?`, [
                      { text: "Cancelar", style: "cancel" },
                      { text: "Revogar", style: "destructive", onPress: () => handleRevoke(item.id) },
                    ])}>
                      <Text style={{ color: Colors.danger, fontSize: 12, fontWeight: "600" }}>Revogar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: Colors.border }}>
          <Btn label={canDelete ? "Excluir grupo" : "Sair do grupo"} variant="danger" onPress={onLeave} />
        </View>
      </View>
    </Modal>
  );
}

function CreateGroupModal({ visible, onClose, onSubmit }: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try { await onSubmit(name.trim()); setName(""); }
    finally { setBusy(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View style={{ backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: Colors.text, marginBottom: 16 }}>
            Criar novo grupo
          </Text>
          <TextInput
            style={{
              borderWidth: 1.5,
              borderColor: Colors.border,
              borderRadius: Radius.md,
              paddingHorizontal: 16,
              height: 52,
              fontSize: 16,
              color: Colors.text,
              marginBottom: 16,
            }}
            placeholder="Nome do grupo"
            placeholderTextColor={Colors.textTer}
            value={name}
            onChangeText={setName}
            maxLength={80}
            autoFocus
          />
          <Btn label="Criar" onPress={handleSubmit} loading={busy} />
          <View style={{ height: 8 }} />
          <Btn label="Cancelar" variant="ghost" onPress={onClose} disabled={busy} />
        </View>
      </View>
    </Modal>
  );
}

function JoinGroupModal({ visible, onClose, onSubmit }: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const normalized = code.trim().toUpperCase();
    if (normalized.length < 6) { setError("Código deve ter pelo menos 6 caracteres."); return; }
    setBusy(true);
    setError(null);
    try { await onSubmit(normalized); setCode(""); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Código inválido."); }
    finally { setBusy(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View style={{ backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: Colors.text, marginBottom: 16 }}>
            Entrar com código
          </Text>
          <TextInput
            style={{
              borderWidth: 1.5,
              borderColor: Colors.border,
              borderRadius: Radius.md,
              height: 56,
              textAlign: "center",
              letterSpacing: 6,
              fontSize: 22,
              fontWeight: "800",
              color: Colors.text,
              marginBottom: 12,
            }}
            placeholder="AB12CD34"
            placeholderTextColor={Colors.textTer}
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase())}
            maxLength={8}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
          />
          {error && <Text style={{ color: Colors.danger, fontSize: 13, marginBottom: 12 }}>{error}</Text>}
          <Btn label="Entrar" onPress={handleSubmit} loading={busy} />
          <View style={{ height: 8 }} />
          <Btn label="Cancelar" variant="ghost" onPress={onClose} disabled={busy} />
        </View>
      </View>
    </Modal>
  );
}
