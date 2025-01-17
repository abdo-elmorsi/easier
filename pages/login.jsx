import { useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

// Custom
import { useCheckbox, useHandleMessage, useInput } from "hooks";
import { Spinner, Button, Input, Checkbox } from "components/UI";
import { MainLogo } from "components/icons";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useApiMutation } from "hooks/useApi";



const Login = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const handleMessage = useHandleMessage();

  const user_name = useInput("", null);
  const password = useInput("", null);

  const [showPass, setShowPass] = useState(false);
  const handleShowPass = () => setShowPass(!showPass);


  const asFlat = useCheckbox(false, false);

  const number = useInput("", null);
  const floor = useInput("", 'number', true);


  const { executeMutation, isMutating } = useApiMutation("/authentication/login");

  const onSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      password: password.value,
      asFlat: asFlat.checked,
      ...(asFlat.checked ? {
        number: number.value,
        floor: +floor.value,
      } : {
        user_name: user_name.value,
      })
    };
    try {
      const user = await executeMutation("POST", submitData);
      handleMessage(user.message, "success");

      const result = await signIn("credentials", {
        redirect: false,
        // callbackUrl: "/",
        user: JSON.stringify({ ...user.user }),
      });
      // Check if signIn was successful
      if (result.error) {
        throw new Error(result.error); // Handle sign-in error
      }
      router.replace(router.query['call-back-url'] || '/');
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
          {t("sign_in_now_key")}
        </h1>
        <p className="mb-2 text-sm text-gray-500 dark:text-white">
          {t("enter_your_email_and_password_to_sign_in_key")}
        </p>

        <form onSubmit={onSubmit} className="flex flex-col">
          <div className="mb-4">
            {!asFlat.checked ? <Input
              label={t("name_key")}
              {...user_name.bind}
              name="name"
            /> : <>
              <Input
                label={t("number_key")}
                {...number.bind}
                name="number"
              />
              <Input
                label={t("floor_key")}
                {...floor.bind}
                name="floor"
              />
            </>}
          </div>
          <div className="mb-2">
            <Input
              label={t("password_key")}
              name="password"
              type={showPass ? "text" : "password"}
              append={showPass ? <EyeIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} /> : <EyeSlashIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} />}
              {...password.bind}
            />
          </div>



          <Checkbox label={t("login_as_flat_owner_key")} {...asFlat.bind} />
          <Button
            disabled={isMutating || (!user_name.value && (!number.value && !floor.value)) || !password.value}
            className="w-full mt-6 btn--primary"
            type="submit"
          >
            {isMutating ? (
              <>
                <Spinner className="w-4 h-4 mr-3 rtl:ml-3" />
                {t("loading_key")}
              </>
            ) : (
              t("sign_in_now_key")
            )}
          </Button>
        </form>

      </div>
    </div>
  );
};

export default Login;

Login.getLayout = function PageLayout(page) {
  return <>{page}</>;
};


export const getServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
};
