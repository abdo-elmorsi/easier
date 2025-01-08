import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
// Custom
import { Button } from "components/UI";
import Image from "next/image";

export const Error404 = () => {
  const router = useRouter();
  const { t } = useTranslation("common");

  return (
    <>
      <div className="grid h-screen grid-cols-1 gap-12 px-6 text-gray-800 dark:bg-gray-700 dark:text-gray-300 sm:px-8 md:grid-cols-2 md:px-16 xl:px-32">
        <div className="  flex items-center self-center justify-center  ">
          <div className="self-center error404 dark:text-white text-gray-800">
            <h2 className="mb-3 text-4xl">404</h2>
            <h3 className="mb-2 text-xl">{t("UH OH! You're lost")}</h3>
            <p className="mb-5">
              {t(
                "donst_found_page_error_key"
              )}
            </p>
            <Button onClick={() => router.push("/")}>{t("home_key")}</Button>
          </div>
        </div>

        <div className=" flex items-center self-center justify-center w-3/4 h-3/4">
          <Image width={600} height={600} className="" src={"/images/404.png"} alt="404 not found" />
        </div>
      </div>
    </>
  );
};

export default Error404;

Error404.getLayout = function PageLayout(page) {
  return <>{page}</>;
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

