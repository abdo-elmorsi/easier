import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import moment from 'moment-timezone';

// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header, ServerTable, PrintView } from "components/global";
import { Actions, MinimizedBox } from "components/UI";
import { Filter } from "components/pages/transactions";
import { exportExcel } from "utils";
import { useHandleMessage, useQueryString } from "hooks";
import { useApi } from "hooks/useApi";
import { formatComma } from "utils/utils";

const Index = () => {
    const router = useRouter();
    const language = router.locale.toLowerCase();
    const date_format = language === "en" ? "DD-MM-YYYY (hh:mm-A)" : "DD-MM-YYYY (hh:mm-A)";
    const handleMessage = useHandleMessage();
    const { t } = useTranslation("common");
    const [exportingExcel, setExportingExcel] = useState(false);
    const printViewRef = useRef(null);


    // ================== Query String ==================
    const page = Number(router.query.page) || 1; // Default to page 1
    const limit = Number(router.query.limit) || 10; // Default limit
    const startDate = router.query.startDate || moment().subtract(0, 'days').format("YYYY-MM-DD"); // Default start date

    const { queryString, updateQuery } = useQueryString({
        page,
        limit,
        startDate,
    });


    // ================== Handlers for Pagination ==================
    const handlePageChange = (newPage) => {
        updateQuery("page", newPage);
    };

    const handlePerRowsChange = (rowsPerPage) => {
        updateQuery({ page: 1, limit: rowsPerPage });
    };

    // ================== Fetch Data ==================
    const { data = {}, isLoading } = useApi(`/transactions?${queryString}`);
    const { transactions: tableData = [], totalTransactions } = data;


    const typeOptions = useMemo(() => [
        { name: t("store_in_key"), id: "storeIn" },
        { name: t("store_out_key"), id: "storeOut" },
        { name: t("store_to_market_key"), id: "storeToMarket" },
        { name: t("market_to_store_key"), id: "marketToStore" },
        { name: t("market_out_key"), id: "marketOut" },
        { name: t("market_return_key"), id: "marketReturn" },
    ], [t])
    // ================== Table Columns ==================
    const columns = useMemo(
        () => [
            {
                name: t("product_name_key"), // Translate key for product name
                selector: (row) => row?.product?.name, // Access product name
                sortable: true
            },
            {
                name: t("transaction_type_key"), // Translate key for product name
                selector: (row) => typeOptions.find(type => type.id == row?.type)?.name || "", // Access product name
                sortable: true
            },
            {
                name: t("quantity_key"), // Translate key for quantity
                selector: (row) => row?.quantity, // Access quantity
                cell: (row) => formatComma(row?.quantity), // Access quantity
                sortable: true
            },
            {
                name: t("created_by_key"),
                selector: (row) => row?.createdBy?.user_name,
                sortable: true
            },
            {
                name: t("updated_by_key"),
                selector: (row) => row?.lastUpdatedBy?.user_name,
                sortable: true
            },
            {
                name: t("created_at_key"),
                selector: (row) => row?.createdAt,
                cell: (row) => moment(row?.createdAt).format(date_format),
                sortable: true,
                width: "130px"
            },
            {
                name: t("updated_at_key"),
                selector: (row) => row?.updatedAt,
                cell: (row) => moment(row?.updatedAt).format(date_format),
                sortable: true,
                width: "130px"
            },
            {
                name: t("description_key"), // Translate key for description
                selector: (row) => row?.description, // Access description
                sortable: true
            }
        ],
        [date_format, typeOptions, t]
    );


    // ================== Export Functions ==================
    const handleExportExcel = async () => {
        setExportingExcel(true);
        await exportExcel(tableData, columns, t("transactions_key"), handleMessage);
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
            <div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
                <Header
                    title={t("transactions_key")}
                    path="/reports/transactions"
                    classes="bg-gray-100 dark:bg-gray-700 border-none"
                />
                <MinimizedBox>
                    <Filter showType={true} typeOptions={typeOptions} />
                </MinimizedBox>
                <ServerTable
                    columns={columns}
                    data={tableData || []}
                    handlePageChange={handlePageChange}
                    handlePerRowsChange={handlePerRowsChange}
                    progressPending={isLoading}
                    paginationTotalRows={totalTransactions}
                    paginationPerPage={limit} // Use limit from router query
                    paginationDefaultPage={page} // Use page from router query
                    actions={
                        <Actions
                            onClickPrint={exportPDF}
                            isDisabledPrint={!tableData?.length}
                            onClickExport={handleExportExcel}
                            isDisabledExport={exportingExcel || !tableData?.length}
                        />
                    }
                />
            </div>
            {tableData?.length && <PrintView
                title={t("transactions_key")}
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
    session: PropTypes.object.isRequired
};

export const getServerSideProps = async ({ req, locale, resolvedUrl }) => {
    const session = await getSession({ req });

    if (!session) {
        const loginUrl = locale === "en" ? `/${locale}/login` : "/login";
        return {
            redirect: {
                destination: `${loginUrl}?returnTo=${encodeURIComponent(resolvedUrl || "/")}`,
                permanent: false
            }
        };
    } else {
        return {
            props: {
                session,
                ...(await serverSideTranslations(locale, ["common"]))
            }
        };
    }
};


export default Index;