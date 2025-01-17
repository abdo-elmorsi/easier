import { Select } from 'components/UI';
import { useApi } from 'hooks/useApi';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { findSelectedOption } from 'utils/utils';
import { useQueryString } from 'hooks';
import { ActionType, PageType } from 'assets';
import { useMemo } from 'react';

const Filter = () => {
	const { t } = useTranslation("common");
	const router = useRouter();
	const { updateQuery } = useQueryString();

	const pages = useMemo(() => Object.entries(PageType).map(([number, page]) => {
		return {
			label: t(`${page}_key`),
			id: number
		}
	}), []);
	const actions = useMemo(() => Object.entries(ActionType).map(([number, action]) => {
		return {
			label: t(`${action}_key`),
			id: number
		}
	}), []);
	const statuses = useMemo(() => [
		{ label: t("all_key"), id: null },
		{ label: t("success_key"), id: 'true' },
		{ label: t("failed_key"), id: 'false' }
	], []);

	const { data: users = [], loading } = useApi(`/users?for_select`);


	const currentPage = router.query.page_id || null;
	const currentActions = router.query.action_id || null;
	const currentUser = router.query.user_id || null;
	const currentStatus = router.query.status || null;


	const selectedPageOption = findSelectedOption(pages, currentPage);
	const selectedActionOption = findSelectedOption(actions, currentActions);
	const selectedUserOption = findSelectedOption(users, currentUser);
	const selectedStatusOption = findSelectedOption(statuses, currentStatus);


	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10">
			<Select
				label={t("page_key")}
				options={pages}
				value={selectedPageOption}
				getOptionValue={(option) => option.id}
				onChange={(selected) => updateQuery('page_id', selected?.id)}
			/>
			<Select
				label={t("actions_key")}
				options={actions}
				value={selectedActionOption}
				getOptionValue={(option) => option.id}
				onChange={(selected) => updateQuery('action_id', selected?.id)}
			/>
			<Select
				label={t("user_key")}
				options={users}
				getOptionValue={(option) => option.id}
				getOptionLabel={(option) => option.user_name}
				value={selectedUserOption}
				onChange={(selected) => updateQuery('user_id', selected?.id)}
			/>
			<Select
				label={t("status_key")}
				options={statuses}
				getOptionValue={(option) => option.id}
				value={selectedStatusOption}
				onChange={(selected) => updateQuery('status', selected?.id)}
			/>
		</div>
	);
};

export default Filter;
