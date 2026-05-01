import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type UserAvatarProps = {
  size?: number;
  variant?: 'pink' | 'blue';
};

export function UserAvatar({ size = 44, variant = 'pink' }: UserAvatarProps) {
  const isBlue = variant === 'blue';

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isBlue ? '#9EE8F1' : '#FF8DC7',
        },
      ]}>
      <View
        style={[
          styles.hair,
          {
            width: size * 0.78,
            height: size * 0.78,
            borderRadius: size * 0.39,
            backgroundColor: isBlue ? '#20B6D8' : '#D7348C',
          },
        ]}
      />
      <View
        style={[
          styles.face,
          {
            width: size * 0.54,
            height: size * 0.54,
            borderRadius: size * 0.27,
          },
        ]}>
        <Ionicons name="happy-outline" color="#9C4265" size={size * 0.34} />
      </View>
      <View
        style={[
          styles.badge,
          {
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: size * 0.11,
            backgroundColor: isBlue ? '#7CE579' : '#7EE5D2',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hair: {
    position: 'absolute',
    top: 5,
    left: 5,
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD2B8',
  },
  badge: {
    position: 'absolute',
    right: 4,
    bottom: 5,
  },
});
