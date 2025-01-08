import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";

// Custom
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";
import { Button, Spinner, Tabs } from "components/UI";
import { useHandleMessage, useInput, useSelect } from "hooks";
import { useApi, useApiMutation } from "hooks/useApi";
import { CurrencyDollarIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Counts, MainInfo, Prices } from "components/pages/products";

const Index = ({ session }) => {
	const router = useRouter();
	const productId = router.query.id;
	const handleMessage = useHandleMessage();


	const { t } = useTranslation("common");


	const { data: product, isLoading, isValidating, mutate } = useApi(productId ? `/products?id=${productId}` : null, {
		revalidateOnFocus: false
	});
	const { executeMutation, isMutating } = useApiMutation(`/products`);

	const name = useInput("", null);
	const description = useInput("", null);

	const category = useSelect("", 'select', null);
	const unit = useSelect("", 'select', null);

	const price = useInput(0, 'number', true);
	const wholesalePrice = useInput(0, 'number', true);
	const piecesNo = useInput(0, 'number', true);
	const quantityInStore = useInput(0, 'number', true);
	const quantityInMarket = useInput(0, 'number', true);



	const onSubmit = async (e) => {
		e.preventDefault();
		const newProduct = {
			...(productId ? {
				id: productId,
				lastUpdatedBy: session.user?.id
			} : {
				createdBy: session.user?.id, // Assuming you have user ID in session
			}),
			name: name.value || null,
			description: description.value || null,
			category: category.value?.id || null,
			unit: unit.value?.id || null,

			price: parseFloat(price.value) || 0,
			wholesalePrice: parseFloat(wholesalePrice.value) || 0,
			piecesNo: parseFloat(piecesNo.value) || 0,
			quantityInStock: (+quantityInStore.value + +quantityInMarket.value) || 0,
			quantityInStore: +quantityInStore.value || 0,
			quantityInMarket: +quantityInMarket.value || 0,
		};

		try {
			await executeMutation(productId ? 'PUT' : "POST", newProduct);
			mutate(`/products?id=${productId}`)
			router.back();
		} catch (error) {
			handleMessage(error);
		}
	};

	useEffect(() => {
		if (!isValidating && !!product) {
			name.changeValue(product.name || "");
			description.changeValue(product.description || "");
			category.changeValue({ id: product.category?.id, name: product.category?.name });
			unit.changeValue({ id: product.unit?.id, name: product.unit?.name });

			price.changeValue(product.price || 0);
			wholesalePrice.changeValue(product.wholesalePrice || 0);
			piecesNo.changeValue(product.piecesNo || 0);
			quantityInStore.changeValue(product.quantityInStore || 0);
			quantityInMarket.changeValue(product.quantityInMarket || 0);

		}
	}, [isValidating]);


	const tabsData = [
		{
			label: t("main_info_key"),
			icon: <InformationCircleIcon className="h-5 w-5" />,
			content: <MainInfo name={name} description={description} category={category} unit={unit} />,
		},
		{
			label: t("prices_key"),
			icon: <CurrencyDollarIcon className="h-5 w-5" />,
			content: <Prices price={price} wholesalePrice={wholesalePrice} piecesNo={piecesNo} />,
		},
		{
			label: t("counts_key"),
			icon: <InformationCircleIcon className="h-5 w-5" />,
			content: <Counts productId={productId} quantityInStore={quantityInStore} quantityInMarket={quantityInMarket} />,
		},

	];

	return (
		<>
			<div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
				<Header
					title={t("products_key")}
					path="/products"
					classes="bg-gray-100 dark:bg-gray-700 border-none"
					links={[{ label: productId ? t("edit_key") : t("add_key") }]}
				/>
				<div className="p-5 rounded-2xl bg-white dark:bg-gray-800">
					{isLoading ? (
						<div className="flex justify-center items-center my-28">
							<Spinner className="h-10 w-10" />
						</div>
					) : (
						<form onSubmit={onSubmit}>
							<Tabs tabsData={tabsData} />

							<div className="flex justify-start gap-8 items-center mt-4">
								<Button
									disabled={
										isMutating ||
										!name.value ||
										!+price.value ||
										!category.value?.id ||
										!unit.value?.id ||
										!+wholesalePrice.value ||
										!+piecesNo.value
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
						</form>
					)}
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
	session: PropTypes.object.isRequired,
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
