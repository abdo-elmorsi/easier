import Image from "next/image";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Button } from "components/UI";

export default function Error500() {
  const { t } = useTranslation("common");
  const router = useRouter()
  return (
    <>
      <div className="grid h-screen grid-cols-1 gap-12 px-6 text-gray-800 dark:bg-gray-700 dark:text-gray-300 sm:px-8 md:grid-cols-2 md:px-16 xl:px-32">
        <div className="flex items-center self-center justify-center ">
          <div className="self-center text-gray-800 error404 dark:text-white">
            <h3 className="mb-2 text-xl">{t("err500_key")}</h3>
            <p className="mb-5">
              {t(
                "err_500p_key"
              )}
            </p>
            <Button onClick={() => router.reload()}>{t("retry_key")}</Button>
          </div>
        </div>
        <div className="flex items-center self-center justify-center w-3/4  h-3/4">
          <Image width={600} height={600} className="" src={"/images/500.png"} alt="500 not found" />
        </div>
      </div>
    </>
  );
}
Error500.getLayout = function PageLayout(page) {
  return <>{page}</>;
};


export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

