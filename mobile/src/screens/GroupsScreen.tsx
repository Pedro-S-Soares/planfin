import { useCallback, useState } from "react";
import { View, FlatList, TouchableOpacity, ActivityIndicator, Share, StyleSheet } from "react-native";
import { confirm } from "../lib/alert";
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
import { Block } from "../components/ui/Block";
import { Button } from "../components/ui/Button";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "../lib/toast";
import { layout, palette, radius, space } from "../theme";
import { Sheet } from "../components/ui/Sheet";
import { FieldInput } from "../components/ui/FieldInput";
import { Text } from "../components/ui/Text";
import { TextInput } from "../components/ui/TextInput";
import { Icon } from "../components/ui/Icon";

type GroupInvitesData = { groupInvites: GroupInvite[] };

export function GroupsScreen() {
  usePageTitle("Planfin - Grupos");
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
    confirm(
      {
        title: isOwner ? "Excluir grupo" : "Sair do grupo",
        message: isOwner
          ? `Tem certeza que deseja excluir "${group.name}"? Todos os gastos serão perdidos.`
          : `Sair do grupo "${group.name}"?`,
        confirmLabel: isOwner ? "Excluir" : "Sair",
        destructive: true,
      },
      async () => {
        try {
          const ok = await leaveGroup(group.id);
          if (!ok) toast.error("O dono do grupo precisa transferir ou excluir o grupo antes de sair.");
          else await refetch();
        } catch {
          // o toast global já avisou o erro da operação
        }
      }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.paper }}>
      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={{ color: palette.muted, fontSize: 15 }}>Nenhum grupo ainda.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isActive = item.id === activeGroup?.id;
          const isOwner = user && item.ownerId === Number(user.id);

          return (
            <Block padding={14}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
                onPress={() => setSelectedGroup(item)}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 42,
                  height: 42,
                  borderRadius: radius.control,
                  backgroundColor: palette.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon name="home-group" size={20} tone="accent" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: palette.ink }}>{item.name}</Text>
                    {isActive && (
                      <View style={{ backgroundColor: palette.accentSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full }}>
                        <Text style={{ fontSize: 12, fontWeight: "700", color: palette.accent }}>
                          Ativo
                        </Text>
                      </View>
                    )}
                    {isOwner && (
                      <Text style={{ fontSize: 12, color: palette.muted }}>· dono</Text>
                    )}
                  </View>
                </View>
                {!isActive && (
                  <TouchableOpacity
                    onPress={() => handleSwitch(item)}
                    style={{
                      backgroundColor: palette.accentSoft,
                      borderRadius: radius.control,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: palette.accent }}>Ativar</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </Block>
          );
        }}
        ListFooterComponent={
          <Block padding={14} style={{ borderWidth: 1.5, borderColor: palette.rule, borderStyle: "dashed" }}>
            <Button label="+ Criar novo grupo" variant="secondary" onPress={() => setShowCreate(true)} />
            <View style={{ height: 8 }} />
            <Button label="Entrar com código" variant="secondary" size="sm" onPress={() => setShowJoin(true)} />
          </Block>
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
    <Sheet isOpen onClose={onClose} title={group.name}>
      <>
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted, marginBottom: 12 }}>
            Códigos de convite
          </Text>

          <Button
            label="Gerar código (7 dias)"
            onPress={handleGenerate}
            isLoading={generating}
          />

          {lastGenerated && (
            <Block padding={16} style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 12, color: palette.muted, marginBottom: 6 }}>Código gerado</Text>
              <View style={{ backgroundColor: palette.accentSoft, borderRadius: radius.block, padding: 16, alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: palette.muted, marginBottom: 6 }}>Código gerado · expira em 7 dias</Text>
                <Text style={{ fontSize: 30, fontWeight: "800", letterSpacing: 8, color: palette.accent }}>
                  {lastGenerated.code}
                </Text>
              </View>
              <Button label="Compartilhar código" size="sm" onPress={() => handleShare(lastGenerated.code)} />
            </Block>
          )}

          {loading ? (
            <ActivityIndicator color={palette.accent} style={{ marginTop: 16 }} />
          ) : (
            <FlatList
              data={data?.groupInvites ?? []}
              keyExtractor={(i) => i.id}
              style={{ marginTop: 12 }}
              ListEmptyComponent={
                <Text style={{ color: palette.muted, fontSize: 14, textAlign: "center", paddingVertical: 16 }}>
                  Nenhum código ativo.
                </Text>
              }
              renderItem={({ item }) => (
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: palette.rule, paddingVertical: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", letterSpacing: 2, color: palette.ink }}>{item.code}</Text>
                    <Text style={{ fontSize: 12, color: palette.muted, marginTop: 2 }}>
                      {item.usesCount} uso(s){item.maxUses ? ` de ${item.maxUses}` : ""}
                      {item.expiresAt ? ` · expira ${new Date(item.expiresAt).toLocaleDateString("pt-BR")}` : ""}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity onPress={() => handleShare(item.code)}>
                      <Text style={{ color: palette.accent, fontSize: 12, fontWeight: "600" }}>Compartilhar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirm(
                      { title: "Revogar", message: `Revogar "${item.code}"?`, confirmLabel: "Revogar", destructive: true },
                      () => handleRevoke(item.id)
                    )}>
                      <Text style={{ color: palette.danger, fontSize: 12, fontWeight: "600" }}>Revogar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: palette.rule }}>
          <Button label={canDelete ? "Excluir grupo" : "Sair do grupo"} variant="destructive" onPress={onLeave} />
        </View>
      </>
    </Sheet>
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
    <Sheet isOpen={visible} onClose={onClose} title="Criar novo grupo" size="fit">
      <View style={styles.sheetBody}>
        <FieldInput
          accessibilityLabel="Nome do grupo"
          placeholder="Nome do grupo"
          value={name}
          onChange={setName}
          maxLength={80}
          autoFocus
        />
        <Button label="Criar" onPress={handleSubmit} isLoading={busy} />
      </View>
    </Sheet>
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
    <Sheet isOpen={visible} onClose={onClose} title="Entrar com código" size="fit">
      <View style={styles.sheetBody}>
        <TextInput
          accessibilityLabel="Código do convite"
          style={{
            borderWidth: 1.5,
            borderColor: palette.rule,
            borderRadius: radius.control,
            height: 56,
            textAlign: "center",
            letterSpacing: 6,
            fontSize: 22,
            fontWeight: "800",
            color: palette.ink,
            marginBottom: 12,
          }}
          placeholder="AB12CD34"
          placeholderTextColor={palette.muted}
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase())}
          maxLength={8}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
        />
        {error && <Text style={{ color: palette.danger, fontSize: 13, marginBottom: 12 }}>{error}</Text>}
        <Button label="Entrar" onPress={handleSubmit} isLoading={busy} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  sheetBody: {
    paddingHorizontal: layout.gutter,
    paddingBottom: space.lg,
  },
});
