import { DatePicker } from 'components/UI';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import moment from 'moment-timezone';
import { useMemo } from 'react';
import { useQueryString } from 'hooks';

const Filter = () => {
	const { t } = useTranslation("common");
	const router = useRouter();
	const { updateQuery } = useQueryString();


	// Set default dates
	const defaultStartDate = moment().subtract(1, 'month'); // Default start date: one week ago
	const defaultEndDate = moment(); // Default end date: today

	const selectedStartDate = useMemo(() => {
		const date = router.query?.startDate ? moment(router.query.startDate) : defaultStartDate;
		return date.isValid() ? date.toDate() : defaultStartDate.toDate();
	}, [router.query?.startDate, defaultStartDate]);

	const selectedEndDate = useMemo(() => {
		const date = router.query?.endDate ? moment(router.query.endDate) : defaultEndDate;
		return date.isValid() ? date.toDate() : defaultEndDate.toDate();
	}, [router.query?.endDate, defaultEndDate]);

	const handleDateChange = (key, date) => {
		const formattedDate = moment(date).isValid()
			? moment(date).format("YYYY-MM-DD")
			: key === "startDate"
				? defaultStartDate.format("YYYY-MM-DD")
				: defaultEndDate.format("YYYY-MM-DD");
		updateQuery(key, formattedDate);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-10">

			<DatePicker
				label={t("from_date_key")}
				value={selectedStartDate}
				onChange={(date) => handleDateChange('startDate', date)}
				maxDate={new Date()} // Prevent selecting future dates
			/>
			<DatePicker
				label={t("to_date_key")}
				value={selectedEndDate}
				onChange={(date) => handleDateChange('endDate', date)}
				maxDate={new Date()} // Prevent selecting future dates
			/>
		</div>
	);
};

export default Filter;
