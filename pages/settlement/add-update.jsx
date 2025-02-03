import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

// Custom
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";
import { Button, Checkbox, Input, Select, Spinner } from "components/UI";
import { useCheckbox, useHandleMessage, useInput, useSelect } from "hooks";
import { useApi, useApiMutation } from "hooks/useApi";
import { payPercentageOptions } from "assets";

const Index = () => {
	const router = useRouter();
	const settlementId = router.query.id;
	const handleMessage = useHandleMessage();

	const { t } = useTranslation("common");


	const { isLoading: isLoadingFlatOptions, isValidating: isValidatingFlatOptions, mutate: mutateFlats, data: flatOptions = [] } = useApi(!settlementId ? `/flats?for_settlement=true` : null);


	const { data: settlement, isLoading, isValidating, mutate } = useApi(settlementId ? `/settlement?id=${settlementId}` : null);
	const { executeMutation, isMutating } = useApiMutation(`/settlement`);




	const flat_id = useSelect("", "select", null);
	const payed_amount = useInput("330", "number", true);
	const notes = useInput("", null);

	const pay_percentage = useSelect("", "select", null);

	const electricity = useCheckbox(false, false);
	const water = useCheckbox(false, false);
	const waste = useCheckbox(false, false);
	const guard = useCheckbox(false, false);
	const elevator = useCheckbox(false, false);
	const others = useCheckbox(false, false);



	const onSubmit = async (e) => {
		e.preventDefault();
		const newSettlement = {
			...(settlementId ? { id: settlementId } : {
				flat_id: flat_id.value?.id || null,
			}),
			payed_amount: +payed_amount?.value || 0,
			notes: notes?.value,


			pay_percentage: pay_percentage?.value?.value,
			electricity: electricity?.checked,
			water: water?.checked,
			waste: waste?.checked,
			guard: guard?.checked,
			elevator: elevator?.checked,
			others: others?.checked,
		}

		try {
			await executeMutation(settlementId ? 'PUT' : "POST", newSettlement);
			settlementId && mutate(`/settlement?id=${settlementId}`)
			mutateFlats(`/flats?for_settlement=true`)
			router.back()
		} catch (error) {
			handleMessage(error);
		}
	};



	useEffect(() => {
		if (!isLoading && !!settlement) {
			flat_id.changeValue({ id: settlement.flat?.id, number: settlement.flat?.number, floor: settlement.flat?.floor });
			notes.changeValue(settlement?.notes);

			pay_percentage.changeValue(payPercentageOptions.find(c => c.value == settlement.pay_percentage));
			payed_amount.changeValue(settlement?.payed_amount);
			electricity.changeValue(settlement?.electricity);
			water.changeValue(settlement?.water);
			waste.changeValue(settlement?.waste);
			guard.changeValue(settlement?.guard);
			elevator.changeValue(settlement?.elevator);
			others.changeValue(settlement?.others);
		}
	}, [isLoading, settlement])



	// calc the amount when choose the flat

	useEffect(() => {
		if (flat_id.value?.id && !settlementId) {

			const flat = flat_id.value;

			electricity.changeValue(flat.electricity);
			water.changeValue(flat.water);
			waste.changeValue(flat.waste);
			guard.changeValue(flat.guard);
			elevator.changeValue(flat.elevator);
			others.changeValue(flat.others);
			pay_percentage.changeValue(payPercentageOptions.find(c => c.value == flat.pay_percentage));
		}
	}, [flat_id.value?.id]);





	return (
		<>
			<div className="">
				<Header
					title={t("settlement_key")}
					path="/settlement"
					classes="bg-gray-100 dark:bg-gray-700 border-none"
					links={[{
						label: settlementId ? t("edit_key") : t("add_key"),
						path: `add-update${settlementId ? `?id=${settlementId}` : ""}`
					}]}
				/>
				<div className="p-5 rounded-2xl bg-white dark:bg-gray-800">
					{isLoading ? <div className="flex justify-center items-center my-28">
						<Spinner className="h-10 w-10" />
					</div>
						: <form onSubmit={onSubmit}>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 min-h-80">
								<Select
									mandatory
									isDisabled={settlementId || isLoadingFlatOptions || isValidatingFlatOptions}
									label={t("flat_key")}
									options={flatOptions}
									getOptionValue={(option) => option?.id}
									getOptionLabel={(option) => `n: ${option?.number} / f: ${option?.floor}`}
									isLoading={isLoadingFlatOptions || isValidatingFlatOptions}
									{...flat_id.bind}
								/>

								<Input
									mandatory
									label={t("payed_amount_key")}
									{...payed_amount.bind}
								/>
								<Input
									placeholder={t("notes_key")}
									label={t("notes_key")}
									{...notes.bind}
								/>


								<Select
									mandatory
									label={t("pay_percentage_key")}
									options={payPercentageOptions}
									{...pay_percentage.bind}
								/>
								<div className="grid grid-cols-2">
									<Checkbox
										label={t("electricity_key")}
										{...electricity.bind}
									/>
									<Checkbox
										label={t("water_key")}
										{...water.bind}
									/>
									<Checkbox
										label={t("waste_key")}
										{...waste.bind}
									/>
									<Checkbox
										label={t("guard_key")}
										{...guard.bind}
									/>
									<Checkbox
										label={t("elevator_key")}
										{...elevator.bind}
									/>
									<Checkbox
										label={t("others_key")}
										{...others.bind}
									/>
								</div>
							</div>
							<div className="flex justify-start gap-8 items-center">
								<Button
									disabled={
										isMutating ||
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
export const getServerSideProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale, ["common"])),
		},
	};
};

export default Index;