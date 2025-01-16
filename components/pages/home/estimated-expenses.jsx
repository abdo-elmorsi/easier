import { useMemo } from "react";
import moment from "moment-timezone";
import { useTranslation } from "react-i18next";
import { useQueryString, useSavedState } from "hooks";
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
import { findSelectedOption } from "utils/utils";

function EstimatedExpenses() {
	const router = useRouter();
	const { t } = useTranslation("common");
	const language = router.locale.toLowerCase();


	const { data: towers = [] } = useApi(`/towers`);


	const [tower_id, setTower_id] = useSavedState(null, "easier-2-selected-tower-for-estimated-expenses-chart-cache")

	const selectedTowerOption = findSelectedOption(towers, tower_id);



	const { data, isLoading } = useApi(
		`/dashboard/estimated-expenses?tower_id=${tower_id}`,
		{
			dedupingInterval: 10000,
		}
	);

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
			<div className="grid grid-cols-1 md:grid-cols-3 mb-2 items-center">
				<h2 className=" text-xl font-bold col-span-2">
					{t("estimated_expenses_key")}
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
						margin={{ top: 10, right: language == "en" ? 40 : 0, left: 0, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="month"
						// reversed={language === "ar"}  // Reverse the X-axis if language is Arabic (RTL)
						/>
						<YAxis />
						<Tooltip />
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
