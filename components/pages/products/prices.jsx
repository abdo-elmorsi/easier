import { Input } from 'components/UI'
import { useTranslation } from 'react-i18next';

function Prices({ price, wholesalePrice, piecesNo }) {
	const { t } = useTranslation("common");

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 min-h-80">
			<Input mandatory label={t("price_key")} {...price.bind} />
			<Input mandatory label={t("wholesale_price_key")} {...wholesalePrice.bind} />
			<Input mandatory label={t("number_of_pieces_key")} {...piecesNo.bind} />
		</div>
	)
}

export default Prices