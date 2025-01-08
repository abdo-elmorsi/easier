import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/react";
import PropTypes from "prop-types"
import { useRouter } from "next/router";

// Custom
import { Layout, LayoutWithSidebar } from "components/layout";
import { Button, DatePicker, Input, Select, Spinner } from "components/UI";
import { Header } from "components/global";
import { useHandleMessage, useInput, useSelect } from "hooks";
import { useApi, useApiMutation } from "hooks/useApi";
import { formatComma } from "utils/utils";
import moment from "moment-timezone";


const Index = ({ session }) => {
	const router = useRouter();
	const { t } = useTranslation("common");
	const handleMessage = useHandleMessage();

	const transactionId = router.query.id;

	const productId = useSelect("", "select", null);
	const productID = productId.value?.id || null;
	const quantity = useInput("", "number", true);
	const description = useInput("", null);
	const selectedDate = useInput(new Date(), null);


	const { data: transaction, isLoading, isValidating, mutate } = useApi(transactionId ? `/transactions?id=${transactionId}` : null);
	const { executeMutation, isMutating } = useApiMutation(`/transactions`);

	const { isLoading: isLoadingProductOptions, data: productOptions = [] } = useApi(`/products?forSelect=true`);

	// Fetch available quantity for purchase return
	const { isLoading: loadingAvailableQty, data: productDetails = [] } = useApi(productID ? `/products?product=${productID}` : null);
	const availableQty = productDetails[0]?.quantityInStore + (transaction?.quantity || 0) || 0;


	const onSubmit = async (e) => {
		e.preventDefault();
		const newTransaction = {
			...(transactionId ? {
				id: transactionId,
				lastUpdatedById: session.user?.id
			} : {
				productId: productID || null,
				type: "storeOut",
				createdById: session.user?.id,
			}),
			customDate: moment(selectedDate.value).endOf("day").subtract(2, 'hours').toDate(),
			quantity: +quantity.value || 0,
			description: description.value || null,
		}

		try {
			await executeMutation(transactionId ? 'PUT' : "POST", newTransaction);
			mutate(`/transactions?id=${transactionId}`)
			router.back();
		} catch (error) {
			handleMessage(error);
		}
	};


	useEffect(() => {
		if (!isValidating && !!transaction) {
			quantity.changeValue(transaction.quantity || "");
			description.changeValue(transaction.description || "");
			selectedDate.changeValue(new Date(transaction.createdAt) || "");
			productId.changeValue({ id: transaction.product?.id, name: transaction.product?.name });
		}
	}, [isValidating])



	return (
		<>
			<div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
				<Header
					title={t("purchase_return_key")}
					path="/store/purchase-return"
					classes="bg-gray-100 dark:bg-gray-700 border-none"
					links={[{ label: transactionId ? t("edit_key") : t("add_key") }]}
				/>
				<div className="p-5 rounded-2xl bg-white dark:bg-gray-800">
					{isLoading ? <div className="flex justify-center items-center my-28">
						<Spinner className="h-10 w-10" />
					</div>
						: <form onSubmit={onSubmit}>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 min-h-80">

								<Select
									mandatory
									isDisabled={transactionId}
									label={`${t("product_key")}  ${(loadingAvailableQty) ? t("loading_key") : formatComma(availableQty)}`}
									options={productOptions}
									getOptionValue={(option) => option?.id}
									getOptionLabel={(option) => option?.name}
									isLoading={isLoadingProductOptions}
									{...productId.bind}
								/>

								<Input
									mandatory
									label={t("quantity_key")}
									{...quantity.bind}
									validator={{
										valid: !isNaN(quantity.value) && +quantity.value >= 0 && +quantity.value <= availableQty,
										message: t('value_is_invalid_key'),
									}}
								/>
								<Input
									label={t("description_key")}
									{...description.bind}
								/>
								<DatePicker
									label={t("date_key")}
									value={selectedDate.value}
									onChange={(date) => selectedDate.changeValue(date || new Date())}
									maxDate={new Date()}
								/>
							</div>
							<div className="flex justify-start gap-8 items-center">
								<Button
									disabled={isMutating || !productID || !+quantity.value || +quantity.value > availableQty || loadingAvailableQty}
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
