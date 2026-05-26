import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { confirm, alertWeb } from "../lib/alert";
import { useNavigation } from "@react-navigation/native";
import {
  useListInvitesQuery,
  useCreateInviteMutation,
  useRevokeInviteMutation,
  ListInvitesQuery,
} from "../graphql/__generated__/hooks";
import { Card } from "../components/ui/Card";
import { Btn } from "../components/ui/Btn";
import { Colors, Radius } from "../theme/tokens";
import { usePageTitle } from "../hooks/usePageTitle";

type Invite = NonNullable<NonNullable<ListInvitesQuery["listInvites"]>[number]>;

const APP_URL = process.env.EXPO_PUBLIC_APP_URL ?? "https://planfin.app.br";

function inviteUrl(token: string) {
  return `${APP_URL}/invite/${token}`;
}

function inviteStatus(invite: Invite): { label: string; color: string } {
  if (invite.revokedAt) return { label: "Revogado", color: Colors.danger };
  if (invite.usedAt) return { label: "Utilizado", color: "#16a34a" };
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date())
    return { label: "Expirado", color: Colors.textSec };
  return { label: "Pendente", color: "#d97706" };
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
    onError: (err) => alertWeb("Erro", err.message),
  });

  const [revokeInvite] = useRevokeInviteMutation({
    onCompleted: () => refetch(),
    onError: (err) => alertWeb("Erro", err.message),
  });

  const handleCopy = async (url: string) => {
    if (Platform.OS === "web") {
      await navigator.clipboard.writeText(url).catch(() => {});
      alertWeb("Copiado!", "Link de convite copiado para a área de transferência.");
    } else {
      await Clipboard.setStringAsync(url);
      alertWeb("Copiado!", "Link de convite copiado para a área de transferência.");
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
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View style={{
        backgroundColor: Colors.bg,
        paddingTop: 62,
        paddingBottom: 22,
        paddingHorizontal: 22,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 16 }}
        >
          <Text style={{ color: Colors.primary, fontSize: 18 }}>‹</Text>
          <Text style={{ color: Colors.primary, fontSize: 14, fontWeight: "600" }}>Voltar</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 26, fontWeight: "800", color: Colors.text, letterSpacing: -0.5 }}>
          Convites
        </Text>
        <Text style={{ fontSize: 13, color: Colors.textSec, marginTop: 3 }}>
          Gerencie quem pode criar conta
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Generated link card */}
        {creatingLink && (
          <Card padding={16} style={{ marginBottom: 12, borderWidth: 1, borderColor: Colors.primary }}>
            <Text style={{ fontSize: 12, color: Colors.textSec, marginBottom: 4 }}>
              Novo convite gerado — copie e envie:
            </Text>
            <Text style={{ fontSize: 12, color: Colors.text, fontFamily: "monospace", marginBottom: 12 }} selectable>
              {creatingLink}
            </Text>
            <Btn label="Copiar link" onPress={() => handleCopy(creatingLink)} />
          </Card>
        )}

        <View style={{ marginBottom: 20 }}>
          <Btn
            label="Gerar novo convite"
            onPress={() => { setCreatingLink(null); createInvite(); }}
            loading={creating}
          />
        </View>

        {loading && <ActivityIndicator color={Colors.primary} />}

        {invites.length === 0 && !loading && (
          <Text style={{ textAlign: "center", color: Colors.textSec, marginTop: 20 }}>
            Nenhum convite gerado ainda.
          </Text>
        )}

        {invites.map((invite) => {
          if (!invite) return null;
          const status = inviteStatus(invite);
          const isPending = status.label === "Pendente";

          return (
            <Card key={invite.id} padding={14} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <View style={{
                  backgroundColor: status.color + "20",
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: Radius.sm,
                }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: status.color }}>
                    {status.label}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: Colors.textSec }}>
                  {formatDate(invite.insertedAt)}
                </Text>
              </View>

              {invite.usedByEmail ? (
                <Text style={{ fontSize: 13, color: Colors.text }}>
                  Usado por: <Text style={{ fontWeight: "600" }}>{invite.usedByEmail}</Text>
                </Text>
              ) : (
                <Text style={{ fontSize: 12, color: Colors.textSec, fontFamily: "monospace" }} numberOfLines={1}>
                  {invite.token ? inviteUrl(invite.token) : "—"}
                </Text>
              )}

              {invite.expiresAt && (
                <Text style={{ fontSize: 11, color: Colors.textSec, marginTop: 4 }}>
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
                      borderRadius: Radius.md,
                      borderWidth: 1,
                      borderColor: Colors.primary,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: Colors.primary, fontWeight: "600", fontSize: 13 }}>Copiar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRevoke(invite.id!)}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: Radius.md,
                      borderWidth: 1,
                      borderColor: Colors.danger,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: Colors.danger, fontWeight: "600", fontSize: 13 }}>Revogar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}
