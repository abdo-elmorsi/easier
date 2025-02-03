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
	const openingBalanceId = router.query.id;
	const handleMessage = useHandleMessage();

	const { t } = useTranslation("common");


	const { data: openingBalance, isLoading, isValidating, mutate } = useApi(openingBalanceId ? `/opening-balance?id=${openingBalanceId}` : null);
	const { executeMutation, isMutating } = useApiMutation(`/opening-balance`);


	const balance = useInput("", 'number', true);
	const notes = useInput("", null);


	const onSubmit = async (e) => {
		e.preventDefault();
		const newOpeningBalance = {
			...(openingBalanceId ? { id: openingBalanceId } : {}),
			balance: +balance.value || 0,
			notes: notes.value || null,

		}

		try {
			await executeMutation(openingBalanceId ? 'PUT' : "POST", newOpeningBalance);
			openingBalanceId && mutate(`/opening-balance?id=${openingBalanceId}`)
			router.back()
		} catch (error) {
			handleMessage(error);
		}
	};



	useEffect(() => {
		if (!isLoading && !!openingBalance) {
			balance.changeValue(openingBalance.balance || "");
			notes.changeValue(openingBalance.notes || "");
		}
	}, [isLoading])



	return (
		<>
			<div className="">
				<Header
					title={t("opening_balance_key")}
					path="/opening-balance"
					classes="bg-gray-100 dark:bg-gray-700 border-none"
					links={[{
						label: openingBalanceId ? t("edit_key") : t("add_key"),
						path: `add-update${openingBalanceId ? `?id=${openingBalanceId}` : ""}`
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
									label={t("balance_key")}
									{...balance.bind}
								/>
								<Input
									label={t("notes_key")}
									{...notes.bind}
								/>

							</div>
							<div className="flex justify-start gap-8 items-center">
								<Button
									disabled={isMutating || !balance.value}
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