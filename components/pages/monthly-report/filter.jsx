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


	const currentTower = router.query.tower_id || null;
	const currentFlat = router.query.flat_id || null;

	const { data: towers = [], isLoading } = useApi(`/towers?for_select=true`);
	const { data: flatsData = [], isLoading: isLoadingFlat } = useApi(currentTower ? `/flats?tower=${currentTower}&for_select=true` : null);

	const flats = useMemo(() => {
		return flatsData.map(row => {
			return { id: row.id, name: `n: ${row?.number} / f: ${row?.floor}` };
		})
	}, [flatsData])


	const defaultStartDate = moment().subtract(0, 'days'); // Default start date: one week ago

	// Ensure selectedMonth is set only if month is provided in the query
	const selectedMonth = useMemo(() => {
		const date = router.query.month ? moment(router.query.month) : defaultStartDate;
		return date.isValid() ? date.toDate() : defaultStartDate.toDate(); // return null if the date is invalid

	}, [router.query?.month, defaultStartDate]);

	const selectedTowerOption = findSelectedOption(towers, currentTower);
	const selectedFlatOption = findSelectedOption(flats, currentFlat);

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
				isLoading={isLoading}
			/>
			<Select
				label={t("flat_key")}
				options={flats}
				getOptionValue={(option) => option.id}
				getOptionLabel={(option) => option?.name}
				value={selectedFlatOption}
				onChange={(selected) => updateQuery('flat_id', selected?.id)}
				isLoading={isLoadingFlat}
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
