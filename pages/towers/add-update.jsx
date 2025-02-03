import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

// Custom
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";
import { Button, Input, Spinner } from "components/UI";
import { useHandleMessage, useInput } from "hooks";
import { useApi, useApiMutation } from "hooks/useApi";


const Index = () => {
	const router = useRouter();
	const towerId = router.query.id;
	const handleMessage = useHandleMessage();

	const { t } = useTranslation("common");

	const { data: tower, isLoading, isValidating, mutate } = useApi(towerId ? `/towers?id=${towerId}` : null);
	const { executeMutation, isMutating } = useApiMutation(`/towers`);




	const name = useInput("", null);
	const address = useInput("", null);
	const num_of_floors = useInput("", "number", true);

	const onSubmit = async (e) => {
		e.preventDefault();
		const newTower = {
			...(towerId ? { id: towerId } : {}),
			name: name.value || null,
			address: address.value || null,
			num_of_floors: +num_of_floors.value || null,

		}

		try {
			await executeMutation(towerId ? 'PUT' : "POST", newTower);
			towerId && mutate(`/towers?id=${towerId}`)
			router.back()
		} catch (error) {
			handleMessage(error);
		}
	};



	useEffect(() => {
		if (!isLoading && !!tower) {
			name.changeValue(tower.name || "");
			address.changeValue(tower.address || "");
			num_of_floors.changeValue(tower.num_of_floors || "");
		}
	}, [isLoading])



	return (
		<>
			<div className="">
				<Header
					title={t("towers_key")}
					path="/towers"
					classes="bg-gray-100 dark:bg-gray-700 border-none"
					links={[{
						label: towerId ? t("edit_key") : t("add_key"),
						path: `add-update${towerId ? `?id=${towerId}` : ""}`
					}]}
				/>
				<div className="p-5 rounded-2xl bg-white dark:bg-gray-800">
					{isLoading ? <div className="flex justify-center items-center my-28">
						<Spinner className="h-10 w-10" />
					</div>
						: <form onSubmit={onSubmit}>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 min-h-80">
								<Input
									mandatory
									label={t("name_key")}
									{...name.bind}
								/>
								<Input
									mandatory
									label={t("address_key")}
									{...address.bind}
								/>
								<Input
									mandatory
									label={t("num_of_floors_key")}
									{...num_of_floors.bind}
								/>
							</div>
							<div className="flex justify-start gap-8 items-center">
								<Button
									disabled={isMutating || !name.value || !address.value || !+num_of_floors.value}
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