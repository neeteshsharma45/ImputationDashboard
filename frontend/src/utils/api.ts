import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = {
  uploadDataset: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post(`${API_BASE_URL}/upload`, formData)
  },
  getAnalytics: (datasetId: string) => axios.get(`${API_BASE_URL}/analytics/${datasetId}`),
  runImputation: (datasetId: string, method: string) => axios.post(`${API_BASE_URL}/impute/${datasetId}/${method}`),
  getComparison: (datasetId: string) => axios.get(`${API_BASE_URL}/comparison/${datasetId}`),
  getPreview: (datasetId: string) => axios.get(`${API_BASE_URL}/preview/${datasetId}`),
  downloadUrl: (datasetId: string, format: string, method?: string) => {
    let url = `${API_BASE_URL}/download/${datasetId}/${format}`
    if (method) url += `?method=${method}`
    return url
  }
}
