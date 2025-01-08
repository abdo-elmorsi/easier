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

	const { data: productOptions = [] } = useApi(`/products?forSelect=true`);
	const { data: categoryOptions = [] } = useApi(`/categories`);
	const { data: unitOptions = [] } = useApi(`/units`);



	const currentProduct = router.query.product || null;
	const currentCategory = router.query.category || null;
	const currentUnit = router.query.unit || null;


	const selectedProductOption = findSelectedOption(productOptions, currentProduct);
	const selectedCategoryOption = findSelectedOption(categoryOptions, currentCategory);
	const selectedUnitOption = findSelectedOption(unitOptions, currentUnit);

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10">
			<Select
				label={t("product_key")}
				options={productOptions}
				getOptionValue={(option) => option.id}
				getOptionLabel={(option) => option.name}
				value={selectedProductOption}
				onChange={(selected) => updateQuery('product', selected?.id)}
			/>

			<Select
				label={t("category_key")}
				options={categoryOptions}
				getOptionValue={(option) => option.id}
				getOptionLabel={(option) => option.name}
				value={selectedCategoryOption}
				onChange={(selected) => updateQuery('category', selected?.id)}
			/>

			<Select
				label={t("unit_key")}
				options={unitOptions}
				getOptionValue={(option) => option.id}
				getOptionLabel={(option) => option.name}
				value={selectedUnitOption}
				onChange={(selected) => updateQuery('unit', selected?.id)}

			/>
		</div>
	);
};

export default Filter;
