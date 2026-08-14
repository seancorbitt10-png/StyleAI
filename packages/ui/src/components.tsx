import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { tokens } from './tokens';

export function Screen({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function Display({ children }: { children: ReactNode }) {
  return <Text style={styles.display}>{children}</Text>;
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && styles.muted]}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          variant === 'primary' && styles.buttonLabelOnAccent,
          variant !== 'primary' && styles.buttonLabelInk,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  error,
  ...inputProps
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={tokens.color.muted}
        style={styles.input}
        {...inputProps}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.color.bg,
    paddingHorizontal: tokens.space.xl,
    paddingVertical: tokens.space.xxl,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  display: {
    fontSize: tokens.type.display,
    lineHeight: 46,
    color: tokens.color.ink,
    fontWeight: '600',
    letterSpacing: -0.8,
  },
  title: {
    fontSize: tokens.type.title,
    lineHeight: 34,
    color: tokens.color.ink,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  body: {
    fontSize: tokens.type.body,
    lineHeight: 24,
    color: tokens.color.ink,
  },
  muted: { color: tokens.color.muted },
  button: {
    minHeight: 48,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.space.xl,
  },
  buttonPrimary: { backgroundColor: tokens.color.accent },
  buttonSecondary: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.line,
  },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonLabel: { fontSize: 16, fontWeight: '600' },
  buttonLabelOnAccent: { color: tokens.color.accentOn },
  buttonLabelInk: { color: tokens.color.ink },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.45 },
  field: { gap: tokens.space.sm },
  fieldLabel: { fontSize: tokens.type.caption, color: tokens.color.muted, fontWeight: '600' },
  input: {
    minHeight: 48,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
    paddingHorizontal: tokens.space.lg,
    color: tokens.color.ink,
    fontSize: tokens.type.body,
  },
  error: { color: tokens.color.danger, fontSize: tokens.type.caption },
});
