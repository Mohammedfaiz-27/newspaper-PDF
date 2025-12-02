import axios from 'axios';
import type { ProcessResponse, JobStatus, ProcessResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadPDF = async (file: File): Promise<ProcessResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ProcessResponse>('/process-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getJobStatus = async (jobId: string): Promise<JobStatus> => {
  const response = await api.get<JobStatus>(`/status/${jobId}`);
  return response.data;
};

export const getJobResult = async (jobId: string): Promise<ProcessResult> => {
  const response = await api.get<ProcessResult>(`/result/${jobId}`);
  return response.data;
};

export default api;
