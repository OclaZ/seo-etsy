import client from './client';
import imageCompression from 'browser-image-compression';

export async function uploadImages(files, sessionId = null) {
  let currentSessionId = sessionId;
  const allFilenames = [];

  // Upload files sequentially to avoid Vercel's 4.5MB payload limit
  for (let file of files) {
    // If the individual file is > 4MB, compress it first
    if (file.size > 4 * 1024 * 1024) {
      console.log(`Compressing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)...`);
      try {
        const options = {
          maxSizeMB: 4,
          maxWidthOrHeight: 4000,
          useWebWorker: true
        };
        file = await imageCompression(file, options);
      } catch (e) {
        console.warn('Image compression failed, trying to upload original', e);
      }
    }

    const formData = new FormData();
    formData.append('files', file);
    const params = currentSessionId ? { session_id: currentSessionId } : {};
    
    try {
      const { data } = await client.post('/upload-images', formData, { params });
      if (data.session_id) {
        currentSessionId = data.session_id;
      }
      if (data.filenames) {
        allFilenames.push(...data.filenames);
      }
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      throw error;
    }
  }

  return {
    session_id: currentSessionId,
    file_count: allFilenames.length,
    filenames: allFilenames
  };
}

export async function uploadKeywordFile(file, sessionId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('session_id', sessionId);
  const { data } = await client.post('/upload-keyword-file', formData);
  return data;
}

export async function uploadKeywordsText(sessionId, keywordsText) {
  const { data } = await client.post('/upload-keywords-text', {
    session_id: sessionId,
    keywords_text: keywordsText,
  });
  return data;
}

export async function getRenamePreview(sessionId, baseName) {
  const { data } = await client.get('/rename-preview', {
    params: { session_id: sessionId, base_name: baseName },
  });
  return data;
}

export async function renameImages(sessionId, baseName) {
  const { data } = await client.post('/rename-images', {
    session_id: sessionId,
    base_name: baseName,
  });
  return data;
}

export async function injectKeywords(sessionId, keywords = null, seoSettings = null, selectedFiles = null) {
  const body = {
    session_id: sessionId,
    keywords,
  };
  if (selectedFiles && selectedFiles.length > 0) {
    body.selected_files = selectedFiles;
  }
  if (seoSettings) {
    body.seo_settings = {
      title: {
        enabled: seoSettings.title.enabled,
        mode: seoSettings.title.mode,
        custom_value: seoSettings.title.customValue,
      },
      subject: {
        enabled: seoSettings.subject.enabled,
        mode: seoSettings.subject.mode,
        custom_value: seoSettings.subject.customValue,
      },
      tags: {
        enabled: seoSettings.tags.enabled,
        mode: seoSettings.tags.mode,
        custom_value: seoSettings.tags.customValue,
      },
      comments: {
        enabled: seoSettings.comments.enabled,
        mode: seoSettings.comments.mode,
        custom_value: seoSettings.comments.customValue,
      },
    };
  }
  const { data } = await client.post('/inject-keywords', body);
  return data;
}

export function getDownloadUrl(sessionId) {
  return `/api/download-results?session_id=${sessionId}`;
}

export async function checkMetadata(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post('/check-metadata', formData);
  return data;
}

export async function scrapeImages(url) {
  const { data } = await client.post('/scrape-images', { url });
  return data;
}

export async function downloadScrapedImages(images) {
  const response = await client.post('/download-scraped', { images }, {
    responseType: 'blob',
  });
  return response.data;
}

export async function convertImages(files, format) {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  const response = await client.post('/convert-images', formData, {
    params: { format },
    responseType: 'blob',
    timeout: 120000,
  });
  return response.data;
}
