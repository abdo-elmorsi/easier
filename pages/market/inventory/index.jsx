import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import moment from 'moment-timezone';

// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header, Table, PrintView } from "components/global";
import { Actions, Button, MinimizedBox } from "components/UI";
import { Filter } from "components/pages/inventory";
import { exportExcel } from "utils";
import { useHandleMessage, useQueryString } from "hooks";
import { useApi } from "hooks/useApi";
import { EyeIcon } from "@heroicons/react/24/outline";
import { formatComma, getRole, sum } from "utils/utils";

const Index = ({ session }) => {
    const router = useRouter();
    const admin = getRole(session, "admin")
    const handleMessage = useHandleMessage();
    const { t } = useTranslation("common");
    const [exportingExcel, setExportingExcel] = useState(false);
    const printViewRef = useRef(null);


    // ================== Filter Logic ==================
    const { queryString } = useQueryString();
    const { data: tableData, isLoading } = useApi(`/products?${queryString}`);
    const totalEarning = sum(tableData, "earningMarket")


    // ================== Table Columns ==================
    const columns = useMemo(
        () => [
            {
                name: t("name_key"),
                selector: (row) => row?.name,
                sortable: true
            },
            {
                name: t("category_key"),
                selector: (row) => row?.category?.name,
                sortable: true
            },
            {
                name: t("balance_key"),
                selector: (row) => formatComma(row?.quantityInMarket),
                cell: (row) => <p className={`${row?.quantityInMarket > 0 ? "text-green-500" : "text-red-500"} text-green-500`}>
                    {formatComma(row?.quantityInMarket)} ({row?.unit?.name})
                </p>,
                sortable: true
            },
            {
                name: <div className="flex flex-col justify-center items-center">
                    <span>{t("earning_key")}</span>
                    <span className=" text-yellow-500 font-bold">{formatComma(totalEarning)}</span>
                </div>,
                selector: (row) => formatComma(row?.earningMarket),
                cell: (row) => <p className="text-primary">{formatComma(row?.earningMarket)}</p>,
                sortable: true,
                omit: !admin
            },
            {
                name: t("actions_key"),
                selector: (row) => row?.id,
                noExport: true,
                noPrint: true,
                cell: (row) => {
                    const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");
                    return <div className="flex gap-2">
                        <Button
                            onClick={() => router.push(`/reports/transactions?productId=${row?.id}&startDate=${yesterday}`)}
                            className="px-3 py-2 cursor-pointer btn--primary"
                        >
                            <EyeIcon width={22} />
                        </Button>
                    </div>
                },
                sortable: false
            }
        ],
        [router, admin, totalEarning, t]
    );

    // ================== Export Functions ==================
    const handleExportExcel = async () => {
        setExportingExcel(true);
        await exportExcel(tableData, columns, `${t("market_key")} - ${t("inventory_key")}`, handleMessage);
        setTimeout(() => {
            setExportingExcel(false);
        }, 1000);
    };

    const exportPDF = useCallback(() => {
        if (printViewRef.current) {
            printViewRef.current.print();
        }
    }, []);


    return (
        <>
            <div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
                <Header
                    title={`${t("market_key")} - ${t("inventory_key")}`}
                    path="/market/inventory"
                    classes="bg-gray-100 dark:bg-gray-700 border-none"
                />
                <MinimizedBox>
                    <Filter />
                </MinimizedBox>
                <Table
                    columns={columns}
                    data={tableData || []}
                    loading={isLoading}
                    searchAble={false}
                    actions={
                        <Actions
                            disableSearch={false}
                            onClickPrint={exportPDF}
                            isDisabledPrint={!tableData?.length}
                            onClickExport={handleExportExcel}
                            isDisabledExport={exportingExcel || !tableData?.length}
                        />
                    }
                />
            </div>
            {tableData?.length && <PrintView
                title={`${t("market_key")} - ${t("inventory_key")}`}
                ref={printViewRef}
                data={tableData}
                columns={columns}
            />}
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
    const session = await getSession({ req });

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
