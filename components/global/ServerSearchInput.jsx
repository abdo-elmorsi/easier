import { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Input } from "components/UI";
import { useRouter } from "next/router";
import debounce from "lodash.debounce";
import { useQueryString } from "hooks";

const ServerSearchInput = ({ placeholder, className, ...props }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { queryString, updateQuery } = useQueryString();
  const language = router.locale.toLowerCase();

  const _newQueryString = new URLSearchParams(queryString);
  const [searchQuery, setSearchQuery] = useState(_newQueryString.get("search") || "");

  // Debounced search function
  const onSearch = useCallback(
    debounce((query) => {
      updateQuery("search", query); // Update the URL query
    }, 500), [queryString]
  );

  const searchQueryHandle = useCallback(
    (event) => {
      const value = event.target.value;
      setSearchQuery(value);
      onSearch(value);
    },
    [setSearchQuery, onSearch]
  );

  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === "Enter") {
        const value = event.target?.value || "";
        setSearchQuery(value);
        onSearch(value);
      }
    },
    [setSearchQuery, onSearch]
  );

  const magnifyingGlassIcon = useMemo(
    () => (language !== "en" ? <MagnifyingGlassIcon width={20} /> : ""),
    [language]
  );

  const rtlMagnifyingGlassIcon = useMemo(
    () => (language === "en" ? <MagnifyingGlassIcon width={20} /> : ""),
    [language]
  );

  return (
    <div className="w-full md:w-80">
      <Input
        type="text"
        placeholder={placeholder || t("search_key")}
        className={`pl-10 pr-10 rtl:pl-3 ${className}`}
        onChange={searchQueryHandle}
        value={searchQuery}
        onKeyPress={handleKeyPress}
        append={magnifyingGlassIcon}
        prepend={rtlMagnifyingGlassIcon}
        {...props}
      />
    </div>
  );
};

// Prop Types validation
ServerSearchInput.propTypes = {
  placeholder: PropTypes.string,      // Optional placeholder prop
  className: PropTypes.string,        // Optional className prop
};



export default ServerSearchInput;
