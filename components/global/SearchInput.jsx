import { useMemo } from "react";
import PropTypes from "prop-types";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { Input } from "components/UI";

const SearchInput = ({ searchText, handleSearch, ...rest }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const language = router.locale.toLowerCase();

  const magnifyingGlassIcon = useMemo(() => (
    language != "en" ? <MagnifyingGlassIcon width={20} /> : ""
  ), [language]);

  const rtlMagnifyingGlassIcon = useMemo(() => (
    language == "en" ? <MagnifyingGlassIcon width={20} /> : ""
  ), [language]);
  return (
    <div className="w-full md:w-80">
      <Input
        type="text"
        formGroup={false}
        placeholder={t("search_key")}
        value={searchText}
        onChange={handleSearch}
        className="pl-10 rtl:pl-3 pr-10"
        append={magnifyingGlassIcon}
        prepend={rtlMagnifyingGlassIcon}
        {...rest}
      />
    </div>

  );
};

SearchInput.propTypes = {
  searchText: PropTypes.string.isRequired,
  handleSearch: PropTypes.func.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  maxLength: PropTypes.number,
  autoFocus: PropTypes.bool,
};

export default SearchInput;
