import { useState } from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import { confirm } from "../lib/alert";
import { useNavigation } from "@react-navigation/native";
import {
  useListInvitesQuery,
  useCreateInviteMutation,
  useRevokeInviteMutation,
  ListInvitesQuery,
} from "../graphql/__generated__/hooks";
import { Block } from "../components/ui/Block";
import { Button } from "../components/ui/Button";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast } from "../lib/toast";
import { palette, radius } from "../theme";
import { Text } from "../components/ui/Text";
import { AppText } from "../components/ui/AppText";

type Invite = NonNullable<NonNullable<ListInvitesQuery["listInvites"]>[number]>;

const APP_URL = process.env.EXPO_PUBLIC_APP_URL ?? "https://planfin.app.br";

function inviteUrl(token: string) {
  return `${APP_URL}/invite/${token}`;
}

function inviteStatus(invite: Invite): { label: string; color: string } {
  if (invite.revokedAt) return { label: "Revogado", color: palette.danger };
  if (invite.usedAt) return { label: "Utilizado", color: palette.income };
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date())
    return { label: "Expirado", color: palette.muted };
  return { label: "Pendente", color: palette.warning };
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function AdminInvitesScreen() {
  usePageTitle("Planfin - Convites");
  const navigation = useNavigation();
  const [creatingLink, setCreatingLink] = useState<string | null>(null);

  const { data, loading, refetch } = useListInvitesQuery({
    fetchPolicy: "network-only",
  });

  const [createInvite, { loading: creating }] = useCreateInviteMutation({
    onCompleted: (res) => {
      const token = res.createInvite?.token;
      if (token) {
        const url = inviteUrl(token);
        setCreatingLink(url);
        refetch();
      }
    },
    onError: () => undefined, // o toast global avisa o erro
  });

  const [revokeInvite] = useRevokeInviteMutation({
    onCompleted: () => refetch(),
    onError: () => undefined, // o toast global avisa o erro
  });

  const handleCopy = async (url: string) => {
    if (Platform.OS === "web") {
      await navigator.clipboard.writeText(url).catch(() => {});
      toast.success("Link de convite copiado");
    } else {
      await Clipboard.setStringAsync(url);
      toast.success("Link de convite copiado");
    }
  };

  const handleRevoke = (id: string) => {
    confirm(
      { title: "Revogar convite", message: "Tem certeza? O link deixará de funcionar.", confirmLabel: "Revogar", destructive: true },
      () => revokeInvite({ variables: { id } })
    );
  };

  const invites = data?.listInvites ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: palette.paper }}>
      <AppText variant="body" tone="muted" style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        Gerencie quem pode criar conta.
      </AppText>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Generated link card */}
        {creatingLink && (
          <Block padding={16} style={{ marginBottom: 12, borderWidth: 1, borderColor: palette.accent }}>
            <Text style={{ fontSize: 12, color: palette.muted, marginBottom: 4 }}>
              Novo convite gerado — copie e envie:
            </Text>
            <Text style={{ fontSize: 12, color: palette.ink, fontFamily: "monospace", marginBottom: 12 }} selectable>
              {creatingLink}
            </Text>
            <Button label="Copiar link" onPress={() => handleCopy(creatingLink)} />
          </Block>
        )}

        <View style={{ marginBottom: 20 }}>
          <Button
            label="Gerar novo convite"
            onPress={() => { setCreatingLink(null); createInvite(); }}
            isLoading={creating}
          />
        </View>

        {loading && <ActivityIndicator color={palette.accent} />}

        {invites.length === 0 && !loading && (
          <Text style={{ textAlign: "center", color: palette.muted, marginTop: 20 }}>
            Nenhum convite gerado ainda.
          </Text>
        )}

        {invites.map((invite) => {
          if (!invite) return null;
          const status = inviteStatus(invite);
          const isPending = status.label === "Pendente";

          return (
            <Block key={invite.id} padding={14} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <View style={{
                  backgroundColor: status.color + "20",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: radius.control,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: status.color }}>
                    {status.label}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: palette.muted }}>
                  {formatDate(invite.insertedAt)}
                </Text>
              </View>

              {invite.usedByEmail ? (
                <Text style={{ fontSize: 13, color: palette.ink }}>
                  Usado por: <Text style={{ fontWeight: "600" }}>{invite.usedByEmail}</Text>
                </Text>
              ) : (
                <Text style={{ fontSize: 12, color: palette.muted, fontFamily: "monospace" }} numberOfLines={1}>
                  {invite.token ? inviteUrl(invite.token) : "—"}
                </Text>
              )}

              {invite.expiresAt && (
                <Text style={{ fontSize: 12, color: palette.muted, marginTop: 4 }}>
                  Expira: {formatDate(invite.expiresAt)}
                </Text>
              )}

              {isPending && invite.token && invite.id && (
                <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => handleCopy(inviteUrl(invite.token!))}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: radius.control,
                      borderWidth: 1,
                      borderColor: palette.accent,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: palette.accent, fontWeight: "600", fontSize: 13 }}>Copiar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRevoke(invite.id!)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: radius.control,
                      borderWidth: 1,
                      borderColor: palette.danger,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: palette.danger, fontWeight: "600", fontSize: 13 }}>Revogar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Block>
          );
        })}
      </ScrollView>
    </View>
  );
}
