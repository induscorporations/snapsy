import * as FileSystem from 'expo-file-system';

/**
 * Upload a photo from a local URI to Convex storage and save to photos table.
 * Uses expo-file-system to read local files (file://, content://) for React Native.
 */
export async function uploadPhotoFromUri(
  uri: string,
  options: {
    getUploadUrl: () => Promise<string>;
    savePhoto: (args: { eventId: string; storageId: string; uploadedBy: string }) => Promise<string>;
    eventId: string;
    uploadedBy: string;
  }
): Promise<{ photoId: string } | { error: string }> {
  try {
    const uploadUrl = await options.getUploadUrl();
    let blob: Blob;
    if (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://')) {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      const res = await fetch(dataUrl);
      blob = await res.blob();
    } else {
      const response = await fetch(uri);
      if (!response.ok) return { error: 'Failed to read image' };
      blob = await response.blob();
    }
    const uploadResult = await fetch(uploadUrl, {
      method: 'POST',
      body: blob,
      headers: { 'Content-Type': 'image/jpeg' },
    });
    if (!uploadResult.ok) {
      const text = await uploadResult.text();
      return { error: text || 'Upload failed' };
    }
    const { storageId } = (await uploadResult.json()) as { storageId: string };
    const photoId = await options.savePhoto({
      eventId: options.eventId,
      storageId,
      uploadedBy: options.uploadedBy,
    });
    return { photoId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Upload failed' };
  }
}
