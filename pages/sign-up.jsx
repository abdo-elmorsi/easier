import { useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

// Custom
import { useHandleMessage, useInput, useSavedState } from "hooks";
import { Spinner, Button, Input } from "components/UI";
import { MainLogo } from "components/icons";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Cookies from "js-cookie";
import { useApiMutation } from "hooks/useApi";
import { getSession } from "next-auth/react";

const SignUp = () => {
	const { t } = useTranslation("common");
	const router = useRouter();
	const handleMessage = useHandleMessage();

	const user_name = useInput("", null);
	const password = useInput("", null);

	const [showPass, setShowPass] = useState(false);
	const handleShowPass = () => setShowPass(!showPass);

	const { executeMutation, isMutating } = useApiMutation("/authentication/register");

	const onSubmit = async (e) => {
		e.preventDefault();

		const submitData = {
			user_name: user_name.value,
			role: "admin",
			password: password.value,
		};

		try {
			const user = await executeMutation("POST", submitData);
			handleMessage(user.message, "success");

			Cookies.set('user-token', user.token, { expires: 1, secure: true });
			router.push(router.query.returnTo || '/');
		} catch (error) {
			handleMessage(error);
		}
	};

	return (
		<div className="flex items-center justify-center h-screen dark:bg-dark dark:bg-gray-800">
			<div className="hidden bg-center bg-cover login md:block md:w-1/2">
				<div className="flex flex-col items-center justify-center h-screen">
					<MainLogo className="text-white w-52" />
				</div>
			</div>
			<div className="w-full px-4 md:w-1/2 md:px-12 xl:px-48">
				<h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
					{t("sign_up_now_key")}
				</h1>
				<p className="mb-2 text-sm text-gray-500 dark:text-white">
					{t("enter_your_details_to_sign_up_key")}
				</p>

				<form onSubmit={onSubmit} className="flex flex-col">
					<div className="mb-4">
						<Input
							label={t("name_key")}
							{...user_name.bind}
							name="name"
						/>
					</div>
					<div className="mb-4">
						<Input
							label={t("password_key")}
							name="password"
							type={showPass ? "text" : "password"}
							append={showPass ? <EyeIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} /> : <EyeSlashIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} />}
							{...password.bind}
						/>
					</div>

					<Button
						disabled={isMutating || !user_name.value || !password.value}
						className="w-full mt-6 btn--primary"
						type="submit"
					>
						{isMutating ? (
							<>
								<Spinner className="w-4 h-4 mr-3 rtl:ml-3" />
								{t("loading_key")}
							</>
						) : (
							t("sign_up_now_key")
						)}
					</Button>
				</form>
			</div>
		</div>
	);
};

export default SignUp;

SignUp.getLayout = function PageLayout(page) {
	return <>{page}</>;
};

export const getServerSideProps = async ({ req, locale }) => {
	const session = await getSession({ req: req });
	const routeUrl = locale === 'ar' ? '/' : `/${locale}/`;
	if (session) {
		return {
			redirect: {
				destination: `${routeUrl}`,
				permanent: false,
			},
		};
	} else {
		return {
			props: {
				session,
				...(await serverSideTranslations(locale, ['common'])),
			},
		};
	}
};
