import httpClient from './httpClient';

const USER_ENDPOINTS = {
  KUNDLI: '/kundli',
  HOROSCOPE: '/horoscope',
  MATCHMAKING: '/matchmaking',
  TAROT: '/tarot',
  NUMEROLOGY: '/numerology',
  REFER: '/refer',
};

export const userApi = {
  // Kundli
  generateKundli: async (kundliData) => {
    const response = await httpClient.post(USER_ENDPOINTS.KUNDLI, kundliData);
    return response.data;
  },

  getKundli: async (kundliId) => {
    const response = await httpClient.get(`${USER_ENDPOINTS.KUNDLI}/${kundliId}`);
    return response.data;
  },

  // Horoscope
  getDailyHoroscope: async (sign) => {
    const response = await httpClient.get(`${USER_ENDPOINTS.HOROSCOPE}/daily`, {
      params: { sign },
    });
    return response.data;
  },

  getWeeklyHoroscope: async (sign) => {
    const response = await httpClient.get(`${USER_ENDPOINTS.HOROSCOPE}/weekly`, {
      params: { sign },
    });
    return response.data;
  },

  getMonthlyHoroscope: async (sign) => {
    const response = await httpClient.get(`${USER_ENDPOINTS.HOROSCOPE}/monthly`, {
      params: { sign },
    });
    return response.data;
  },

  // Matchmaking
  checkCompatibility: async (data1, data2) => {
    const response = await httpClient.post(USER_ENDPOINTS.MATCHMAKING, {
      person1: data1,
      person2: data2,
    });
    return response.data;
  },

  // Tarot
  getTarotReading: async (question) => {
    const response = await httpClient.post(USER_ENDPOINTS.TAROT, { question });
    return response.data;
  },

  // Numerology
  getNumerologyReport: async (birthData) => {
    const response = await httpClient.post(USER_ENDPOINTS.NUMEROLOGY, birthData);
    return response.data;
  },

  // Refer & Earn
  getReferralCode: async () => {
    const response = await httpClient.get(`${USER_ENDPOINTS.REFER}/code`);
    return response.data;
  },

  getReferralStats: async () => {
    const response = await httpClient.get(`${USER_ENDPOINTS.REFER}/stats`);
    return response.data;
  },
};

