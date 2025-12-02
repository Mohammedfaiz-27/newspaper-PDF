import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/process-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getJobStatus = async (jobId) => {
  const response = await api.get(`/status/${jobId}`);
  return response.data;
};

export const getJobResult = async (jobId) => {
  const response = await api.get(`/result/${jobId}`);
  return response.data;
};

export const searchArticles = async (query, limit = 10) => {
  const response = await api.post('/search', {
    query,
    limit,
  });
  return response.data;
};

export const getArticlesByKeyword = async (keyword, limit = 20) => {
  const response = await api.get(`/keywords/${keyword}/articles`, {
    params: { limit },
  });
  return response.data;
};

export const getArticle = async (articleId) => {
  const response = await api.get(`/articles/${articleId}`);
  return response.data;
};

export default api;
