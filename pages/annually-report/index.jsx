import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header, Table, PrintView } from "components/global";
import { Actions, MinimizedBox } from "components/UI";
import { exportExcel } from "utils";
import { useHandleMessage, useQueryString } from "hooks";
import { useApi } from "hooks/useApi";
import moment from 'moment-timezone';
import { payPercentageOptions } from "assets";
import { Filter } from "components/pages/annually-report";
import { formatNumber } from "utils/utils";

const Index = () => {
    const router = useRouter();
    const language = router.locale.toLowerCase();
    const date_format = language === "en" ? "DD-MM-YYYY (hh:mm-A)" : "DD-MM-YYYY (hh:mm-A)";
    const handleMessage = useHandleMessage();
    const { t } = useTranslation("common");
    const [exportingExcel, setExportingExcel] = useState(false);
    const printViewRef = useRef(null);



    const { queryString } = useQueryString({});

    // Fetch data using the API
    const { data: tableData, isLoading } = useApi(queryString.includes("flat_id") ? `/reports/annually-report?${queryString}` : "");



    // ================== Table Columns ==================
    const columns = useMemo(
        () => [
            {
                name: t("flat_key"),
                selector: (row) => `n: ${row?.flat?.number} / f: ${row?.flat?.floor}`,
                sortable: true,
                width: "150px",
                omit: queryString?.includes("flat_id")
            },
            {
                name: t("payed_amount_key"),
                selector: (row) => row?.payed_amount,
                cell: (row) => <p className="text-primary">{formatNumber(row?.payed_amount)}</p>,
                sortable: true,
                width: "150px"
            },
            {
                name: t("pay_percentage_key"),
                selector: (row) => row?.pay_percentage,
                cell: (row) => <p className={`${row?.pay_percentage === 0 ? "text-red-500" : row?.pay_percentage === 50 ? "text-blue-500" : "text-green-500"}`}>
                    {payPercentageOptions.find(item => item.value == row?.pay_percentage)?.label}
                </p>,
                sortable: true,
                width: "180px"
            },

            {
                name: t("electricity_key"),
                selector: (row) => formatNumber(row?.electricity),
                sortable: true,
                width: "150px"
            },
            {
                name: t("water_key"),
                selector: (row) => formatNumber(row?.water),
                sortable: true,
                width: "150px"
            },
            {
                name: t("waste_key"),
                selector: (row) => formatNumber(row?.waste),
                sortable: true,
                width: "150px"
            },
            {
                name: t("guard_key"),
                selector: (row) => formatNumber(row?.guard),
                sortable: true,
                width: "150px"
            },
            {
                name: t("elevator_key"),
                selector: (row) => formatNumber(row?.elevator),
                sortable: true,
                width: "150px"
            },
            {
                name: t("others_key"),
                selector: (row) => formatNumber(row?.others),
                sortable: true,
                width: "150px"
            },
            {
                name: t("total_expenses_key"),
                selector: (row) => formatNumber(row?.total_expenses),
                sortable: true,
                width: "150px"
            },
            {
                name: t("net_amount_key"),
                selector: (row) => formatNumber(row?.net_amount),
                cell: (row) => <p className={`${row?.net_amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatNumber(row?.net_amount)}
                </p>,
                sortable: true,
                width: "150px"
            },
            {
                name: t("created_at_key"),
                selector: (row) => moment(row?.created_at).format("MM-YYYY"),
                sortable: true,
                width: "130px"
            },

        ],
        [date_format, router, t]
    );

    // ================== Export Functions ==================
    const handleExportExcel = async () => {
        setExportingExcel(true);
        await exportExcel(tableData, columns, t("annually_report_key"), handleMessage);
        setTimeout(() => {
            setExportingExcel(false);
        }, 1000);
    };

    const exportPDF = useCallback(() => {
        if (printViewRef.current) {
            printViewRef.current.print();
        }
    }, [printViewRef.current]);

    return (
        <>
            <div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-800">
                <Header
                    title={t("annually_report_key")}
                    path="/annually-report"
                    classes="bg-gray-100 dark:bg-gray-700 border-none"
                />
                <MinimizedBox minimized={false}>
                    <Filter />
                </MinimizedBox>
                <Table
                    columns={columns}
                    data={tableData || []}
                    loading={isLoading}
                    searchAble={false}
                    noDataMsg="choose_a_flat_to_see_data_key"
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
                title={t("annually_report_key")}
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

export const getServerSideProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
};

export default Index;