import { Input, Select } from 'components/UI'
import { useApi } from 'hooks/useApi';
import { useTranslation } from 'react-i18next';

function MainInfo({ name, description, category, unit }) {
	const { t } = useTranslation("common");
	const { data: categories } = useApi(`/categories`);
	const { data: units } = useApi(`/units`);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 min-h-80">
			<Input mandatory label={t("name_key")} {...name.bind} />
			<Input label={t("description_key")} {...description.bind} />

			<Select
				mandatory
				label={t("category_key")}
				{...category.bind}
				options={categories}
				getOptionLabel={(option) => option.name}
				getOptionValue={(option) => option.id}
			/>
			<Select
				mandatory
				label={t("unit_key")}
				{...unit.bind}
				options={units}
				getOptionLabel={(option) => option.name}
				getOptionValue={(option) => option.id}
			/>
		</div>
	)
}

export default MainInfo