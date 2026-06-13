import client from './client';
import imageCompression from 'browser-image-compression';

export async function uploadImages(files, sessionId = null, onProgress = null) {
  let currentSessionId = sessionId;
  const allFilenames = [];
  const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
  const totalFiles = files.length;

  // Calculate total bytes for overall progress
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  let uploadedBytes = 0;

  // Upload files using chunking to avoid Vercel's 4.5MB payload limit
  for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
    const file = files[fileIndex];
    const originalName = file.name;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    if (onProgress) {
      onProgress({
        phase: 'uploading',
        currentFile: originalName,
        fileIndex,
        totalFiles,
        fileProgress: 0,
        overallProgress: totalBytes > 0 ? (uploadedBytes / totalBytes) * 100 : 0,
      });
    }

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      const chunkSize = end - start;
      
      const formData = new FormData();
      formData.append('chunk', chunk, originalName);
      formData.append('chunk_index', chunkIndex);
      formData.append('total_chunks', totalChunks);
      formData.append('file_id', originalName);
      if (currentSessionId) {
        formData.append('session_id', currentSessionId);
      }
      
      try {
        const { data } = await client.post('/upload-chunk', formData);
        if (data.session_id) {
          currentSessionId = data.session_id;
        }
        if (data.filename && chunkIndex === totalChunks - 1) {
          allFilenames.push(data.filename);
        }

        uploadedBytes += chunkSize;
        if (onProgress) {
          onProgress({
            phase: 'uploading',
            currentFile: originalName,
            fileIndex,
            totalFiles,
            fileProgress: ((chunkIndex + 1) / totalChunks) * 100,
            overallProgress: totalBytes > 0 ? (uploadedBytes / totalBytes) * 100 : 0,
          });
        }
      } catch (error) {
        console.error(`Failed to upload chunk ${chunkIndex} of ${originalName}:`, error);
        throw error;
      }
    }
  }

  if (onProgress) {
    onProgress({ phase: 'complete', overallProgress: 100 });
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

export async function getDownloadUrl(sessionId) {
  const { data } = await client.get('/download-results', {
    params: { session_id: sessionId }
  });
  
  if (data.url && data.url.startsWith('/api/download-stream')) {
    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '/api';
    return `${apiBaseUrl}${data.url.replace('/api', '')}`;
  }
  
  return data.url;
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
