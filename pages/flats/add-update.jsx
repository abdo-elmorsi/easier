import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/react";
import PropTypes from "prop-types"
import { useRouter } from "next/router";

// Custom
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";
import { Button, Checkbox, Input, Select, Spinner } from "components/UI";
import { useCheckbox, useHandleMessage, useInput, useSelect } from "hooks";
import { useApi, useApiMutation } from "hooks/useApi";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { payPercentageOptions } from "assets";


const Index = () => {
	const router = useRouter();
	const flatId = router.query.id;
	const handleMessage = useHandleMessage();

	const { t } = useTranslation("common");

	const { isLoading: isLoadingTowerOptions, data: towerOptions = [] } = useApi(`/towers`);


	const { data: flat, isLoading, isValidating, mutate } = useApi(flatId ? `/flats?id=${flatId}` : null);
	const { executeMutation, isMutating } = useApiMutation(`/flats`);



	const towerId = useSelect("", "select", null);

	const number = useInput("", null);
	const floor = useInput("", null);
	const pay_percentage = useSelect(payPercentageOptions[0], "select", null);

	const electricity = useCheckbox(true, false);
	const water = useCheckbox(true, false);
	const waste = useCheckbox(true, false);
	const guard = useCheckbox(true, false);
	const elevator = useCheckbox(true, false);

	const password = useInput("", "password_optional", true);

	const [showPass, setShowPass] = useState(false);
	const handleShowPass = () => setShowPass(!showPass);

	const onSubmit = async (e) => {
		e.preventDefault();
		const newTower = {
			...(flatId ? { id: flatId } : {
				towerId: towerId.value?.id || null,
			}),
			number: number.value || null,
			floor: +floor.value || null,
			password: password.value || null,
			pay_percentage: pay_percentage.value?.value || 0,
			electricity: electricity?.checked || false,
			water: water?.checked || false,
			waste: waste?.checked || false,
			guard: guard?.checked || false,
			elevator: elevator?.checked || false,
		}

		try {
			await executeMutation(flatId ? 'PUT' : "POST", newTower);
			mutate(`/flats?id=${flatId}`)
			router.back()
		} catch (error) {
			handleMessage(error);
		}
	};



	useEffect(() => {
		if (!isValidating && !!flat) {
			number.changeValue(flat.number || "");
			floor.changeValue(flat.floor || "");
			towerId.changeValue({ id: flat.tower?.id, name: flat.tower?.name });
			floor.changeValue(flat.floor || "");
			pay_percentage.changeValue(payPercentageOptions.find(item => item.value == flat.pay_percentage));
			electricity.changeValue(flat?.electricity || false);
			water.changeValue(flat?.water || false);
			waste.changeValue(flat?.waste || false);
			guard.changeValue(flat?.guard || false);
			elevator.changeValue(flat?.elevator || false);
		}
	}, [isValidating])



	return (
		<>
			<div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
				<Header
					title={t("flats_key")}
					path="/flats"
					classes="bg-gray-100 dark:bg-gray-700 border-none"
					links={[{ label: flatId ? t("edit_key") : t("add_key") }]}
				/>
				<div className="p-5 rounded-2xl bg-white dark:bg-gray-800">
					{isLoading ? <div className="flex justify-center items-center my-28">
						<Spinner className="h-10 w-10" />
					</div>
						: <form onSubmit={onSubmit}>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 min-h-80">
								<Select
									mandatory
									isDisabled={flatId}
									label={t("tower_key")}
									options={towerOptions}
									getOptionValue={(option) => option?.id}
									getOptionLabel={(option) => option?.name}
									isLoading={isLoadingTowerOptions}
									{...towerId.bind}
								/>

								<Input
									mandatory
									label={t("number_key")}
									{...number.bind}
								/>
								<Input
									mandatory
									label={t("floor_key")}
									{...floor.bind}
								/>
								<Input
									mandatory={!flatId}
									label={t("password_key")}
									type={showPass ? "text" : "password"}

									{...password.bind}
									append={showPass ? <EyeIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} /> : <EyeSlashIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} />}
								/>
								<Select
									mandatory
									label={t("pay_percentage_key")}
									options={payPercentageOptions}
									isClearable={false}
									{...pay_percentage.bind}
								/>
								<div className="flex flex-wrap gap-4">
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
								</div>
							</div>
							<div className="flex justify-start gap-8 items-center">
								<Button
									disabled={isMutating || !number.value || !+floor.value || (!flatId && password.value?.length < 6)}
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
	const session = await getSession({ req: req });
	if (!session) {
		const loginUrl = locale === "en" ? `/${locale}/login` : "/login";
		return {
			redirect: {
				destination: `${loginUrl}?returnTo=${encodeURIComponent(resolvedUrl || "/")}`,
				permanent: false,
			},
		};
	} else {
		return {
			props: {
				session,
				...(await serverSideTranslations(locale, ["common"])),
			},
		};
	}
};

export default Index;