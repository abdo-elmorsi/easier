import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header } from "components/global";
import { MinimizedBox, Spinner } from "components/UI";
import { useQueryString } from "hooks";
import { useApi } from "hooks/useApi";
import { Filter } from "components/pages/tower-balances";
import { formatComma, formatMinus } from "utils/utils";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

const Index = () => {
    const { t } = useTranslation("common");



    const { queryString } = useQueryString({});

    // Fetch data using the API
    const { data: towerBalances = {}, isLoading } = useApi(queryString.includes("tower_id") ? `/reports/tower-balances?${queryString}` : "");



    return (
        <>
            <div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
                <Header
                    title={t("tower_balances_key")}
                    path="/tower-balances"
                    classes="bg-gray-100 dark:bg-gray-700 border-none"
                />
                <MinimizedBox minimized={false}>
                    <Filter />
                </MinimizedBox>
                <div className="p-5 rounded-2xl bg-white dark:bg-gray-800">

                    {isLoading ? (
                        <div className="flex justify-center items-center my-28">
                            <Spinner className="h-10 w-10" />
                        </div>
                    ) : <div className="flex flex-col gap-8 w-full md:w-2/3">
                        <div className="flex justify-between items-start">
                            <p>{t('opening_balance_key')}</p>
                            <p>{formatComma(towerBalances?.openingBalance || 0)}</p>
                        </div>
                        <div className="flex justify-between items-start">
                            <p>{t('total_income_key')}</p>
                            <p>{formatComma(towerBalances?.totalIncome || 0)}</p>

                        </div>
                        <div className="flex justify-between items-start">
                            <p>{t('total_outcome_key')}</p>
                            <div className="relative group">
                                <p className="flex items-center gap-2">
                                    <QuestionMarkCircleIcon className="w-5 h-5 group-hover:text-primary" />
                                    <span>{formatComma((towerBalances?.balance - towerBalances?.openingBalance - towerBalances?.totalIncome) || 0)}</span>
                                </p>
                                <ul className="absolute duration-300 scale-0 group-hover:scale-100 flex flex-col gap-2 list-none text-sm bg-hoverPrimary rounded shadow-lg p-2 w-48">
                                    <li>{`${t("electricity_key")}: ${formatComma(towerBalances?.totalOutCome?.electricity || 0)}`}</li>
                                    <li>{`${t("water_key")}: ${formatComma(towerBalances?.totalOutCome?.water || 0)}`}</li>
                                    <li>{`${t("waste_key")}: ${formatComma(towerBalances?.totalOutCome?.waste || 0)}`}</li>
                                    <li>{`${t("guard_key")}: ${formatComma(towerBalances?.totalOutCome?.guard || 0)}`}</li>
                                    <li>{`${t("elevator_key")}: ${formatComma(towerBalances?.totalOutCome?.elevator || 0)}`}</li>
                                    <li>{`${t("others_key")}: ${formatComma(towerBalances?.totalOutCome?.others || 0)}`}</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-between items-start">
                            <p>{t('balance_key')}</p>
                            <p>{formatMinus(towerBalances?.balance || 0)}</p>

                        </div>
                    </div>}

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

export const getServerSideProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
};

export default Index;