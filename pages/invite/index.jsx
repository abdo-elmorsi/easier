import { useEffect, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

// Custom
import { useHandleMessage, useInput } from "hooks";
import { Spinner, Button, Input } from "components/UI";
import { MainLogo } from "components/icons";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useApi, useApiMutation } from "hooks/useApi";



const Login = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const flatId = router.query.flatId;
  const handleMessage = useHandleMessage();


  const email = useInput("", 'email', true);
  const user_name = useInput("", null);
  const phone = useInput("", null);
  const password = useInput("", "password_optional", true);
  const confirmPassword = useInput("", "password_optional", true);




  const [showPass, setShowPass] = useState(false);
  const handleShowPass = () => setShowPass(!showPass);



  const { data: flat = {}, isLoading } = useApi(flatId ? `/complete-profile?id=${flatId}` : null);
  const { executeMutation, isMutating } = useApiMutation(`/complete-profile`);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.value != confirmPassword.value) {
      handleMessage(t("new_password_does_not_match_confirm_password_key"), "warning");
      confirmPassword
      return;
    }
    const submitData = {
      id: flatId,
      user_name: user_name.value,
      email: email.value,
      phone: phone.value,
      password: password.value,
    };
    try {
      await executeMutation("PUT", submitData);


      router.replace('/login');
    } catch (error) {
      handleMessage(error);
    }
  };


  useEffect(() => {
    if (!isLoading) {
      if (flat?.id) {
        phone.changeValue(flat?.phone || "");
        email.changeValue(flat?.email || "");
        user_name.changeValue(flat?.user_name || "");
      } else {
        handleMessage("Invalid flat ID provided.", "error");
        router.push("/");
      }
    }
  }, [isLoading]);


  return (
    <div className="flex items-center justify-center h-screen dark:bg-dark dark:bg-gray-800">
      <div className="hidden bg-center bg-cover login md:block md:w-1/2">
        <div className="flex flex-col items-center justify-center h-screen">
          <MainLogo className="text-white w-52" />
        </div>
      </div>
      <div className="w-full px-4 md:w-1/2 md:px-12 xl:px-48">
        <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
          {t("welcome_to_easier")}
        </h1>
        <p className="mb-2 text-sm text-gray-500 dark:text-white">
          {t("complete_profile_to_join")}
        </p>


        <form onSubmit={onSubmit} className="flex flex-col">
          <div className="mb-4">
            <Input
              mandatory
              label={t("user_name_key")}
              {...user_name.bind}
              name="user_name"
            />
            <Input
              mandatory
              label={t("email_key")}
              {...email.bind}
              name="email"
            />
            <Input
              label={t("phone_key")}
              {...phone.bind}
              name="phone"
            />


            <Input
              label={t("password_key")}
              name="password"
              type={showPass ? "text" : "password"}
              append={showPass ? <EyeIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} /> : <EyeSlashIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} />}
              {...password.bind}
            />

            <Input
              label={t("confirm_password_key")}
              type={showPass ? "text" : "password"}
              append={showPass ? <EyeIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} /> : <EyeSlashIcon onClick={handleShowPass} className="cursor-pointer text-primary" width={"25"} />}
              className={"w-full"}
              hasError
              {...confirmPassword.bind}
            />
          </div>



          <Button
            disabled={
              isMutating ||
              !password.value ||
              !email.value ||
              !user_name?.value ||
              !phone?.value ||
              !password?.value
            }

            className="w-full mt-6 btn--primary"
            type="submit"
          >
            {isMutating ? (
              <>
                <Spinner className="w-4 h-4 mr-3 rtl:ml-3" />
                {t("loading_key")}
              </>
            ) : (
              t("save_key")
            )}
          </Button>
        </form>

      </div >
    </div >
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
