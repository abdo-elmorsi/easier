import { useTheme } from "context/ThemeContext";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const useErrorMessage = () => {
  const [message, setMessage] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (message?.message) {
      switch (message.type) {
        case "success":
          toast.success(message.message, { theme });
          break;
        case "warning":
          toast.warn(message.message, { theme });
          break;
        default:
          toast.error(message.message, { theme });
      }
      setMessage(null);
    }
  }, [message, theme]);

  const handleMessage = async (
    errorOrMessage,
    type = "error",
    callback = null
  ) => {
    const message =
      typeof errorOrMessage === "string"
        ? errorOrMessage
        : errorOrMessage?.message || "An error has occurred";

    if (message === "CanceledError") {
      return;
    }

    setMessage({ message, type });

    if (callback && typeof callback === "function") {
      callback();
    }
  };

  return handleMessage;
};

export default useErrorMessage;
