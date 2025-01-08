import { DatePicker, Select } from 'components/UI';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import moment from 'moment-timezone';
import { useApi } from 'hooks/useApi';
import { findSelectedOption } from 'utils/utils';
import { useMemo } from 'react';
import { useQueryString } from 'hooks';
import makeAnimated from 'react-select/animated';
const animatedComponents = makeAnimated();

const Filter = ({ typeOptions = [], showType = false, showCreatedBy = true, showUpdatedBy = true }) => {
	const { t } = useTranslation("common");
	const router = useRouter();
	const { updateQuery } = useQueryString();

	const { data: userOptions = [] } = useApi(`/users?forSelect=true`);
	const { data: productOptions = [] } = useApi(`/products?forSelect=true`);

	const type = useMemo(() => router.query?.type ? router.query.type.split(",") : [], [router.query?.type]);

	const createdById = router.query?.createdById || null;
	const lastUpdatedById = router.query?.lastUpdatedById || null;
	const currentProduct = router.query?.productId || null;

	const selectedTypeOptions = useMemo(() => {
		return typeOptions.filter(option => type.includes(option.id.toString()));
	}, [typeOptions, type]);

	const selectedCreatedByOption = useMemo(() => findSelectedOption(userOptions, createdById), [userOptions, createdById]);
	const selectedLastUpdatedByOption = useMemo(() => findSelectedOption(userOptions, lastUpdatedById), [userOptions, lastUpdatedById]);
	const selectedProductOption = useMemo(() => findSelectedOption(productOptions, currentProduct), [productOptions, currentProduct]);

	// Set default dates
	const defaultStartDate = moment().subtract(0, 'days'); // Default start date: one week ago
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
			{showType && <Select
				label={t("transaction_type_key")}
				options={typeOptions}
				value={selectedTypeOptions}
				getOptionValue={(option) => option?.id}
				getOptionLabel={(option) => option?.name}
				isOptionDisabled={() => selectedTypeOptions.length >= 2}
				onChange={(selected) => {
					const value = selected.map(option => option.id).join(",");
					updateQuery("type", value);
				}}
				autoHeight
				isMulti
				components={animatedComponents}
			/>}
			<Select
				label={t("product_key")}
				options={productOptions}
				value={selectedProductOption}
				getOptionValue={(option) => option?.id}
				getOptionLabel={(option) => option?.name}
				onChange={(selected) => updateQuery("productId", selected?.id)}
			/>
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
			{showCreatedBy && <Select
				label={t("created_by_key")}
				options={userOptions}
				value={selectedCreatedByOption}
				getOptionValue={(option) => option?.id}
				getOptionLabel={(option) => option?.user_name}
				onChange={(selected) => updateQuery("createdById", selected?.id)}
			/>}
			{showUpdatedBy && < Select
				label={t("updated_by_key")}
				options={userOptions}
				value={selectedLastUpdatedByOption}
				getOptionValue={(option) => option?.id}
				getOptionLabel={(option) => option?.user_name}
				onChange={(selected) => updateQuery("lastUpdatedById", selected?.id)}
			/>}
		</div>
	);
};

export default Filter;
