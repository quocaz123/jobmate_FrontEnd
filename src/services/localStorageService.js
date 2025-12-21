export const getItem = (key) => localStorage.getItem(key);
export const setItem = (key, value) => localStorage.setItem(key, value);
export const removeItem = (key) => localStorage.removeItem(key);

export const KEY_TOKEN = "access_token";
export const setToken = (token) => setItem(KEY_TOKEN, token);
export const getToken = () => getItem(KEY_TOKEN);
export const removeToken = () => removeItem(KEY_TOKEN);
