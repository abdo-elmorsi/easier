import DataTable from "react-data-table-component";
import PropTypes from "prop-types";
import { Spinner } from "components/UI";
import { useTranslation } from "react-i18next";
import { useTheme } from "context/ThemeContext";

const ServerTable = ({
  data,
  columns,
  noHeader = false, // Set default value here
  paginationDefaultPage = 1, // Default page
  paginationPerPage = 10, // Default rows per page
  paginationRowsPerPageOptions = [10, 25, 50, 100, 1000], // Default pagination options
  actions = null, // Default to null if no actions
  selectableRowSelected = () => { }, // Default to empty function
  handlePageChange = () => { }, // Default to empty function
  handlePerRowsChange = () => { }, // Default to empty function
  paginationTotalRows = 0, // Default total rows
  ...rest
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation("common");

  return (
    <div className="p-5 overflow-hidden bg-white rounded-2xl dark:bg-gray-800">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2 mb-2">
        {actions}
      </div>
      <DataTable
        fixedHeader
        noHeader={noHeader}
        fixedHeaderScrollHeight="550px"
        data={data}
        columns={columns}
        theme={theme}
        selectableRowSelected={selectableRowSelected}
        highlightOnHover
        defaultSortField="id"
        defaultSortAsc={false}
        pagination
        paginationServer
        paginationPerPage={paginationPerPage}
        paginationTotalRows={paginationTotalRows}
        paginationDefaultPage={paginationDefaultPage}
        paginationRowsPerPageOptions={paginationRowsPerPageOptions}
        paginationComponentOptions={{
          rowsPerPageText: t("rows_per_page_key"),
          rangeSeparatorText: t("of_key"),
        }}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
        progressPending={rest.loading}
        progressComponent={<Spinner className="w-10 my-32" />}
        noDataComponent={<h3 className="my-16">{t("table_no_data_message_key")}</h3>}
        {...rest}
      />
    </div>
  );
};

ServerTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      selector: PropTypes.oneOfType([PropTypes.string, PropTypes.func.isRequired]),
      sortable: PropTypes.bool,
      format: PropTypes.func,
      cell: PropTypes.func,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      wrap: PropTypes.bool,
    })
  ).isRequired,
  noHeader: PropTypes.bool,
  paginationPerPage: PropTypes.number,
  paginationRowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  actions: PropTypes.element,
  selectableRowSelected: PropTypes.func,
  handlePageChange: PropTypes.func,
  handlePerRowsChange: PropTypes.func,
  paginationTotalRows: PropTypes.number,
};

export default ServerTable;
