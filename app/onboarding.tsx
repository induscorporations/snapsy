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
import { Colors, SPACING, RADIUS, PRIMARY, BACKGROUND_DARK, G400, G800 } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/Typography';
import { Icon, IconName } from '@/components/ui/Icon';
import { SelfiePicker } from '@/components/selfie-picker';

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
          <Icon name={item.icon} size={48} color={PRIMARY} solid />
        </View>
      </Animated.View>
      
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.content}>
        <ThemedText type="largeTitle" darkColor="#FFFFFF" style={styles.title}>
          {item.title}
        </ThemedText>
        <ThemedText type="body1" darkColor={G400} style={styles.body}>
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
              iconR="bell"
            >
              Enable Notifications
            </Button>
          ) : currentSlide.type === 'selfie' ? (
            <ThemedText type="caption" darkColor={G400} style={styles.selfieNotice}>
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
    backgroundColor: BACKGROUND_DARK,
  },
  slide: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
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
    backgroundColor: 'rgba(108, 240, 115, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 240, 115, 0.2)',
  },
  content: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingBottom: 100,
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  body: {
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  selfieContainer: {
    width: '100%',
    marginTop: SPACING.xl,
  },
  selfieNotice: {
    textAlign: 'center',
    paddingTop: SPACING.md,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    backgroundColor: BACKGROUND_DARK,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    backgroundColor: PRIMARY,
    width: 20,
  },
  buttonRow: {
    width: '100%',
  },
});
