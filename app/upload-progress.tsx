import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeInUp, 
  Layout, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

import { BACKGROUND_DARK, SPACING, PRIMARY, G400, G800 } from '@/constants/theme';
import { ThemedText } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function UploadProgressScreen() {
  const { count = '0' } = useLocalSearchParams<{ count: string }>();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'uploading' | 'matching' | 'notifying' | 'done'>('uploading');
  const totalSteps = 100;

  useEffect(() => {
    // Prevent accidentally going back during upload
    const backAction = () => {
      if (status !== 'done') return true;
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
    // Simulate upload/matching process for MVP premium feel
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      backHandler.remove();
      clearInterval(interval);
    };
  }, [status]);

  useEffect(() => {
    if (progress < 40) setStatus('uploading');
    else if (progress < 80) setStatus('matching');
    else if (progress < 100) setStatus('notifying');
    else setStatus('done');
  }, [progress]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200)} style={styles.iconContainer}>
          <View style={styles.iconCircle}>
             <Icon 
               name={status === 'done' ? 'checkCircle' : 'upload'} 
               size={48} 
               color={PRIMARY} 
               solid={status === 'done'} 
             />
          </View>
        </Animated.View>

        <View style={styles.textContainer}>
          <ThemedText type="largeTitle" darkColor="#FFFFFF" style={styles.title}>
            {status === 'uploading' && 'Uploading...'}
            {status === 'matching' && 'Finding faces...'}
            {status === 'notifying' && 'Sending alerts...'}
            {status === 'done' && 'All set!'}
          </ThemedText>
          <ThemedText type="body1" darkColor={G400} style={styles.body}>
            {status === 'uploading' && `Moving ${count} memories to the cloud.`}
            {status === 'matching' && 'Our privacy-first AI is scanning for you.'}
            {status === 'notifying' && 'Notifying guests about their matched photos.'}
            {status === 'done' && `Successfully shared ${count} moments.`}
          </ThemedText>
        </View>

        <View style={styles.progressContainer}>
           <ProgressBar value={progress} />
           <View style={styles.progressMeta}>
             <ThemedText type="caption" darkColor={G400}>{progress}% complete</ThemedText>
             <ThemedText type="caption" darkColor={G400}>{status.toUpperCase()}</ThemedText>
           </View>
        </View>

        {status === 'done' && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.footer}>
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth 
              onPress={() => router.back()}
              iconL="checkCircle"
            >
              Done
            </Button>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_DARK,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
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
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  footer: {
    width: '100%',
    position: 'absolute',
    bottom: 60,
    paddingHorizontal: SPACING.xl,
  },
});
