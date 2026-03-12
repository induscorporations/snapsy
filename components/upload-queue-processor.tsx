import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { uploadPhotoFromUri } from '@/lib/uploadPhoto';
import { useUploadStore } from '@/stores/useUploadStore';

/**
 * Hydrates pending queue from AsyncStorage and processes it when online.
 */
export function UploadQueueProcessor() {
  const pendingQueue = useUploadStore((s) => s.pendingQueue);
  const removePending = useUploadStore((s) => s.removePending);
  const setPendingError = useUploadStore((s) => s.setPendingError);
  const hydratePending = useUploadStore((s) => s.hydratePending);
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const savePhoto = useMutation(api.photos.save);
  const processingRef = useRef(false);

  useEffect(() => {
    hydratePending();
  }, [hydratePending]);

  useEffect(() => {
    if (pendingQueue.length === 0 || processingRef.current) return;
    const item = pendingQueue[0];
    if (!item) return;

    processingRef.current = true;
    uploadPhotoFromUri(item.uri, {
      getUploadUrl: () => generateUploadUrl({ userId: item.uploadedBy as any }),
      savePhoto: (args) => savePhoto({ ...args, eventId: item.eventId, uploadedBy: item.uploadedBy }),
      eventId: item.eventId,
      uploadedBy: item.uploadedBy,
    })
      .then((out) => {
        if ('photoId' in out) {
          removePending(item.uri);
        } else {
          setPendingError(item.uri, out.error ?? 'Upload failed');
        }
      })
      .catch(() => {
        setPendingError(item.uri, 'Upload failed');
      })
      .finally(() => {
        processingRef.current = false;
      });
  }, [pendingQueue, removePending, setPendingError, generateUploadUrl, savePhoto]);

  return null;
}
