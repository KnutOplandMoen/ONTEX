import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export interface Trial {
  id: number;
  nct_id: string;
  title: string;
  official_summary: string;
  custom_summary: string | null;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  last_updated: string;
}

export const api = axios.create({
  baseURL: API_URL,
});

export const getTrials = async (status: string = 'PENDING_REVIEW'): Promise<Trial[]> => {
  const response = await api.get<Trial[]>('/trials', {
    params: { status },
  });
  return response.data;
};

export const updateTrial = async (
  nct_id: string,
  data: { status: string; custom_summary?: string }
): Promise<Trial> => {
  const response = await api.patch<Trial>(`/trials/${nct_id}`, data);
  return response.data;
};

