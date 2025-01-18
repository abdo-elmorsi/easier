import { Select } from 'components/UI';
import { useApi } from 'hooks/useApi';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { findSelectedOption } from 'utils/utils';
import { useQueryString } from 'hooks';
import { payPercentageOptions } from 'assets';

const Filter = () => {
	const { t } = useTranslation("common");
	const router = useRouter();
	const { updateQuery } = useQueryString();

	const { data: towers = [], isLoading } = useApi(`/towers?for_select=true`);


	const currentTower = router.query.tower || null;
	const currentPayPercentage = router.query.payPercentage;


	const selectedTowerOption = findSelectedOption(towers, currentTower);
	const selectedPayPercentageOption = payPercentageOptions.find(option => option.value == currentPayPercentage) || null


	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10">
			<Select
				label={t("tower_key")}
				options={towers}
				getOptionValue={(option) => option.id}
				getOptionLabel={(option) => option.name}
				value={selectedTowerOption}
				onChange={(selected) => updateQuery('tower', selected?.id)}
			/>

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
