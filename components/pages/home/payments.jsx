import { useTranslation } from "next-i18next";
import { useQueryString } from "hooks";
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
import { formatComma } from "utils/utils";

function EstimatedExpenses() {
	const router = useRouter();
	const { t } = useTranslation("common");
	const language = router.locale.toLowerCase();

	const { queryString } = useQueryString();


	const { data = [], isLoading } = useApi(`/dashboard/payments?${queryString}`, {
		dedupingInterval: 10000,
	});

	return (
		<div className="mb-8 flex-1 p-4 bg-white rounded-lg shadow-sm dark:bg-slate-800">
			<h2 className="text-xl font-bold col-span-2">{t("payed_amount_key")}</h2>

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
										<p>{`${t('payed_amount_key')}: ${formatComma(payload[0].value || 0)}`}</p>
										<p>{`${t('count_key')}: ${payload[0]?.payload?.count || 0}`}</p>
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
