import { useRef, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useSavedState } from "hooks";

const MinimizedBox = ({
  children,
  className = "",
  title = "filters_key",
  actionText,
  bordered = false
}) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useSavedState(false, `store-market-box-${router.pathname}-cache`); // Default to false for better UX
  const [prevHeight, setPrevHeight] = useState("");
  const comRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Reset filters function
  const resetFilters = () => {
    router.push({ pathname: router.pathname, query: {} }, undefined, { shallow: true });
  };

  // Handle minimize and loading state
  const handleMinimize = useCallback(() => {
    setLoading(true);
    setIsMinimized(prevState => !prevState);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [setIsMinimized]);

  // Handle height changes based on minimized state
  useEffect(() => {
    if (comRef.current) {
      comRef.current.style.height = isMinimized ? "0px" : (prevHeight || "auto");
      if (!isMinimized && !prevHeight) {
        setPrevHeight(`${comRef.current.offsetHeight}px`);
      }
    }
  }, [isMinimized, prevHeight]);

  // Classnames for the main container
  const boxClasses = classNames(
    "bg-white dark:bg-gray-800 rounded-xl shadow-md mb-4",
    { "border-b-2": bordered },
    className
  );

  const toggleText = isMinimized ? t("maximize_key") : t("minimize_key");

  return (
    <div className={boxClasses}>
      <div className="flex items-center justify-between p-4 rounded-t-xl">
        <h3 className="text-lg font-medium">{t(title)}</h3>
        <button
          aria-label="minimize toggler"
          disabled={loading}
          className={classNames(
            isMinimized ? "bg-gray-100" : "bg-secondary",
            "flex items-center justify-between gap-2 px-4 w-32 py-2 rounded-full focus:outline-none hover:bg-opacity-80 dark:hover:bg-opacity-100"
          )}
          onClick={handleMinimize}
          aria-expanded={!isMinimized}
        >
          <span className="font-medium text-primary">
            {actionText || toggleText}
          </span>
          <ChevronDownIcon
            className={classNames(
              "text-primary duration-300 h-4 w-4",
              { "transform rotate-180": isMinimized }
            )}
          />
        </button>
      </div>
      <div
        className={`duration-300 transition-all ${isMinimized || loading ? "overflow-hidden" : "overflow-visible"}`}
        style={{ height: isMinimized ? "0px" : prevHeight }}
        ref={comRef}
      >
        <div className="p-4">
          <div>{children}</div>
          <div className="flex justify-start items-center">
            <button aria-label={t("reset_key")} onClick={resetFilters} className="text-primary underline cursor-pointer">{t("reset_key")}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

MinimizedBox.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.string,
  actionText: PropTypes.string,
  bordered: PropTypes.bool,
  filters: PropTypes.arrayOf(PropTypes.func), // Specify expected type for filters
};

export default MinimizedBox;
