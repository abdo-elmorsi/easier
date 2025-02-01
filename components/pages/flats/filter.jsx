import { Select } from 'components/UI';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { useQueryString } from 'hooks';
import { payPercentageOptions } from 'assets';

const Filter = () => {
	const { t } = useTranslation("common");
	const router = useRouter();
	const { updateQuery } = useQueryString();

	const currentPayPercentage = router.query.payPercentage;

	const selectedPayPercentageOption = payPercentageOptions.find(option => option.value == currentPayPercentage) || null

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10">
			<Select
				label={t("pay_percentage_key")}
				options={payPercentageOptions}
				value={selectedPayPercentageOption}
				onChange={(selected) => updateQuery('payPercentage', selected?.value.toString())}
			/>
		</div>
	);
};

export default Filter;
