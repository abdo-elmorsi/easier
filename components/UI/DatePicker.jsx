import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const CustomDatePicker = ({ minDate, maxDate, value, onChange, label = "", mandatory, formGroup = true, ...props }) => {
	return (
		<div className={`w-full ${formGroup ? "mb-2" : ""} `}>
			{label && (
				<label
					className="block text-sm text-gray-800 dark:text-white"
				>
					{label} {mandatory && <span className="text-red-500">*</span>}
				</label>
			)}
			<DatePicker
				className="
				w-full
				bg-white
				hover:border-primary
				px-3
				py-2
				rounded-lg 
				 placeholder-gray-400 text-gray-700 border
          dark:bg-gray-800
           dark:text-white 
           dark:focus:bg-gray-800
            disabled:dark:bg-gray-600
            disabled:bg-gray-300
            disabled:focus:border-0
            disabled:hover:border-transparent
             focus:outline-none
              disabled:cursor-not-allowed
             focus:shadow-outline-blue
             focus:border-primary
				"
				minDate={minDate}
				maxDate={maxDate}
				selected={value}
				onChange={onChange}
				// locale='ar'
				{...props}
			/>
		</div>
	);
};

export default CustomDatePicker;