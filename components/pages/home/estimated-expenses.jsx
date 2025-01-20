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



	const { data, isLoading } = useApi(queryString.includes('tower_id') ? `/dashboard/estimated-expenses?${queryString}` : null, {
		dedupingInterval: 10000,
	});

	const colors = {
		electricity: "#5c6bc0",
		water: "#42a5f5",
		waste: "#66bb6a",
		guard: "#ab47bc",
		elevator: "#ff7043",
		others: "#29b6f6",
		total: "#26a69a",
	};

	return (
		<div className="mb-8 flex-1 p-4 bg-white rounded-lg shadow-sm dark:bg-slate-800">
			<h2 className=" text-xl font-bold col-span-2">{t("estimated_expenses_key")}</h2>


			{isLoading ? (
				<SkeletonLoader />
			) : (
				<ResponsiveContainer width="100%" height={400}>
					<AreaChart
						data={data}
						margin={{ top: 10, right: language == "en" ? 40 : 0, left: 0, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="month"
						// reversed={language === "ar"}  // Reverse the X-axis if language is Arabic (RTL)
						/>
						<YAxis />
						<Tooltip content={({ active, payload, label }) => {
							if (active && payload && payload.length) {
								return (
									<div className="p-4 bg-hoverPrimary text-white rounded-lg shadow-sm" >
										{Object.keys(colors).map((item, i) => {
											return (
												<p key={item} className={`mb-2 flex flex-row gap-2 items-center justify-between border-b-2 ${item == "total" ? "font-bold text-xl" : ""}`}>
													<span>{t(`${item}_key`)}:</span>
													<span>{formatComma(payload[i].value || 0)}</span>
												</p>
											);
										})}
									</div>
								);
							}
							return null;
						}} />

						{Object.keys(colors).map((key) => (
							<Area
								key={key}
								type="monotone"
								dataKey={key}
								stackId="1"
								stroke={colors[key]}
								fill={colors[key]}
							/>
						))}
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
