import { useMemo } from "react";
import moment from 'moment-timezone';
import { useTranslation } from "react-i18next";

// Custom
import { Spinner } from "components/UI";
import { useQueryString } from "hooks";
import { useApi } from "hooks/useApi";
import { useRouter } from "next/router";


function Counts() {
	const router = useRouter();
	const { t } = useTranslation("common");
	const startDate = router.query.startDate || moment().subtract(1, "month").format("YYYY-MM-DD"); // Default to 1 month ago
	const endDate = router.query.endDate || moment().format("YYYY-MM-DD"); // Default to today

	const { queryString } = useQueryString({ startDate, endDate });

	// Fetch data using the API
	const { data, isLoading } = useApi(`/dashboard/counts?${queryString}`, {
		dedupingInterval: 10000,
	});

	// Memoize the table data to avoid unnecessary recalculations
	const tableData = useMemo(() => [
		{
			title: "users_key",
			count: data?.userCount || 0,
			desc: "users_key",
			percentage: data?.userPercentChange || 0,
			duration: moment(startDate).fromNow(),
		},
		{
			title: "flats_key",
			count: data?.productCount || 0,
			desc: "flats_key",
			percentage: data?.productPercentChange || 0,
			duration: moment(startDate).fromNow(),
		},
	], [data, startDate]);
	return (
		<div className="grid grid-rows-2 gap-4 mb-8 sm:grid-cols-2 md:grid-cols-2">
			{tableData.map((card, idx) => (
				<div key={`${card.count}-${idx}`} className="p-4 bg-white rounded-lg shadow-sm dark:bg-slate-800">
					<div className="font-bold text-slate-600 dark:text-slate-200">
						{t(card.title)}
					</div>
					<h3 className="mt-3 text-2xl font-semibold text-primary">
						{isLoading ? (
							<Spinner className="w-5 h-5 text-primary" />
						) : (
							<span>{card.count}</span>
						)}
						<span className="px-2 text-sm text-slate-400 dark:text-slate-200">
							{t(card.desc)}
						</span>
					</h3>
					<div className="flex mt-3">
						<span
							className={`p-1 text-sm ${card.percentage < 0 ? "text-red-600 font-bold bg-red-100" : "text-green-600 font-bold bg-green-100"} rounded-md`}
							aria-live="polite" // Inform assistive technologies about status changes
						>
							{isLoading ? (
								<Spinner
									className={`w-10 h-5 ${card.percentage < 0 ? "text-red-600" : "text-green-600"}`}
									aria-label="Loading percentage" // Add aria-label for accessibility
								/>
							) : (
								<span dir="ltr" className="text-gray-800">{`${card.percentage}%`}</span> // Ensure text contrast
							)}
						</span>
						<span dir="ltr" className="mx-2 font-thin text-gray-900 dark:text-gray-200">
							{card.duration}
						</span>
					</div>

				</div>
			))}
		</div>
	)
}

export default Counts