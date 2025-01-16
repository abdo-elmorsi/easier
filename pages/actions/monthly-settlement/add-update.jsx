import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/react";
import PropTypes from "prop-types"
import { useRouter } from "next/router";

// Custom
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";
import { Button, Input, Select, Spinner } from "components/UI";
import { useHandleMessage, useInput, useSelect } from "hooks";
import { useApi, useApiMutation } from "hooks/useApi";
import { formatComma } from "utils/utils";
const month_d = new Date();

const Index = () => {
	const router = useRouter();
	const monthlySettlementId = router.query.id;
	const handleMessage = useHandleMessage();

	const { t } = useTranslation("common");

	const tower_id = useSelect("", "select", null);



	const { isLoading: isLoadingTowerOptions, data: towerOptions = [] } = useApi(`/towers`);

	const { isLoading: isLoadingFlatOptions, mutate: mutateFlats, data: flatOptions = [] } = useApi(tower_id.value?.id ? `/flats?tower=${tower_id.value?.id}&for_monthly_settlement=true` : null);
	const { isLoading: isLoadingEstimatedExpensesOptions, data: estimatedExpenses = [] } = useApi(tower_id.value?.id ? `/estimated-expenses?tower=${tower_id.value?.id}&month=${month_d}` : null);


	const { data: monthlySettlement, isLoading, isValidating, mutate } = useApi(monthlySettlementId ? `/monthly-settlement?id=${monthlySettlementId}` : null);
	const { executeMutation, isMutating } = useApiMutation(`/monthly-settlement`);




	const flat_id = useSelect("", "select", null);
	const payed_amount = useInput("330", "number", true);
	const electricity = useInput("0", "number", true);
	const water = useInput("0", "number", true);
	const waste = useInput("0", "number", true);
	const guard = useInput("0", "number", true);
	const elevator = useInput("0", "number", true);
	const others = useInput("0", "number", true);
	const notes = useInput("", null);

	const net_expenses = useMemo(() => {
		return +electricity.value + +water.value + +waste.value + +guard.value + +elevator.value + +others.value
	}, [
		electricity.value,
		water.value,
		waste.value,
		guard.value,
		elevator.value,
		others.value,
	])

	const onSubmit = async (e) => {
		e.preventDefault();
		const newTower = {
			...(monthlySettlementId ? { id: monthlySettlementId } : {
				tower_id: tower_id.value?.id || null,
				flat_id: flat_id.value?.id || null,
			}),
			payed_amount: +payed_amount?.value || 0,
			electricity: +electricity?.value || 0,
			water: +water?.value || 0,
			waste: +waste?.value || 0,
			guard: +guard?.value || 0,
			elevator: +elevator?.value || 0,
			others: +others?.value || 0,
			net_estimated_expenses: net_expenses || 0,
			notes: notes?.value,
		}

		try {
			await executeMutation(monthlySettlementId ? 'PUT' : "POST", newTower);
			mutateFlats(`/flats?tower=${tower_id.value?.id}&for_monthly_settlement=true`)
			monthlySettlementId && mutate(`/monthly-settlement?id=${monthlySettlementId}`)
			router.back()
		} catch (error) {
			handleMessage(error);
		}
	};



	useEffect(() => {
		if (!isLoading && !!monthlySettlement) {
			tower_id.changeValue({ id: monthlySettlement.tower?.id, name: monthlySettlement.tower?.name });
			flat_id.changeValue({ id: monthlySettlement.flat?.id, name: monthlySettlement.flat?.name });
			payed_amount.changeValue(monthlySettlement?.payed_amount || 0);
			electricity.changeValue(monthlySettlement?.electricity || 0);
			water.changeValue(monthlySettlement?.water || 0);
			waste.changeValue(monthlySettlement?.waste || 0);
			guard.changeValue(monthlySettlement?.guard || 0);
			elevator.changeValue(monthlySettlement?.elevator || 0);
			others.changeValue(monthlySettlement?.others || 0);
			notes.changeValue(monthlySettlement?.notes);
		}
	}, [isLoading])

	// reset the flat when change the tower
	useEffect(() => {
		flat_id.reset();
		electricity.reset();
		water.reset();
		waste.reset();
		guard.reset();
		elevator.reset();
		others.reset();
	}, [tower_id.value?.id]);


	// calc the amount when choose the flat

	useEffect(() => {
		if (flat_id.value?.id && !isLoadingEstimatedExpensesOptions) {
			if (!estimatedExpenses.length) {
				handleMessage("you_have_to_make_the_estimated_expenses_key", "warning");
				return; // Exit early if there are no expenses
			}

			const {
				electricity: electricity_amount,
				water: water_amount,
				waste: waste_amount,
				guard: guard_amount,
				elevator: elevator_amount,
				others: others_amount,
				notes: notes_value
			} = estimatedExpenses[0];

			const flat = flat_id.value;

			const calculateDistributedAmount = (amount) => {
				if (!flatOptions?.length || !flat) return 0;
				return Number(((amount / flatOptions.length) * (flat.pay_percentage / 100)).toFixed(2));
			};

			electricity.changeValue(flat.electricity ? calculateDistributedAmount(electricity_amount) : 0);
			water.changeValue(flat.water ? calculateDistributedAmount(water_amount) : 0);
			waste.changeValue(flat.waste ? calculateDistributedAmount(waste_amount) : 0);
			guard.changeValue(flat.guard ? calculateDistributedAmount(guard_amount) : 0);
			elevator.changeValue(flat.elevator ? calculateDistributedAmount(elevator_amount) : 0);
			others.changeValue(flat.others ? calculateDistributedAmount(others_amount) : 0);

			// Update notes if there are additional expenses
			if (others_amount) {
				notes.changeValue(notes_value);
			}
		}
	}, [flat_id.value?.id, isLoadingEstimatedExpensesOptions]);




	return (
		<>
			<div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
				<Header
					title={t("estimated_expenses_key")}
					path="/actions/monthly-settlement"
					classes="bg-gray-100 dark:bg-gray-700 border-none"
					links={[{ label: monthlySettlementId ? t("edit_key") : t("add_key") }]}
				/>
				<div className="p-5 rounded-2xl bg-white dark:bg-gray-800">
					{isLoading ? <div className="flex justify-center items-center my-28">
						<Spinner className="h-10 w-10" />
					</div>
						: <form onSubmit={onSubmit}>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 min-h-80">
								<Select
									mandatory
									isDisabled={monthlySettlementId}
									label={t("tower_key")}
									options={towerOptions}
									getOptionValue={(option) => option?.id}
									getOptionLabel={(option) => option?.name}
									isLoading={isLoadingTowerOptions}
									{...tower_id.bind}
								/>
								<Select
									mandatory
									isDisabled={monthlySettlementId}
									label={t("flat_key")}
									options={flatOptions}
									getOptionValue={(option) => option?.id}
									getOptionLabel={(option) => `n: ${option?.number} / f: ${option?.floor}`}
									isLoading={isLoadingFlatOptions}
									{...flat_id.bind}
								/>

								<Input
									mandatory
									label={t("payed_amount_key")}
									{...payed_amount.bind}
								/>
								<Input
									disabled
									label={t("electricity_key")}
									{...electricity.bind}
								/>
								<Input
									disabled
									label={t("water_key")}
									{...water.bind}
								/>
								<Input
									disabled
									label={t("waste_key")}
									{...waste.bind}
								/>
								<Input
									disabled
									label={t("guard_key")}
									{...guard.bind}
								/>
								<Input
									disabled
									label={t("elevator_key")}
									{...elevator.bind}
								/>
								<Input
									disabled
									label={t("others_key")}
									{...others.bind}
								/>
								<Input
									placeholder={t("describe_key")}
									label={t("notes_key")}
									{...notes.bind}
								/>
								<Input
									disabled
									label={t("net_expenses_key")}
									value={formatComma(net_expenses)}
								/>
							</div>
							<div className="flex justify-start gap-8 items-center">
								<Button
									disabled={isMutating ||

										!tower_id.value?.id ||
										!flat_id.value?.id ||
										!payed_amount.value
									}
									className="btn--primary w-32 flex items-center justify-center"
									type="submit"
								>
									{isMutating ? (
										<>
											<Spinner className="mr-3 h-4 w-4 rtl:ml-3" /> {t("loading_key")}
										</>
									) : (
										t("save_key")
									)}
								</Button>
								<Button
									disabled={isMutating}
									className="btn--secondary w-32"
									onClick={() => router.back()}
								>
									{t("cancel_key")}
								</Button>
							</div>
						</form>}
				</div>
			</div>
		</>
	);
};



Index.getLayout = function PageLayout(page) {
	return (
		<Layout>
			<LayoutWithSidebar>{page}</LayoutWithSidebar>
		</Layout>
	);
};

Index.propTypes = {
	session: PropTypes.object.isRequired
};

export const getServerSideProps = async ({ req, locale, resolvedUrl }) => {
	const session = await getSession({ req });
	const userRole = session?.user?.role;

	if (!session || userRole == "flat") {
		const loginUrl = locale === "en" ? `/${locale}/login` : "/login";
		return {
			redirect: {
				destination: `${loginUrl}?returnTo=${encodeURIComponent(resolvedUrl || "/")}`,
				permanent: false
			}
		};
	} else {
		return {
			props: {
				session,
				...(await serverSideTranslations(locale, ["common"]))
			}
		};
	}
};


export default Index;