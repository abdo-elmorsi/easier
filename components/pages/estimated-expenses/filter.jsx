import { DatePicker, Select } from 'components/UI';
import { useApi } from 'hooks/useApi';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { findSelectedOption } from 'utils/utils';
import { useQueryString } from 'hooks';
import { useMemo } from 'react';
import moment from 'moment-timezone';

const Filter = () => {
	const { t } = useTranslation("common");
	const router = useRouter();
	const { updateQuery } = useQueryString();

	const { data: towers = [], isLoading } = useApi(`/towers?for_select=true`);

	const currentTower = router.query.tower_id || null;

	// Ensure selectedMonth is set only if month is provided in the query
	const selectedMonth = useMemo(() => {
		if (router.query?.month) {
			const date = moment(router.query.month);
			return date.isValid() ? date.toDate() : null; // return null if the date is invalid
		}
		return null; // Do not default to a date
	}, [router.query?.month]);

	const selectedTowerOption = findSelectedOption(towers, currentTower);

	const handleDateChange = (key, date) => {
		const formattedDate = moment(date).isValid() ? moment(date).format("YYYY-MM-DD") : null; // return null if invalid date
		updateQuery(key, formattedDate);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10">
			<Select
				label={t("tower_key")}
				options={towers}
				getOptionValue={(option) => option.id}
				getOptionLabel={(option) => option.name}
				value={selectedTowerOption}
				onChange={(selected) => updateQuery('tower_id', selected?.id)}
			/>

			<DatePicker
				label={t("month_key")}
				value={selectedMonth}
				onChange={(date) => handleDateChange('month', date)}
				maxDate={new Date()} // Prevent selecting future dates
				dateFormat="MM/yyyy"
				showMonthYearPicker={true}
			/>
		</div>
	);
};

export default Filter;
