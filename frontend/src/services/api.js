import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

export const api = {
  async fetchHealth() {
    try {
      const res = await client.get('/health');
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Backend service is currently unavailable. Please check backend status.'
      };
    }
  },

  async fetchStatus() {
    try {
      const res = await client.get('/status');
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Unable to connect to backend diagnostics endpoint.'
      };
    }
  },

  async retrieveLocation(payload) {
    try {
      const res = await client.post('/location/retrieve', payload);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Unable to retrieve location data from authorized data sources.'
      };
    }
  },

  async generateContent(payload) {
    try {
      const res = await client.post('/content/generate', payload);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        status: err.response?.status,
        error: err.response?.data?.detail || 'AI Content generation service failed or encountered an error.'
      };
    }
  },

  async multiGenerateContent(payload) {
    try {
      const res = await client.post('/content/multi-generate', payload);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Multi-platform content generation failed.'
      };
    }
  },

  async generateX(payload) {
    try {
      const res = await client.post('/social/x/generate', payload);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'X (Twitter) post generation failed.'
      };
    }
  },

  async generateTwitter(payload) {
    return this.generateX(payload);
  },

  async generateInstagram(payload) {
    try {
      const res = await client.post('/social/instagram/generate', payload);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'Instagram caption generation failed.'
      };
    }
  },

  async generateLinkedIn(payload) {
    try {
      const res = await client.post('/social/linkedin/generate', payload);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || 'LinkedIn post generation failed.'
      };
    }
  },

  async fetchStoryboard(payload) {
    try {
      const res = await client.post('/presentations/storyboard', payload);
      return { success: true, storyboard: res.data.storyboard || [] };
    } catch (err) {
      return { success: false, storyboard: [] };
    }
  },

  async verifyOutputStatus(outputId, status, notes = '') {
    try {
      const res = await client.post(`/outputs/${outputId}/verify`, { status, notes });
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: 'Failed to update verification status.' };
    }
  },

  async exportPPTX(payload) {
    try {
      const res = await client.post('/export/pptx', payload, {
        responseType: 'blob'
      });
      
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Zenithian_${payload.location.replace(/\s+/g, '_')}_${payload.audience}.pptx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: 'PowerPoint (.pptx) export failed.'
      };
    }
  },

  async downloadPresentation(presentationId, filename = 'Presentation.pptx') {
    try {
      const res = await client.get(`/presentations/${presentationId}/download`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: 'Presentation download failed. File may need to be regenerated.'
      };
    }
  },

  async getHistory() {
    try {
      const res = await client.get('/history');
      return { success: true, history: res.data.history || [] };
    } catch (err) {
      return { success: false, history: [] };
    }
  },

  async saveHistory(item) {
    try {
      const res = await client.post('/history', item);
      return { success: true, data: res.data.item };
    } catch (err) {
      return { success: false };
    }
  },

  async deleteHistory(id) {
    try {
      await client.delete(`/history/${id}`);
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  }
};
