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
import { formatComma, groupBy, sum } from "utils/utils";

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
    const limit = Number(router.query.limit) || 10000; // Default limit
    const startDate = router.query.startDate || moment().subtract(0, 'days').format("YYYY-MM-DD"); // Default start date

    const { queryString, updateQuery } = useQueryString({
        page,
        limit,
        startDate,
        type: "marketOut",
        getProductDetails: true
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
    const { transactions = [], totalTransactions } = data;
    const tableData = groupBy(transactions.map(tr => {
        return {
            ...tr,
            quantity: sum(transactions?.filter(e => e.productId == tr.productId), "quantity"),
            earning: tr?.quantity * tr?.product?.price - ((tr?.quantity / tr?.product?.piecesNo) * tr?.product?.wholesalePrice)
        }
    }), "productId", "earning")


    // ================== Table Columns ==================
    const columns = useMemo(
        () => [
            {
                name: t("product_name_key"), // Translate key for product name
                selector: (row) => row?.product?.name, // Access product name
                sortable: true
            },
            {
                name: t("quantity_key"), // Translate key for quantity
                selector: (row) => row?.quantity, // Access quantity
                cell: (row) => formatComma(row?.quantity), // Access quantity
                sortable: true
            },
            {
                name: t("price_key"), // Translate key for quantity
                selector: (row) => row?.product?.price, // Access quantity
                cell: (row) => formatComma(row?.product?.price), // Access quantity
                sortable: true
            },
            {
                name: t("earning_key"), // Translate key for quantity
                selector: (row) => row?.earning, // Access quantity
                cell: (row) => <p className="text-green-500">
                    {formatComma(row?.earning)}
                </p>, // Access quantity
                sortable: true
            }
        ],
        [date_format, t]
    );


    // ================== Export Functions ==================
    const handleExportExcel = async () => {
        setExportingExcel(true);
        await exportExcel(tableData, columns, t("earnings_products_report_key"), handleMessage);
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
                    title={t("earnings_products_report_key")}
                    path="/reports/earnings-products"
                    classes="bg-gray-100 dark:bg-gray-700 border-none"
                />
                <MinimizedBox>
                    <Filter
                        showCreatedBy={false}
                        showUpdatedBy={false}
                        showType={false} />
                </MinimizedBox>
                <ServerTable
                    columns={columns}
                    data={tableData || []}
                    handlePageChange={handlePageChange}
                    handlePerRowsChange={handlePerRowsChange}
                    progressPending={isLoading}
                    paginationTotalRows={totalTransactions}
                    paginationPerPage={limit} // Use limit from router query
                    paginationRowsPerPageOptions={[10000]}
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
                title={t("earnings_products_report_key")}
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