import { Select } from 'components/UI';
import { useApi } from 'hooks/useApi';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { findSelectedOption } from 'utils/utils';
import { useQueryString } from 'hooks';

const Filter = () => {
	const { t } = useTranslation("common");
	const router = useRouter();
	const { updateQuery } = useQueryString();

	const { data: towers = [], isLoading } = useApi(`/towers?for_select=true`, {
		dedupingInterval: 10000,
	});


	const currentTower = router.query.tower_id || null;


	const selectedTowerOption = findSelectedOption(towers, currentTower);


	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10">
			<Select
				label={t("tower_key")}
				options={towers}
				getOptionValue={(option) => option.id}
				getOptionLabel={(option) => option.name}
				value={selectedTowerOption}
				isLoading={isLoading}
				onChange={(selected) => updateQuery('tower_id', selected?.id)}
			/>
		</div>
	);
};

export default Filter;
