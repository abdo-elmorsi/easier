import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import TextError from './TextError';
import { CheckCircleIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Checkbox = ({ label, description, validator, submitted, formGroup, className, disabled, ...props }) => {
    const hasWarning = useMemo(() => submitted && validator && !validator.valid, [submitted, validator]);

    const boxClasses = `${formGroup ? "mb-2" : ""} ${hasWarning ? "-mb-1" : ""} ${description ? "-mt-4" : ""} ${className ? className : ""}`;

    return (
        <div className={`w-full ${boxClasses}`}>
            <label className="flex items-center cursor-pointer relative">
                <input
                    id={label}
                    type="checkbox"
                    disabled={disabled}
                    aria-label={label}
                    aria-labelledby="check-label"
                    aria-invalid={hasWarning}
                    className="peer h-6 w-6 cursor-pointer transition-all appearance-none rounded-full bg-secondary shadow hover:shadow-md border border-secondary checked:bg-primary checked:border-primary focus:outline-none"
                    {...props}
                />
                <span className="absolute text-primary  peer-checked:text-white top-[5px] left-[5px] rtl:left-auto rtl:right-[5px]">
                    {props.checked ? <CheckIcon strokeWidth={4} className='w-[0.875rem] h-[0.875rem] size-10' /> : <XMarkIcon strokeWidth={4} className='w-[0.875rem] h-[0.875rem] size-10' />}
                </span>

                <span id="check-label" className="ml-2 rtl:ml-0 rtl:mr-2">{label}</span>
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
