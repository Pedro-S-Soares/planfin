import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForgotPasswordMutation } from "../graphql/__generated__/hooks";
import { Button } from "../components/ui/Button";
import { FieldInput } from "../components/ui/FieldInput";
import type { AuthStackParamList } from "../../App";
import { palette, radius } from "../theme";
import { Text } from "../components/ui/Text";
import { BackLink } from "../components/ui/BackLink";

const schema = yup.object({
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
});

type FormValues = yup.InferType<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const [forgotPassword, { loading }] = useForgotPasswordMutation({
    onCompleted: () => setSent(true),
    onError: () => setSent(true),
  });

  const onSubmit = (values: FormValues) => forgotPassword({ variables: values });

  return (
    <View style={{ flex: 1, backgroundColor: palette.sheet }}>
      {/* Header */}
      <View style={{
        backgroundColor: palette.paper,
        paddingTop: 62,
        paddingBottom: 22,
        paddingHorizontal: 22,
        borderBottomWidth: 1,
        borderBottomColor: palette.rule,
      }}>
        <BackLink onPress={() => navigation.goBack()} />
        <Text style={{ fontSize: 26, fontWeight: "800", color: palette.ink, letterSpacing: -0.5 }}>
          Recuperar senha
        </Text>
        <Text style={{ fontSize: 13, color: palette.muted, marginTop: 3 }}>
          Enviaremos um link para o seu e-mail
        </Text>
      </View>

      <View style={{ padding: 22, paddingTop: 22 }}>
        {sent ? (
          <View style={{
            backgroundColor: palette.incomeSoft,
            borderRadius: radius.block,
            padding: 18,
            borderWidth: 1,
            borderColor: palette.income,
          }}>
            <Text style={{ fontSize: 15, color: palette.income, fontWeight: "700" }}>
              Link enviado!
            </Text>
            <Text style={{ fontSize: 13, color: palette.income, marginTop: 5, lineHeight: 20 }}>
              Verifique seu e-mail e siga as instruções para redefinir sua senha.
            </Text>
          </View>
        ) : (
          <>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FieldInput
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoFocus
                />
              )}
            />
            <Button label="Enviar link de recuperação" onPress={handleSubmit(onSubmit)} isLoading={loading} />
          </>
        )}
      </View>
    </View>
  );
}
