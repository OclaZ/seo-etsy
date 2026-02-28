import client from './client';

export async function uploadImages(files, sessionId = null) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const params = sessionId ? { session_id: sessionId } : {};
  const { data } = await client.post('/upload-images', formData, { params });
  return data;
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
