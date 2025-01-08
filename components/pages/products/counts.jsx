import { Input } from 'components/UI'
import { useTranslation } from 'react-i18next';

function Counts({ productId, quantityInStore, quantityInMarket }) {
	const { t } = useTranslation("common");

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 min-h-80">
			<Input disabled={false} label={t("quantity_in_store_key")} {...quantityInStore.bind} />
			<Input disabled={false} label={t("quantity_in_market_key")} {...quantityInMarket.bind} />
		</div>
	)
}

export default Counts