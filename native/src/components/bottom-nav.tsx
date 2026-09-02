import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Href, Link } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COPY } from '@/constants/copy';
import { colors, shadows, spacing, typography } from '@/constants/theme';
import { useNakNak } from '@/context/naknak-context';

type NavKey = 'home' | 'medicines' | 'call' | 'profile';

export function BottomNav({ active }: { active: NavKey }) {
  const { state } = useNakNak();
  const insets = useSafeAreaInsets();
  const copy = COPY[state.profile.language];

  const items: {
    key: NavKey;
    label: string;
    icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
    href: Href;
  }[] = [
    { key: 'home', label: copy.home, icon: 'home-variant', href: '/senior/home' },
    { key: 'medicines', label: copy.medicines, icon: 'pill', href: '/senior/medications' },
    { key: 'call', label: copy.call, icon: 'phone', href: '/senior/contacts' },
    { key: 'profile', label: copy.profile, icon: 'account-circle', href: '/senior/profile' },
  ];

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
    >
      {items.map((item) => (
        <View key={item.key} style={styles.itemSlot}>
          <Link href={item.href} asChild>
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active === item.key }}
              style={({ pressed }) => [
                styles.item,
                active === item.key && styles.activeItem,
                pressed && styles.pressed,
              ]}
            >
              {active === item.key ? <View style={styles.activeMark} /> : null}
              <MaterialCommunityIcons
                color={active === item.key ? colors.red : colors.inkMuted}
                name={item.icon}
                size={23}
              />
              <Text style={[styles.label, active === item.key && styles.activeText]}>{item.label}</Text>
            </Pressable>
          </Link>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'stretch',
    minHeight: 64,
    flexShrink: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: 6,
    paddingHorizontal: spacing.sm,
    gap: 4,
    ...shadows.nav,
  },
  itemSlot: { flex: 1, alignItems: 'stretch' },
  item: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 2,
  },
  activeItem: {
    backgroundColor: colors.redSoft,
  },
  activeMark: {
    position: 'absolute',
    top: 3,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.red,
  },
  label: { color: colors.inkMuted, fontSize: 12, lineHeight: 15, fontFamily: typography.bold },
  activeText: { color: colors.redDark },
  pressed: { opacity: 0.62 },
});
