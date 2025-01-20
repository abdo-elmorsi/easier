import { useTranslation } from "next-i18next";
import { useSavedState } from "hooks";
import { useApi } from "hooks/useApi";
import { useRouter } from "next/router";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Tooltip,
	XAxis,
	YAxis,
	ResponsiveContainer,
} from "recharts";
import { Select } from "components/UI";
import { findSelectedOption, formatComma } from "utils/utils";

function EstimatedExpenses() {
	const router = useRouter();
	const { t } = useTranslation("common");
	const language = router.locale.toLowerCase();

	const { data: towers = [] } = useApi(`/towers?for_select=true`);

	const [tower_id, setTower_id] = useSavedState(null, "easier-2-selected-tower-for-payments-chart-cache");

	const selectedTowerOption = findSelectedOption(towers, tower_id);

	const { data = [], isLoading } = useApi(tower_id ? `/dashboard/payments?tower_id=${tower_id}` : null);

	return (
		<div className="mb-8 flex-1 p-4 bg-white rounded-lg shadow-sm dark:bg-slate-800">
			<div className="grid grid-cols-1 md:grid-cols-3 mb-2 items-center">
				<h2 className="text-xl font-bold col-span-2">
					{t("payed_amount_key")}
				</h2>
				<Select
					label={t("tower_key")}
					options={towers}
					getOptionValue={(option) => option.id}
					getOptionLabel={(option) => option.name}
					value={selectedTowerOption}
					onChange={(selected) => setTower_id(selected?.id)}
				/>
			</div>

			{isLoading ? (
				<SkeletonLoader />
			) : (
				<ResponsiveContainer width="100%" height={400}>
					<AreaChart
						data={data}
						margin={{ top: 10, right: language === "en" ? 40 : 0, left: 0, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip content={({ active, payload, label }) => {
							if (active && payload && payload.length) {
								return (
									<div className="p-4 bg-hoverPrimary text-white rounded-lg shadow-sm" >
										<p>{`${t('month_key')}: ${label}`}</p>
										<p>{`${t('payed_amount_key')}: ${formatComma(payload[0].value || 0)}`}</p> {/* Customize this to display your custom label */}
									</div>
								);
							}

							return null;
						}} />
						<Area
							type="monotone"
							dataKey="payed_amount"
							label={"tests"}
							stroke="var(--primary)"
							fill="var(--primary)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			)}
		</div>
	);
}

export default EstimatedExpenses;

const SkeletonLoader = () => (
	<div className="animate-pulse flex flex-col">
		<div className="h-32 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
		<div className="h-32 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
		<div className="h-32 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
	</div>
);
