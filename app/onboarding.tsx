import { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as Notifications from 'expo-notifications';

import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors, spacing, radii, iconSize } from '@/constants/tokens';
import { Button } from '@/components';
import { ThemedText } from '@/components/ui/Typography';
import { Camera, Zap, Shield, Bell, User } from 'lucide-react-native';
import { SelfiePicker } from '@/components/selfie-picker';

const SLIDE_ICON_MAP = { camera: Camera, zap: Zap, shield: Shield, bell: Bell, user: User } as const;
type IconName = keyof typeof SLIDE_ICON_MAP;

const { width, height } = Dimensions.get('window');

type SlideType = 'content' | 'notifications' | 'selfie';

const SLIDES: { id: string; title: string; body: string; icon: IconName; type: SlideType }[] = [
  {
    id: 'welcome',
    title: 'Your photos,\nonly your face',
    body: 'No tagging. No scrolling. Photos of you, delivered automatically to your private vault.',
    icon: 'camera',
    type: 'content',
  },
  {
    id: 'how-it-works',
    title: 'Join events.\nGet your pics.',
    body: 'Hosts upload. Our privacy-first AI finds you. You instantly download what’s yours.',
    icon: 'zap',
    type: 'content',
  },
  {
    id: 'privacy',
    title: 'Private by design',
    body: 'Face matching runs on your device. We never store your face data. 100% encrypted.',
    icon: 'shield',
    type: 'content',
  },
  {
    id: 'notifications',
    title: 'Never miss a\nmoment',
    body: 'Enable notifications to get alerted as soon as your photos are found in an event.',
    icon: 'bell',
    type: 'notifications',
  },
  {
    id: 'selfie',
    title: 'Finish your\nprofile',
    body: 'Take a quick selfie. This stays on your device and is used to match you in event photos.',
    icon: 'user',
    type: 'selfie',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const setHasCompletedOnboarding = useUIStore((s) => s.setHasCompletedOnboarding);
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const [hasSelfie, setHasSelfie] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<Notifications.PermissionStatus | null>(null);

  useEffect(() => {
    checkNotifications();
  }, []);

  const checkNotifications = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationStatus(status);
  };

  const requestNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationStatus(status);
    if (status === 'granted') {
      nextSlide();
    } else {
      Alert.alert(
        'Notifications Disabled',
        'You can enable them later in settings to stay updated.',
        [{ text: 'Continue', onPress: nextSlide }]
      );
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const nextSlide = () => {
    if (index < SLIDES.length - 1) {
      flatRef.current?.scrollToOffset({ offset: width * (index + 1), animated: true });
    } else if (hasSelfie) {
      onFinish();
    }
  };

  const onFinish = () => {
    setHasCompletedOnboarding(true);
    router.replace('/(tabs)');
  };

  const renderItem = ({ item, index: i }: { item: (typeof SLIDES)[0], index: number }) => (
    <View style={[styles.slide, { width }]}>
      <Animated.View 
        entering={FadeInUp.delay(100).duration(600)} 
        style={styles.illustrationContainer}
      >
        <View style={styles.iconCircle}>
          {(() => {
            const IconComponent = SLIDE_ICON_MAP[item.icon];
            return <IconComponent size={iconSize['4xl']} strokeWidth={0} fill={colors.primary} color={colors.primary} />;
          })()}
        </View>
      </Animated.View>
      
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.content}>
        <ThemedText type="largeTitle" darkColor={colors.white} style={styles.title}>
          {item.title}
        </ThemedText>
        <ThemedText type="body1" darkColor={colors.grey400} style={styles.body}>
          {item.body}
        </ThemedText>

        {item.type === 'selfie' && (
          <View style={styles.selfieContainer}>
            <SelfiePicker 
              userId={convexUserId || ''} 
              onSaved={() => {
                setHasSelfie(true);
                // Auto-finish after selfie is saved during onboarding
                setTimeout(onFinish, 1000);
              }}
              variant="onboarding"
            />
          </View>
        )}
      </Animated.View>
    </View>
  );

  const currentSlide = SLIDES[index];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        ref={flatRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={index < 3 || (index === 3 && notificationStatus !== null) || (index === 4 && hasSelfie)}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        scrollEventThrottle={16}
      />
      
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
        
        <View style={styles.buttonRow}>
          {currentSlide.type === 'notifications' ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={requestNotifications}
              iconRight={<Bell size={iconSize.md} strokeWidth={0} fill={colors.grey900} color={colors.grey900} />}
            >
              Enable Notifications
            </Button>
          ) : currentSlide.type === 'selfie' ? (
            <ThemedText type="caption" darkColor={colors.grey400} style={styles.selfieNotice}>
              Selfie is mandatory to find you in photos.
            </ThemedText>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={nextSlide}
            >
              Continue
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  slide: {
    flex: 1,
    paddingHorizontal: spacing[8],
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMid,
  },
  content: {
    alignItems: 'center',
    marginTop: spacing[8],
    paddingBottom: 100,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  body: {
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  selfieContainer: {
    width: '100%',
    marginTop: spacing[8],
  },
  selfieNotice: {
    textAlign: 'center',
    paddingTop: spacing[4],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[12],
    backgroundColor: colors.darkBg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
    marginBottom: spacing[8],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.xs,
    backgroundColor: colors.darkSurface2,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  buttonRow: {
    width: '100%',
  },
});
