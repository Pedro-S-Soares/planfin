import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../../App";
import { confirm } from "../lib/alert";
import { useAuth } from "../context/AuthContext";
import { useGroup } from "../context/GroupContext";
import { useCurrency, CURRENCIES, type CurrencyCode } from "../context/CurrencyContext";
import { useUpdateProfileMutation, useLogoutMutation } from "../graphql/__generated__/hooks";
import { AppText } from "../components/ui/AppText";
import { Block, ListBlock } from "../components/ui/Block";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/DayHeader";
import { FieldInput } from "../components/ui/FieldInput";
import { Icon, type IconName } from "../components/ui/Icon";
import { IconTile } from "../components/ui/IconTile";
import { ListRow } from "../components/ui/ListRow";
import { usePageTitle } from "../hooks/usePageTitle";
import { layout, palette, radius, space } from "../theme";

type Navigation = NativeStackNavigationProp<AppStackParamList>;

function MenuRow({ icon, title, detail, onPress }: { icon: IconName; title: string; detail: string; onPress: () => void }) {
  return (
    <ListRow
      onPress={onPress}
      leading={
        <IconTile background={palette.accentSoft}>
          <Icon name={icon} size={18} tone="accent" />
        </IconTile>
      }
      title={title}
      detail={detail}
      trailing={<Icon name="chevron-right" />}
    />
  );
}

export function ProfileScreen() {
  usePageTitle("Planfin - Perfil");
  const navigation = useNavigation<Navigation>();
  const { user, signOut, updateUser } = useAuth();
  const { activeGroup } = useGroup();

  const { currency, setCurrencyCode } = useCurrency();
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const [updateProfile, { loading: saving }] = useUpdateProfileMutation({
    onCompleted: (data) => {
      if (data.updateProfile) {
        updateUser({ name: data.updateProfile.name });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    },
    onError: () => undefined, // o toast global avisa o erro
  });

  const [logout] = useLogoutMutation({
    onCompleted: () => signOut(),
    onError: () => signOut(),
  });

  const initial = (user?.name ?? user?.email ?? "U")[0].toUpperCase();

  const handleLogout = () => {
    confirm(
      { title: "Sair", message: "Tem certeza que deseja sair da conta?", confirmLabel: "Sair", destructive: true },
      () => logout(),
    );
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Block style={styles.identity}>
        <View style={styles.avatar}>
          <AppText variant="title" tone="accent">{initial}</AppText>
        </View>
        <View style={styles.identityTexts}>
          {user?.name ? <AppText variant="baseStrong" numberOfLines={1}>{user.name}</AppText> : null}
          <AppText variant="caption" numberOfLines={1}>{user?.email}</AppText>
          {activeGroup ? (
            <AppText variant="caption" tone="accent" numberOfLines={1}>Grupo {activeGroup.name}</AppText>
          ) : null}
        </View>
      </Block>

      <SectionHeader title="Dados da conta" />
      <Block style={styles.section}>
        <FieldInput
          label="Nome"
          value={name}
          onChange={(v) => { setName(v); setSaved(false); }}
          placeholder="Seu nome"
          autoCapitalize="words"
        />
        <FieldInput label="E-mail" value={user?.email ?? ""} editable={false} />
        <Button
          variant={saved ? "secondary" : "primary"}
          label={saved ? "Salvo" : "Salvar alterações"}
          isLoading={saving}
          isDisabled={saved}
          onPress={() => updateProfile({ variables: { name: name.trim() || null } })}
        />
      </Block>

      <SectionHeader title="Preferências" />
      <ListBlock style={styles.section}>
        <ListRow
          onPress={() => setIsCurrencyOpen((v) => !v)}
          leading={
            <IconTile background={palette.accentSoft}>
              <Icon name="cash-multiple" size={18} tone="accent" />
            </IconTile>
          }
          title="Moeda"
          detail={`${currency.label} (${currency.symbol})`}
          trailing={<Icon name={isCurrencyOpen ? "chevron-up" : "chevron-down"} />}
        />
        {isCurrencyOpen
          ? CURRENCIES.map((cur) => {
              const isSelected = cur.code === currency.code;
              return (
                <ListRow
                  key={cur.code}
                  onPress={() => { setCurrencyCode(cur.code as CurrencyCode); setIsCurrencyOpen(false); }}
                  leading={
                    <IconTile background={isSelected ? palette.accentSoft : palette.paper}>
                      <AppText variant="label" tone={isSelected ? "accent" : "muted"}>{cur.symbol}</AppText>
                    </IconTile>
                  }
                  title={cur.label}
                  detail={cur.code}
                  trailing={isSelected ? <Icon name="check" tone="accent" /> : null}
                />
              );
            })
          : null}
      </ListBlock>

      <SectionHeader title="Planejamento" />
      <ListBlock style={styles.section}>
        <MenuRow
          icon="calendar-edit"
          title="Editar período"
          detail="Ajustar limite diário e orçamento total"
          onPress={() => navigation.navigate("EditPeriod")}
        />
        <MenuRow
          icon="calendar-multiple"
          title="Gerenciar períodos"
          detail="Ver histórico e planejamentos do grupo"
          onPress={() => navigation.navigate("Periods")}
        />
        {user?.isAdmin ? (
          <MenuRow
            icon="link-variant"
            title="Convites"
            detail="Gerar links para novos usuários"
            onPress={() => navigation.navigate("AdminInvites")}
          />
        ) : null}
      </ListBlock>

      <Button label="Sair da conta" variant="destructive" onPress={handleLogout} />
      <AppText variant="caption" style={styles.footer}>
        Planfin v1.0 · {user?.email}
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  content: {
    padding: layout.gutter,
    paddingBottom: space.xxl,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginBottom: space.xl,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: palette.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  identityTexts: {
    flex: 1,
    minWidth: 0,
  },
  section: {
    marginBottom: space.xl,
  },
  footer: {
    textAlign: "center",
    marginTop: space.sm,
  },
});
