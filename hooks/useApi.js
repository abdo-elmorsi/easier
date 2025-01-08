import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import axiosInstance from "helper/apis/axiosInstance";

// Generic fetcher for GET requests
const fetcher = async (url) => {
  try {
    const { data } = await axiosInstance.get(url);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error fetching data");
  }
};

// Generic mutation handler for POST, PUT, DELETE requests
const mutationHandler = async (url, { arg }) => {
  const { method, data } = arg;

  try {
    let response;
    switch (method) {
      case 'POST':
        response = await axiosInstance.post(url, data);
        break;
      case 'PUT':
        response = await axiosInstance.put(url, data);
        break;
      case 'DELETE':
        response = await axiosInstance.delete(url, { data });
        break;
      default:
        throw new Error("Unsupported request method");
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error performing mutation");
  }
};

// Custom hook for GET requests
export const useApi = (endpoint, options = {}) => {
  const {
    revalidateOnFocus = true, // Enable revalidate on focus
    revalidateOnReconnect = true, // Enable revalidate on reconnect
    focusThrottleInterval = 3000, // Throttle revalidation
    refreshInterval = 0, // Set to a positive number to enable automatic refresh
    dedupingInterval = 2000, // Cache data for 2 seconds
    errorRetryCount = 2, //
    errorRetryInterval = 5000,
    ...restOptions
  } = options;

  const { data, error, isLoading, isValidating, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus,
    revalidateOnReconnect,
    focusThrottleInterval,
    refreshInterval,
    dedupingInterval,
    errorRetryCount,
    errorRetryInterval,
    ...restOptions,
  });

  return {
    data,
    error,
    isLoading, // True if loading
    isValidating,
    mutate,
  };
};

// Custom hook for POST, PUT, DELETE operations
export const useApiMutation = (endpoint) => {
  const { trigger, data, error, isMutating } = useSWRMutation(endpoint, mutationHandler);

  const executeMutation = async (method, data = null) => {
    try {
      return await trigger({ method, data });
    } catch (error) {
      // Handle errors appropriately
      throw new Error(error.message);
    }
  };

  return {
    executeMutation,
    data,
    error,
    isMutating,
  };
};