import axios from 'axios';

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const useAbstractAPI = () => {
  const generateAbstract = async (data: any) => {
    const response = await axios.post(`${backendURL}/api/generate-abstract`, data);
    return response.data;
  };

  const chat = async (chatData: any) => {
    const response = await axios.post(`${backendURL}/api/chat`, chatData);
    return response.data;
  };

  const exportPNG = async (html: string, filename: string) => {
    const response = await axios.post(
      `${backendURL}/api/export-png`,
      { html, filename },
      { responseType: 'blob' }
    );
    
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    link.click();
  };

  return { generateAbstract, chat, exportPNG };
};
