import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/react";
import PropTypes from "prop-types"
import { useRouter } from "next/router";

// Custom
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";
import { Button, Input, Spinner } from "components/UI";
import { useHandleMessage, useInput } from "hooks";
import { useApi, useApiMutation } from "hooks/useApi";


const Index = () => {
	const router = useRouter();
	const categorieId = router.query.id;
	const handleMessage = useHandleMessage();

	const { t } = useTranslation("common");

	const { data: categorie, isLoading, isValidating, mutate } = useApi(categorieId ? `/categories?id=${categorieId}` : null);
	const { executeMutation, isMutating } = useApiMutation(`/categories`);




	const name = useInput("", null);

	const onSubmit = async (e) => {
		e.preventDefault();
		const newCategorie = {
			...(categorieId ? { id: categorieId } : {}),
			name: name.value || null,
		}

		try {
			await executeMutation(categorieId ? 'PUT' : "POST", newCategorie);
			mutate(`/categories?id=${categorieId}`)
			router.back()
		} catch (error) {
			handleMessage(error);
		}
	};



	useEffect(() => {
		if (!isValidating && !!categorie) {
			name.changeValue(categorie.name || "");
		}
	}, [isValidating])



	return (
		<>
			<div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
				<Header
					title={t("categories_key")}
					path="/products/categories"
					classes="bg-gray-100 dark:bg-gray-700 border-none"
					links={[{ label: categorieId ? t("edit_key") : t("add_key") }]}
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
							</div>
							<div className="flex justify-start gap-8 items-center">
								<Button
									disabled={isMutating || !name.value}
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