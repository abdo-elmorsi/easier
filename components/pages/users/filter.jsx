import { Select } from 'components/UI';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { findSelectedOption } from 'utils/utils';
import { useQueryString } from 'hooks';

const Filter = ({ roleOptions }) => {
	const { t } = useTranslation("common");
	const router = useRouter();
	const { updateQuery } = useQueryString();


	const currentRole = router.query?.role || null;
	const selectedOption = findSelectedOption(roleOptions, currentRole);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10">
			<Select
				label={t("role_key")}
				options={roleOptions}
				value={selectedOption}
				onChange={(selected) => updateQuery('role', selected?.value)}
			/>
		</div>
	);
};

export default Filter;
