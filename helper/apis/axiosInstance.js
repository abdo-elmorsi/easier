import axios from "axios";
import { CancelToken } from "axios";
import { signOut } from "next-auth/react";

let cancelTokenSources = {};

// Function to get the client's timezone
const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;


const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Timezone": getTimezone(),
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  // Create a cancel token source for each unique request URL
  const requestUrl = config.url;
  if (cancelTokenSources[requestUrl]) {
    cancelTokenSources[requestUrl].cancel("Request cancelled due to new request");
  }
  cancelTokenSources[requestUrl] = CancelToken.source();
  config.cancelToken = cancelTokenSources[requestUrl].token;
  return config;
});

axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    if (axios.isCancel(error)) {
      return Promise.reject({ response: { data: { message: error.name } } });
    } else if (error.response?.status === 401) {
      await signOut();
      return Promise.reject(error);
    } else {
      return Promise.reject(error);
    }
  }
);

// Export the function to cancel requests with a specific URL
export const cancelRequestWithUrl = (url) => {
  if (cancelTokenSources[url]) {
    cancelTokenSources[url].cancel("Request cancelled externally");
  }
};

export default axiosInstance;
