import React from "react";
import PropTypes from "prop-types";
import ReactSelect from "react-select";
import AsyncSelect from "react-select/async";
import TextError from "./TextError";
import { useTranslation } from "react-i18next";
import { useTheme } from "context/ThemeContext";

const Select = React.forwardRef((props, ref) => {
  const { theme } = useTheme();
  const darkMode = theme === "dark";
  const mainColor = "#336a86";

  const {
    label,
    validator,
    mandatory,
    submitted,
    isMulti = false,
    isClearable = true,
    formGroup = true,
    small = false,
    async = false,
    autoHeight = false,
    className = "",
    cacheOptions = true,
    placeholder = "select_key",
  } = props;

  const { t } = useTranslation("common");

  let hasWarning = submitted && validator && !validator.valid;

  const selectStyles = {
    control: (styles, { isDisabled }) => ({
      ...styles,
      borderColor: darkMode ? "bg-gray-700" : "#dee2e6",
      backgroundColor: darkMode ? "bg-gray-700" : "#fff",
      // backgroundColor: "#F7F7F7",
      borderRadius: "0.25rem",
      height: autoHeight ? "auto" : small ? "30px" : "41.90px",
      minHeight: autoHeight ? "auto" : small ? "30px" : "41.90px",
      cursor: isDisabled ? "not-allowed" : "pointer",
      "&:hover": {
        borderColor: darkMode ? mainColor : mainColor,
      },
    }),
    option: (styles, { isDisabled, isSelected, isFocused }) => ({
      ...styles,
      cursor: isDisabled ? "not-allowed" : "pointer",
      backgroundColor: darkMode
        ? isSelected
          ? mainColor
          : isFocused
            ? mainColor
            : isDisabled
              ? "#dee2e6"
              : "#212121"
        : isSelected
          ? mainColor
          : isFocused
            ? mainColor
            : isDisabled
              ? "#dee2e6"
              : undefined,
      color: isSelected || isFocused ? "#fff" : darkMode ? "#fff" : "inherit",
    }),
    placeholder: (styles) => ({
      ...styles,
      color: darkMode ? "text-gray-100" : "text-gray-400",
    }),
    singleValue: (styles) => ({
      ...styles,
      color: darkMode ? "#fff" : "inherit",
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: darkMode ? "#151824" : "#fff",
      color: darkMode ? mainColor : "#212121",
      zIndex: "999",
    }),
    input: (styles) => ({
      ...styles,
      color: darkMode ? "#fff" : "#151824",
    }),
  };

  return (
    <div
      className={`w-full ${formGroup ? "form-group" : ""} ${hasWarning ? "-mb-1" : ""
        }`}
    >
      {label && (
        <label className="block text-sm text-gray-800 dark:text-white">
          {label} {mandatory && <span className="text-red-900">*</span>}
        </label>
      )}
      {!async ? (
        <ReactSelect
          ref={ref}
          className={`react-select ${className} ${submitted && validator && !validator.valid
            ? "border-primary text-primary"
            : ""
            }`}
          styles={selectStyles}
          isMulti={isMulti}
          isClearable={isClearable}
          placeholder={t(placeholder)}
          {...props}
        />
      ) : (
        <AsyncSelect
          ref={ref}
          className={`react-select ${className} ${submitted && validator && !validator.valid
            ? "border-primary text-primary"
            : ""
            }`}
          styles={selectStyles}
          isMulti={isMulti}
          isClearable={isClearable}
          cacheOptions={cacheOptions}
          placeholder={t(placeholder)}
          {...props}
        />
      )}

      {hasWarning && <TextError>{validator.message}</TextError>}
    </div>
  );
});

Select.propTypes = {
  label: PropTypes.string,
  validator: PropTypes.object,
  mandatory: PropTypes.bool,
  submitted: PropTypes.bool,
  isMulti: PropTypes.bool,
  isClearable: PropTypes.bool,
  formGroup: PropTypes.bool,
  small: PropTypes.bool,
  async: PropTypes.bool,
  autoHeight: PropTypes.bool,
  className: PropTypes.string,
  cacheOptions: PropTypes.bool,
};
Select.displayName = "Select"; // Add the display name here

export default Select;
