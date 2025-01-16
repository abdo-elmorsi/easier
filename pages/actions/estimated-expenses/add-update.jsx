import { useEffect } from "react";
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

const Index = () => {
	const router = useRouter();
	const estimatedExpensesId = router.query.id;
	const handleMessage = useHandleMessage();

	const { t } = useTranslation("common");

	const { isLoading: isLoadingTowerOptions, data: towerOptions = [] } = useApi(`/towers`);


	const { data: flat, isLoading, isValidating, mutate } = useApi(estimatedExpensesId ? `/estimated-expenses?id=${estimatedExpensesId}` : null);
	const { executeMutation, isMutating } = useApiMutation(`/estimated-expenses`);



	const towerId = useSelect("", "select", null);

	const electricity = useInput("0", "number", true);
	const water = useInput("0", "number", true);
	const waste = useInput("0", "number", true);
	const guard = useInput("0", "number", true);
	const elevator = useInput("0", "number", true);
	const others = useInput("0", "number", true);
	const notes = useInput("", null);


	const onSubmit = async (e) => {
		e.preventDefault();
		const newTower = {
			...(estimatedExpensesId ? { id: estimatedExpensesId } : {
				towerId: towerId.value?.id || null,
			}),
			electricity: +electricity?.value || 0,
			water: +water?.value || 0,
			waste: +waste?.value || 0,
			guard: +guard?.value || 0,
			elevator: +elevator?.value || 0,
			others: +others?.value || 0,
			notes: notes?.value,
		}

		try {
			await executeMutation(estimatedExpensesId ? 'PUT' : "POST", newTower);
			estimatedExpensesId && mutate(`/estimated-expenses?id=${estimatedExpensesId}`)
			router.back()
		} catch (error) {
			handleMessage(error);
		}
	};



	useEffect(() => {
		if (!isLoading && !!flat) {
			towerId.changeValue({ id: flat.tower?.id, name: flat.tower?.name });
			electricity.changeValue(flat?.electricity || 0);
			water.changeValue(flat?.water || 0);
			waste.changeValue(flat?.waste || 0);
			guard.changeValue(flat?.guard || 0);
			elevator.changeValue(flat?.elevator || 0);
			others.changeValue(flat?.others || 0);
			notes.changeValue(flat?.notes);
		}
	}, [isLoading])



	return (
		<>
			<div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
				<Header
					title={t("estimated_expenses_key")}
					path="/estimated-expenses"
					classes="bg-gray-100 dark:bg-gray-700 border-none"
					links={[{ label: estimatedExpensesId ? t("edit_key") : t("add_key") }]}
				/>
				<div className="p-5 rounded-2xl bg-white dark:bg-gray-800">
					{isLoading ? <div className="flex justify-center items-center my-28">
						<Spinner className="h-10 w-10" />
					</div>
						: <form onSubmit={onSubmit}>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 min-h-80">
								<Select
									mandatory
									isDisabled={estimatedExpensesId}
									label={t("tower_key")}
									options={towerOptions}
									getOptionValue={(option) => option?.id}
									getOptionLabel={(option) => option?.name}
									isLoading={isLoadingTowerOptions}
									{...towerId.bind}
								/>

								<Input
									mandatory
									label={t("electricity_key")}
									{...electricity.bind}
								/>
								<Input
									mandatory
									label={t("water_key")}
									{...water.bind}
								/>
								<Input
									mandatory
									label={t("waste_key")}
									{...waste.bind}
								/>
								<Input
									mandatory
									label={t("guard_key")}
									{...guard.bind}
								/>
								<Input
									mandatory
									label={t("elevator_key")}
									{...elevator.bind}
								/>
								<Input
									mandatory
									label={t("others_key")}
									{...others.bind}
								/>
								<Input
									placeholder={t("describe_key")}
									label={t("notes_key")}
									{...notes.bind}
								/>
							</div>
							<div className="flex justify-start gap-8 items-center">
								<Button
									disabled={isMutating ||

										!towerId.value?.id ||
										!electricity.value ||
										!water.value ||
										!waste.value ||
										!guard.value ||
										!elevator.value ||
										!others.value
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