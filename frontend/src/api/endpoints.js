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

export async function injectKeywords(sessionId, keywords = null) {
  const { data } = await client.post('/inject-keywords', {
    session_id: sessionId,
    keywords,
  });
  return data;
}

export function getDownloadUrl(sessionId) {
  return `/api/download-results?session_id=${sessionId}`;
}
