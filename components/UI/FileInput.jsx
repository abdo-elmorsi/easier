import { Fragment, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { PaperClipIcon } from "@heroicons/react/24/outline";
import { TextError } from "components/UI";
import { useTranslation } from "react-i18next";

function FileInput({ value, label, name, className, errorMsg, onChange, placeholder, multiple = false, disabled, mandatory, ...rest }) {
  const { t } = useTranslation("common");
  const fileName = useMemo(() => {
    if (multiple) {
      return Object.values(value || {}).map(e => e.name).join(", ") || ""
    } else {
      return value?.name || ""
    }
  }, [value]);
  const handleChange = useCallback((event) => {
    const selectedFiles = event.target.files;
    if (multiple) {
      onChange(selectedFiles);
    } else {
      onChange(selectedFiles[0]);
    }
  }, [multiple, onChange]);

  return (
    <Fragment>
      <div className={`${className}`}>
        <label className="block" htmlFor={name}>
          <span className="block text-sm text-gray-800 dark:text-white">{label} {mandatory && <span className="text-red-500">*</span>}</span>
          <div className={`${disabled ? 'bg-gray-400' : ''}  relative hidden items-center justify-between px-4 py-2 border rounded-lg`}>
            <input
              className="hidden"
              type="file"
              name={name}
              id={name}
              onChange={handleChange}
              multiple={multiple}
              disabled={disabled}
              {...rest}
            />
            <span className={`${fileName ? "text-gray-600 dark:text-gray-300" : "text-gray-400"} sm:text-sm`}>{fileName || placeholder || t("choose_a_file_key")}</span>
            <PaperClipIcon className="w-5 h-5" />
          </div>
          {errorMsg && (
            <TextError className="mt-1 text-sm text-red-500">{errorMsg}</TextError>
          )}
        </label>
      </div>
    </Fragment>
  );
}

export default FileInput;
FileInput.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.shape({
      name: PropTypes.string,
      size: PropTypes.number,
      type: PropTypes.string,
      lastModified: PropTypes.number,
    }),
    PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        size: PropTypes.number,
        type: PropTypes.string,
        lastModified: PropTypes.number,
      })
    ),
  ]),
  label: PropTypes.oneOfType([ // Corrected this line
    PropTypes.string,
    PropTypes.node, // Allow for React nodes as well
  ]).isRequired,
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  errorMsg: PropTypes.string,
  placeholder: PropTypes.string,
  multiple: PropTypes.bool,
  mandatory: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};