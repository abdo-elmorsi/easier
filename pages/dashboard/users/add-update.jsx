import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import PropTypes from "prop-types";
import { useRouter } from "next/router";

// Custom
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";
import { Button, Input, Spinner } from "components/UI";
import { useHandleMessage, useInput } from "hooks";
import { useApi, useApiMutation } from "hooks/useApi";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { convertImageToBase64 } from "utils/utils";

const Index = () => {
	const router = useRouter();
	const userId = router.query.id;
	const handleMessage = useHandleMessage();

	const { t } = useTranslation("common");

	const {
		data: user,
		isLoading,
		isValidating,
		mutate,
	} = useApi(userId ? `/users?id=${userId}` : null);
	const { executeMutation, isMutating } = useApiMutation(`/users`);

	const user_name = useInput("", null);
	const email = useInput("", "email", true);
	const password = useInput("", "password_optional", true);
	const phone = useInput("", null);
	const [image, setImage] = useState("");

	const [showPass, setShowPass] = useState(false);
	const handleShowPass = () => setShowPass(!showPass);

	const updateImage = async (e) => {
		const file = e.target?.files[0];
		if (file) {
			try {
				const base64String = await convertImageToBase64(file);
				setImage(base64String);
			} catch (error) {
				setImage("");
			}
		}
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		const newUser = {
			...(userId ? { id: userId } : {
				email: email.value || null,
			}),
			user_name: user_name.value || null,
			password: password.value || null,
			phone: phone.value || null,
			img: image || null,
		};

		try {
			await executeMutation(userId ? "PUT" : "POST", newUser);
			userId && mutate(`/users?id=${userId}`);
			router.back();
		} catch (error) {
			handleMessage(error);
		}
	};

	useEffect(() => {
		if (!isLoading && !!user) {
			user_name.changeValue(user.user_name || "");
			phone.changeValue(user.phone || "");
			email.changeValue(user.email || "");
		}
	}, [isLoading]);

	return (
		<>
			<div className="">
				<Header
					title={t("users_key")}
					path="/dashboard/users"
					classes="bg-gray-100 dark:bg-gray-700 border-none"
					links={[
						{
							label: userId ? t("edit_key") : t("add_key"),
							path: `add-update${userId ? `?id=${userId}` : ""}`,
						},
					]}
				/>
				<div className="p-5 rounded-2xl bg-white dark:bg-gray-800">
					{isLoading ? (
						<div className="flex justify-center items-center my-28">
							<Spinner className="h-10 w-10" />
						</div>
					) : (
						<form onSubmit={onSubmit}>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 min-h-80">
								<Input
									mandatory
									label={t("name_key")}
									{...user_name.bind}
								/>
								<Input
									disabled={userId}
									mandatory
									label={t("email_key")}
									{...email.bind}
								/>
								<Input label={t("phone_key")} {...phone.bind} />
								<Input
									mandatory={!userId}
									label={t("password_key")}
									type={showPass ? "text" : "password"}
									{...password.bind}
									append={
										showPass ? (
											<EyeIcon
												onClick={handleShowPass}
												className="cursor-pointer text-primary"
												width={"25"}
											/>
										) : (
											<EyeSlashIcon
												onClick={handleShowPass}
												className="cursor-pointer text-primary"
												width={"25"}
											/>
										)
									}
								/>

								<Input
									type="file"
									multiple={false}
									accept="image/*"
									placeholder={t("upload_image_key")}
									label={t("image_key")}
									onChange={updateImage}
								/>
							</div>
							<div className="flex justify-start gap-8 items-center">
								<Button
									disabled={
										isMutating ||
										!user_name.value ||
										!email.value ||
										(!userId && password.value?.length < 6)
									}
									className="btn--primary w-32 flex items-center justify-center"
									type="submit"
								>
									{isMutating ? (
										<>
											<Spinner className="mr-3 h-4 w-4 rtl:ml-3" />{" "}
											{t("loading_key")}
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

export const getServerSideProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale, ["common"])),
		},
	};
};

export default Index;
