import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import TextError from './TextError';

const Checkbox = ({ label, description, validator, submitted, formGroup, className, disabled, ...props }) => {
    const hasWarning = useMemo(() => submitted && validator && !validator.valid, [submitted, validator]);

    const boxClasses = `${description ? "-mt-4" : ""} ${className ? className : ""}`;

    return (
        <div className={`flex items-center ${boxClasses}`}>
            <input
                id={label}
                type="checkbox"
                disabled={disabled}
                aria-label={label}
                aria-invalid={hasWarning}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                {...props}
            />
            <label htmlFor={label} className="ml-2 block text-sm font-medium text-gray-800 dark:text-gray-300 rtl:pr-2">
                {label}
            </label>

            <div className="ml-2">
                {hasWarning && <TextError>{validator.message}</TextError>}
                {description && (
                    <span className="block text-sm text-gray-700 dark:text-gray-200 mt-1">{description}</span>
                )}
            </div>
        </div>
    );
};

Checkbox.propTypes = {
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
    validator: PropTypes.shape({
        valid: PropTypes.bool,
        message: PropTypes.string,
    }),
    submitted: PropTypes.bool,
    formGroup: PropTypes.bool,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
};

Checkbox.defaultProps = {
    formGroup: true,
    className: '',
    disabled: false,
};

export default Checkbox;
