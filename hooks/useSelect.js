import { useState, useCallback } from "react";
import { validationRules } from "utils";
import { isString } from "utils/validation-rules";

const useSelect = (initialValue = '', validateRule = 'textInput', submitted) => {
  const [value, setValue] = useState(initialValue);
  const [validator, setValidator] = useState(() => validationRules(validateRule, initialValue));
  const [options, setOptions] = useState();

  const handleOnChange = useCallback(selected => {
    let value = selected;

    //checking is select-all is selected
    if (selected && Array.isArray(selected) && options) {
      if (selected.some(c => c.isSelectAll)) {
        value = options;
      }
    }

    setValidator(validationRules(validateRule, Array.isArray(value) ? true : (value?.value || value?.id)));
    setValue(value);
  }, [setValue, setValidator, validateRule, options]);

  const reset = useCallback(() => {
    let value = isString(initialValue) ? initialValue.trim() : initialValue;
    setValidator(validationRules(validateRule, value));
    setValue(value);
  }, [setValue, setValidator, validateRule, initialValue]);

  const changeValue = useCallback(inputValue => {
    setValidator(validationRules(validateRule, Array.isArray(inputValue) ? true : (inputValue?.value || inputValue?.id)));
    setValue(inputValue);
  }, [setValue, setValidator, validateRule]);

  const setError = message => {
    const valid = !message;
    setValidator({ valid, message });
  };

  return {
    value,
    changeValue,
    isValid: validator && validator.valid,
    reset,
    setError,
    setOptions,
    bind: {
      value,
      onChange: handleOnChange,
      validator,
      submitted
    }
  };
};

export default useSelect;