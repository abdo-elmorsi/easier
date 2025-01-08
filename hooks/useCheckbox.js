import { useState, useCallback } from "react";
import { validationRules } from "utils";

const useCheckbox = (initialValue, checkboxValue, validateRule, submitted = false) => {
    const [value, setValue] = useState(checkboxValue);
    const [checked, toggleCheckbox] = useState(initialValue);
    const [validator, setValidator] = useState(() => validationRules(validateRule, initialValue));

    const handleOnChange = useCallback(event => {
        setValidator(validationRules(validateRule, event.target.checked));
        toggleCheckbox(event.target.checked);
    }, [toggleCheckbox, setValidator, validateRule]);

    const reset = useCallback(() => {
        setValidator(validationRules(validateRule, initialValue));
        toggleCheckbox(initialValue);
    }, [toggleCheckbox, setValidator, validateRule, initialValue]);

    const changeValue = useCallback(checked => {
        setValidator(validationRules(validateRule, checked));
        toggleCheckbox(checked);
    }, [toggleCheckbox, setValidator, validateRule]);

    return {
        value,
        setValue,
        changeValue,
        checked,
        toggleCheckbox,
        isValid: validator && validator.valid,
        reset,
        bind: {
            value,
            checked,
            onChange: handleOnChange,
            validator,
            submitted
        }
    };
};

export default useCheckbox;