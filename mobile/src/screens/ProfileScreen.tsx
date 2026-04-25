import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useGroup } from "../context/GroupContext";
import { useCurrency, CURRENCIES, type CurrencyCode } from "../context/CurrencyContext";
import { useUpdateProfileMutation, useLogoutMutation } from "../graphql/__generated__/hooks";
import { FieldInput } from "../components/ui/FieldInput";
import { Btn } from "../components/ui/Btn";
import { Card } from "../components/ui/Card";
import { ProfileMenuItem } from "../components/ui/ProfileMenuItem";
import { Colors, Radius } from "../theme/tokens";

const SETTINGS_ITEMS = [
  { icon: "🔔", label: "Notificações",   subtitle: "Alertas de gastos e período" },
  { icon: "🔒", label: "Alterar senha",  subtitle: "Segurança da conta" },
  { icon: "🌙", label: "Aparência",      subtitle: "Tema claro ou escuro" },
  { icon: "📤", label: "Exportar dados", subtitle: "Baixar histórico em CSV" },
];

export function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut, updateUser } = useAuth();
  const { activeGroup } = useGroup();

  const { currency, setCurrencyCode } = useCurrency();
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

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
        style={{
          paddingTop: Platform.OS === "ios" ? 56 : 28,
          paddingBottom: 28,
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Frosted circle back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            position: "absolute",
            top: Platform.OS === "ios" ? 58 : 30,
            left: 16,
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: "rgba(255,255,255,0.18)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.25)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, lineHeight: 22, marginLeft: -2 }}>‹</Text>
        </TouchableOpacity>

        {/* Avatar */}
        <View style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: "rgba(255,255,255,0.22)",
          borderWidth: 3,
          borderColor: "rgba(255,255,255,0.4)",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}>
          <Text style={{ fontSize: 28, color: "#fff", fontWeight: "800" }}>{initial}</Text>
        </View>

        {/* Name + email */}
        {user?.name ? (
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff", letterSpacing: -0.3 }}>
            {user.name}
          </Text>
        ) : null}
        <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 3 }}>
          {user?.email}
        </Text>

        {/* Active group badge */}
        {activeGroup && (
          <View style={{
            marginTop: 10,
            backgroundColor: "rgba(255,255,255,0.18)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.28)",
            borderRadius: 9999,
            paddingHorizontal: 12,
            paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff", letterSpacing: 0.5 }}>
              📍 {activeGroup.name}
            </Text>
          </View>
        )}
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

        {/* Currency picker */}
        <Card padding={0} style={{ overflow: "hidden" }}>
          <TouchableOpacity
            onPress={() => setShowCurrencyPicker((v) => !v)}
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center", gap: 13, padding: 16 }}
          >
            <View style={{
              width: 36, height: 36, borderRadius: Radius.sm,
              backgroundColor: Colors.primaryLight,
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Text style={{ fontSize: 18 }}>💱</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text }}>Moeda</Text>
              <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 1 }}>
                {currency.flag} {currency.label} ({currency.symbol})
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: Colors.textTer, transform: [{ rotate: showCurrencyPicker ? "90deg" : "0deg" }] }}>
              ›
            </Text>
          </TouchableOpacity>

          {showCurrencyPicker && (
            <View style={{ borderTopWidth: 1, borderTopColor: Colors.border, padding: 10, gap: 6 }}>
              {CURRENCIES.map((cur) => {
                const selected = cur.code === currency.code;
                return (
                  <TouchableOpacity
                    key={cur.code}
                    onPress={() => { setCurrencyCode(cur.code as CurrencyCode); setShowCurrencyPicker(false); }}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 12,
                      padding: 10, borderRadius: Radius.md,
                      borderWidth: 1.5,
                      borderColor: selected ? Colors.primary : Colors.border,
                      backgroundColor: selected ? Colors.primaryLight : Colors.surface,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{cur.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: selected ? Colors.primaryText : Colors.text }}>
                        {cur.label}
                      </Text>
                      <Text style={{ fontSize: 12, color: Colors.textSec }}>
                        {cur.code} · {cur.symbol}
                      </Text>
                    </View>
                    {selected && (
                      <View style={{
                        width: 20, height: 20, borderRadius: 10,
                        backgroundColor: Colors.primary,
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700", lineHeight: 14 }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Card>

        {/* Settings menu — hidden until implemented
        <Card padding={0} style={{ overflow: "hidden" }}>
          {SETTINGS_ITEMS.map((item, i) => (
            <View key={item.label} style={{ paddingHorizontal: 16 }}>
              {i > 0 && <View style={{ height: 1, backgroundColor: Colors.border }} />}
              <ProfileMenuItem
                icon={item.icon}
                label={item.label}
                subtitle={item.subtitle}
                onPress={() => {}}
              />
            </View>
          ))}
        </Card>
        */}

        {/* Logout card */}
        <Card padding={14} style={{ borderWidth: 1.5, borderColor: Colors.dangerLight }}>
          <Btn label="Sair da conta" variant="danger" onPress={handleLogout} />
        </Card>

        {/* Footer */}
        <Text style={{ textAlign: "center", fontSize: 12, color: Colors.textTer, marginTop: 4 }}>
          Planfin v1.0 · {user?.email}
        </Text>
      </ScrollView>
    </View>
  );
}
