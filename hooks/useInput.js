import { useState, useCallback } from "react";
import { validationRules } from "utils";
import { isString } from "utils/validation-rules";

const useInput = (initialValue = '', validateRule = 'textInput', submitted) => {
    const [value, setValue] = useState(initialValue);
    const [validator, setValidator] = useState(() => validationRules(validateRule, initialValue));

    const handleOnChange = useCallback(event => {
        let value = event.target.value;
        setValidator(validationRules(validateRule, value));
        setValue(value);
    }, [setValue, setValidator, validateRule]);

    const reset = useCallback(() => {
        let value = isString(initialValue) ? initialValue.trim() : initialValue;
        setValidator(validationRules(validateRule, value));
        setValue(value);
    }, [setValue, setValidator, validateRule, initialValue]);

    const changeValue = useCallback(inputValue => {
        let value = validateRule === 'email' ? inputValue.trim() : inputValue;
        setValidator(validationRules(validateRule, value));
        setValue(value);
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
        bind: {
            value,
            onChange: handleOnChange,
            validator,
            submitted
        }
    };
};

export default useInput;