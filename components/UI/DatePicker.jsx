import React from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

const CustomDatePicker = ({ minDate, maxDate, value, onChange, label = "", mandatory, formGroup = true, ...props }) => {
	return (
		<div className={`w-full ${formGroup ? "form-group" : ""} `}>
			{label && (
				<label
					className="block text-sm text-gray-800 dark:text-white"
				>
					{label} {mandatory && <span className="text-red-500">*</span>}
				</label>
			)}
			<DatePicker
				className="
				text-gray-800 w-full bg-white dark:bg-gray-900 dark:text-white hover:border-primary border transition duration-300 ease-in-out hover:shadow-lg"
				minDate={minDate}
				maxDate={maxDate}
				value={value}
				onChange={onChange}
				locale='ar'
				{...props}
			/>
		</div>
	);
};

export default CustomDatePicker;