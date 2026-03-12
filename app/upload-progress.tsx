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

import { colors, spacing, radii, iconSize } from '@/constants/tokens';
import { ThemedText } from '@/components/ui/Typography';
import { ProgressBar, Button } from '@/components';
import { Upload, CheckCircle } from 'lucide-react-native';
import { useUIStore } from '@/stores/useUIStore';
import { BottomSheet } from '@/components/navigation/Navigation';

export default function UploadProgressScreen() {
  const { count = '0' } = useLocalSearchParams<{ count: string }>();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'uploading' | 'matching' | 'notifying' | 'done'>('uploading');
  const totalSteps = 100;
  const setUploadSuccessSnackbar = useUIStore((s) => s.setUploadSuccessSnackbar);
  const [cancelSheetOpen, setCancelSheetOpen] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);

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
        if (cancelRequested) {
          clearInterval(interval);
          return prev;
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      backHandler.remove();
      clearInterval(interval);
    };
  }, [status, cancelRequested]);

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
             {status === 'done' ? (
               <CheckCircle size={iconSize['4xl']} strokeWidth={0} fill={colors.primary} color={colors.primary} />
             ) : (
               <Upload size={iconSize['4xl']} strokeWidth={1.75} color={colors.primary} />
             )}
          </View>
        </Animated.View>

        <View style={styles.textContainer}>
          <ThemedText type="largeTitle" darkColor={colors.white} style={styles.title}>
            {status === 'uploading' && 'Uploading...'}
            {status === 'matching' && 'Finding faces...'}
            {status === 'notifying' && 'Sending alerts...'}
            {status === 'done' && 'All set!'}
          </ThemedText>
          <ThemedText type="body1" darkColor={colors.grey400} style={styles.body}>
            {status === 'uploading' && `Moving ${count} memories to the cloud.`}
            {status === 'matching' && 'Our privacy-first AI is scanning for you.'}
            {status === 'notifying' && 'Notifying guests about their matched photos.'}
            {status === 'done' && `Successfully shared ${count} moments.`}
          </ThemedText>
        </View>

        <View style={styles.progressContainer}>
           <ProgressBar value={progress} />
           <View style={styles.progressMeta}>
             <ThemedText type="caption" darkColor={colors.grey400}>{progress}% complete</ThemedText>
             <ThemedText type="caption" darkColor={colors.grey400}>{status.toUpperCase()}</ThemedText>
           </View>
        </View>

        <Animated.View entering={FadeIn.duration(500)} style={styles.footer}>
          {status === 'done' ? (
            <Button 
              variant="primary" 
              size="lg" 
              fullWidth 
              onPress={() => {
                setUploadSuccessSnackbar(true);
                router.back();
              }}
              iconLeft={<CheckCircle size={iconSize.md} strokeWidth={0} fill={colors.grey900} color={colors.grey900} />}
            >
              Done
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onPress={() => setCancelSheetOpen(true)}
            >
              Cancel Upload
            </Button>
          )}
        </Animated.View>
      </View>

      <BottomSheet
        visible={cancelSheetOpen}
        onClose={() => setCancelSheetOpen(false)}
        title="Cancel Upload?"
        subtitle="Photos already uploaded will remain. Remaining photos won't be uploaded."
        snapHeight={0.35}
      >
        <View style={styles.sheetContent}>
          <Button
            variant="destructive"
            fullWidth
            onPress={() => {
              setCancelRequested(true);
              setCancelSheetOpen(false);
              router.back();
            }}
          >
            Yes, Cancel Upload
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onPress={() => setCancelSheetOpen(false)}
          >
            Continue Uploading
          </Button>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[8],
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
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMid,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  body: {
    textAlign: 'center',
    paddingHorizontal: spacing[5],
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[3],
  },
  footer: {
    width: '100%',
    position: 'absolute',
    bottom: 60,
    paddingHorizontal: spacing[8],
  },
  sheetContent: {
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[3],
  },
});
