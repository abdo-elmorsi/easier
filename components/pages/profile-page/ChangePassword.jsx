import { useState } from "react";
import { useTranslation } from "next-i18next";
import { Button, Input, Spinner } from "components/UI";
import { useHandleMessage, useInput } from "hooks";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useApiMutation } from "hooks/useApi";

const ChangePassword = () => {
	const { t } = useTranslation("common");
	const handleMessage = useHandleMessage();

	const oldPassword = useInput("", "password_optional", false);
	const newPassword = useInput("", "password_optional", true);
	const confirmPassword = useInput("", "password_optional", true);


	const [showPass, setShowPass] = useState(false);
	const [showPassTwo, setShowPassTwo] = useState(false);
	const handleShowPass = () => setShowPass(!showPass);
	const handleShowPassTwo = () => setShowPassTwo(!showPassTwo);


	const { executeMutation, isMutating } = useApiMutation(`/authentication/update-password`);


	const onSubmit = async (e) => {
		e.preventDefault();
		if (newPassword.value != confirmPassword.value) {
			handleMessage("new_password_does_not_match_confirm_password_key", "warning");

			return;
		}
		const data = {
			oldPassword: oldPassword.value,
			newPassword: newPassword.value,
		}
		try {
			const res = await executeMutation('POST', data);
			handleMessage(res, "success");
			oldPassword.reset();
			newPassword.reset();
			confirmPassword.reset();

		} catch (error) {
			handleMessage(error);
		}
	};



	return (

		<form onSubmit={onSubmit} className="flex flex-col items-center justify-around gap-8 sm:m-5 lg:flex-row">
			<div className="w-full lg:w-2/5">
				<Input
					label={t("old_password_key")}
					type={showPass ? "text" : "password"}
					className={"w-full"}
					{...oldPassword.bind}
					append={showPass ? <EyeIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} /> : <EyeSlashIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} />}
				/>
				<Input
					label={t("new_password_key")}
					type={showPassTwo ? "text" : "password"}
					append={showPassTwo ? <EyeIcon onClick={handleShowPassTwo} className="cursor-pointer text-primary" width={"25"} /> : <EyeSlashIcon onClick={handleShowPassTwo} className="cursor-pointer text-primary" width={"25"} />}
					className={"w-full"}
					{...newPassword.bind}
				/>
				<Input
					label={t("confirm_new_password_key")}
					type={showPassTwo ? "text" : "password"}
					append={showPassTwo ? <EyeIcon onClick={handleShowPassTwo} className="cursor-pointer text-primary" width={"25"} /> : <EyeSlashIcon onClick={handleShowPassTwo} className="cursor-pointer text-primary" width={"25"} />}
					className={"w-full"}
					{...confirmPassword.bind}
				/>
				<Button
					disabled={isMutating || !oldPassword.value || !newPassword.value || !confirmPassword.value}
					className="btn--primary mx-auto mt-6 flex w-full items-center justify-center"
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
			</div>
		</form>

	);
};

export default ChangePassword;