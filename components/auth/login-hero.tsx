import { StyleSheet, Text, View } from 'react-native';

import { loginPalette } from './login-theme';

const brandTitle = 'S\u00eanior Med';
const brandSubtitle = 'Fa\u00e7a o login para acessar a \u00e1rea administrativa do SMED.';

type LoginHeroProps = {
  subtitle?: string;
  onBackPress?: () => void;
};

export function LoginHero({ onBackPress, subtitle = brandSubtitle }: LoginHeroProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroGlowRight} />
      <View style={styles.heroGlowLeft} />

      <View style={styles.brandBlock}>
        <Text style={styles.brandTitle}>{brandTitle}</Text>
        <Text style={styles.brandSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 300,
    overflow: 'hidden',
    paddingHorizontal: 30,
    paddingTop: 56,
    backgroundColor: loginPalette.mintLight,
  },
  heroGlowRight: {
    position: 'absolute',
    top: -138,
    right: -132,
    width: 342,
    height: 512,
    borderRadius: 256,
    backgroundColor: 'rgba(255,255,255,0.44)',
    transform: [{ rotate: '-8deg' }],
  },
  heroGlowLeft: {
    position: 'absolute',
    top: -86,
    left: -122,
    width: 366,
    height: 408,
    borderRadius: 204,
    backgroundColor: loginPalette.mintSoft,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(134, 220, 146, 0.48)',
  },
  brandBlock: {
    maxWidth: 320,
    marginTop: 46,
  },
  brandTitle: {
    color: loginPalette.white,
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 37,
    textShadowColor: 'rgba(9, 55, 84, 0.16)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandSubtitle: {
    marginTop: 4,
    color: loginPalette.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 25,
    textShadowColor: 'rgba(9, 55, 84, 0.16)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
