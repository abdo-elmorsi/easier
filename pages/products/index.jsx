import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/react";
import PropTypes from "prop-types";
import { useRouter } from "next/router";
import moment from 'moment-timezone';

// Custom imports
import { Layout, LayoutWithSidebar } from "components/layout";
import { DeleteModal, Header, Table, PrintView } from "components/global";
import { Actions, Button, MinimizedBox, Modal } from "components/UI";
import { Filter } from "components/pages/products";
import { exportExcel } from "utils";
import { useHandleMessage, useQueryString } from "hooks";
import { useApi, useApiMutation } from "hooks/useApi";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatComma, getRole, sum } from "utils/utils";

const Index = ({ session }) => {
    const router = useRouter();
    const admin = getRole(session, "admin")
    const language = router.locale.toLowerCase();
    const date_format = language === "en" ? "DD-MM-YYYY (hh:mm-A)" : "DD-MM-YYYY (hh:mm-A)";
    const handleMessage = useHandleMessage();
    const { t } = useTranslation("common");
    const [exportingExcel, setExportingExcel] = useState(false);
    const printViewRef = useRef(null);


    const [paperMode, setPaperMode] = useState(false);
    // ================== Filter Logic ==================
    const { queryString } = useQueryString();
    const { data: tableData, isLoading, mutate } = useApi(`/products?${queryString}`);
    const totalEarning = sum(tableData, "earning")
    // ================== Delete Logic ==================
    const [showDeleteModal, setShowDeleteModal] = useState({
        loading: false,
        isOpen: false,
        id: null,
    });
    const { executeMutation } = useApiMutation(`/products`);

    const closeDeleteModal = () => {
        setShowDeleteModal({ isOpen: false, loading: false, id: null });
    };

    const handleDelete = async () => {
        setShowDeleteModal((prev) => ({ ...prev, loading: true }));
        try {
            await executeMutation("DELETE", { id: showDeleteModal.id });
            mutate();
            closeDeleteModal();
        } catch (error) {
            handleMessage(error);
        } finally {
            setShowDeleteModal((prev) => ({ ...prev, loading: false }));
        }
    };

    // ================== Table Columns ==================
    const columns = useMemo(
        () => {
            return !paperMode ? [
                {
                    name: t("name_key"),
                    // selector: (row) => `${row?.name}`,
                    selector: (row) => `${row?.name} ${row.price}ج-${row.piecesNo}ق`,
                    sortable: true
                },
                {
                    name: t("price_key"),
                    selector: (row) => row?.price,
                    cell: (row) => formatComma(row?.price),
                    sortable: true
                },
                {
                    name: t("wholesale_price_key"),
                    selector: (row) => row?.wholesalePrice,
                    cell: (row) => formatComma(row?.wholesalePrice),
                    sortable: true
                },
                {
                    name: t("category_key"),
                    selector: (row) => row?.category?.name,
                    sortable: true
                },
                {
                    name: t("quantity_in_store_key"),
                    selector: (row) => row?.quantityInStore,
                    cell: (row) => formatComma(row?.quantityInStore),
                    sortable: true
                },
                {
                    name: t("quantity_in_market_key"),
                    selector: (row) => row?.quantityInMarket,
                    cell: (row) => formatComma(row?.quantityInMarket),
                    sortable: true
                },
                {
                    name: t("balance_key"),
                    selector: (row) => formatComma(row?.quantityInStock),
                    cell: (row) => <p className={`${row?.quantityInStock > 0 ? "text-green-500" : "text-red-500"} text-green-500`}>
                        {formatComma(row?.quantityInStock)} ({row?.unit?.name})
                    </p>,
                    sortable: true
                },
                {
                    name: <div className="flex flex-col justify-center items-center">
                        <span>{t("earning_key")}</span>
                        <span className=" text-yellow-800 font-bold">{formatComma(totalEarning)}</span>
                    </div>,
                    selector: (row) => formatComma(row?.earning),
                    cell: (row) => <p className="text-primary">{formatComma(row?.earning)}</p>,
                    sortable: true,
                    omit: !admin
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
                    name: t("actions_key"),
                    selector: (row) => row?.id,
                    noExport: true,
                    noPrint: true,
                    cell: (row) => (
                        <div className="flex gap-2">
                            <Button
                                onClick={() => router.push(`/products/add-update?id=${row?.id}`)}
                                className="px-3 py-2 cursor-pointer btn--primary"
                            >
                                <PencilSquareIcon width={22} />
                            </Button>
                            <Button
                                onClick={() => setShowDeleteModal({ isOpen: true, id: row?.id })}
                                className="px-3 py-2 text-white bg-red-500 cursor-pointer hover:bg-red-600"
                            >
                                <TrashIcon width={22} />
                            </Button>
                        </div>
                    ),
                    sortable: false
                }
            ] : [
                // {
                //     name: "#",
                //     selector: (row) => row?.index,
                //     width: "50px",
                //     sortable: false
                // },
                {
                    name: t("name_key"),
                    // selector: (row) => `${row?.name}`,
                    width: "380px",
                    selector: (row) => row?.name,
                    cell: (row) => <p className="">{`${row?.name} ${row.price}ج - ${row.piecesNo}ق - ${row?.wholesalePrice} ج`}</p>,
                    sortable: true
                },
                {
                    name: moment().format("MM-DD"),
                    selector: (row) => "",
                    width: "150px"
                },
                {
                    name: moment().add(1, "days").format("MM-DD"),
                    selector: (row) => "",
                    width: "150px"
                },
                {
                    name: moment().add(2, "days").format("MM-DD"),
                    selector: (row) => "",
                    width: "150px"
                },
                {
                    name: moment().add(3, "days").format("MM-DD"),
                    selector: (row) => "",
                    width: "150px"
                },
                {
                    name: moment().add(4, "days").format("MM-DD"),
                    selector: (row) => "",
                    width: "150px"
                },
                {
                    name: moment().add(5, "days").format("MM-DD"),
                    selector: (row) => "",
                    width: "150px"
                },
                {
                    name: moment().add(6, "days").format("MM-DD"),
                    selector: (row) => "",
                    width: "150px"
                },
            ]
        },
        [date_format, paperMode, admin, totalEarning, router, t]
    );

    // ================== Export Functions ==================
    const handleExportExcel = async () => {
        setExportingExcel(true);
        await exportExcel(tableData, columns, t("products_key"), handleMessage);
        setTimeout(() => {
            setExportingExcel(false);
        }, 1000);
    };

    const exportPDF = useCallback((paperMode) => {
        setPaperMode(paperMode);
        if (printViewRef.current) {
            printViewRef.current.print();
        }
    }, [printViewRef.current, paperMode]);


    return (
        <>
            <div className="min-h-full bg-gray-100 rounded-md dark:bg-gray-700">
                <Header
                    title={t("products_key")}
                    path="/products"
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
                    paginationPerPage={10}
                    actions={
                        <Actions
                            disableSearch={false}
                            addMsg={t("add_key")}
                            onClickAdd={() => router.push("/products/add-update")}
                            onClickPrint={() => exportPDF(false)}
                            onClickPrintPaper={() => exportPDF(true)}
                            isDisabledPrintPaper={!tableData?.length}
                            isDisabledPrint={!tableData?.length}
                            onClickExport={handleExportExcel}
                            isDisabledExport={exportingExcel || !tableData?.length}
                        />
                    }
                />
            </div>
            {tableData?.length && <PrintView
                title={t("products_key")}
                ref={printViewRef}
                data={tableData}
                columns={columns}
                paperMode={paperMode}
            />}
            {showDeleteModal?.isOpen && (
                <Modal
                    title={t("delete_key")}
                    show={showDeleteModal?.isOpen}
                    footer={false}
                    onClose={closeDeleteModal}
                >
                    <DeleteModal
                        showDeleteModal={showDeleteModal}
                        handleClose={closeDeleteModal}
                        handleDelete={handleDelete}
                    />
                </Modal>
            )}
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