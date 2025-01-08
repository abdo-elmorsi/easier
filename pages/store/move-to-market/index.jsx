import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import moment from 'moment-timezone';

// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { Header, ServerTable, PrintView } from "components/global";
import { Actions, Button, MinimizedBox } from "components/UI";
import { Filter } from "components/pages/transactions";
import { exportExcel } from "utils";
import { useHandleMessage, useQueryString } from "hooks";
import { useApi } from "hooks/useApi";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
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
        type: "storeToMarket"
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


    // useEffect(() => {
    //     const time = setTimeout(() => {
    //         router.push(`/store/move-to-market/add-update`)
    //     }, 500);
    //     return () => clearTimeout(time);
    // }, [])

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
            },
            {
                name: t("actions_key"), // Translate key for actions
                selector: (row) => row?.id,
                noExport: true,
                noPrint: true,
                cell: (row) => (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => router.push(`/store/move-to-market/add-update?id=${row?.id}`)}
                            className="px-3 py-2 cursor-pointer btn--primary"
                        >
                            <PencilSquareIcon width={22} />
                        </Button>
                        {/* <Button
                            onClick={() =>
                                setShowDeleteModal({ isOpen: true, id: row?.id })
                            }
                            className="px-3 py-2 text-white bg-red-500 cursor-pointer hover:bg-red-600"
                        >
                            <TrashIcon width={22} />
                        </Button> */}
                    </div>
                ),
                sortable: false
            }
        ],
        [date_format, router, t]
    );


    // ================== Export Functions ==================
    const handleExportExcel = async () => {
        setExportingExcel(true);
        await exportExcel(tableData, columns, t("move_to_market_key"), handleMessage);
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
                    title={t("move_to_market_key")}
                    path="/store/move-to-market"
                    classes="bg-gray-100 dark:bg-gray-700 border-none"
                />
                <MinimizedBox>
                    <Filter />
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
                            addMsg={t("add_key")}
                            onClickAdd={() => router.push("/store/move-to-market/add-update")}
                            onClickPrint={exportPDF}
                            isDisabledPrint={!tableData?.length}
                            onClickExport={handleExportExcel}
                            isDisabledExport={exportingExcel || !tableData?.length}
                        />
                    }
                />
            </div>
            {tableData?.length && <PrintView
                title={t("move_to_market_key")}
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