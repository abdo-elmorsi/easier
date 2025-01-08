import { Excel, PrintPdf } from 'components/icons';
import Button from './Button';
import { PlusIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';
import { ServerSearchInput } from 'components/global';
import { useTranslation } from 'react-i18next';

export default function Actions({
  onClickAdd,
  isDisabledAdd = false,
  onClickPrint,
  isDisabledPrint = false,
  onClickExport,
  isDisabledExport = false,
  onClickPrintPaper,
  isDisabledPrintPaper = false,
  addMsg,

  disableSearch,
  ...props
}) {
  const { t } = useTranslation("common");
  return (
    <>
      {!disableSearch && <ServerSearchInput
        id="search-bar"
        name="search-bar"
        maxLength={50}
      />}
      <div className="flex items-center gap-2">
        {onClickExport && <button
          aria-label={t('export_excel_key')}
          title={t('export_excel_key')}
          onClick={() => onClickExport()}
          className={`${(isDisabledExport) ? "cursor-not-allowed" : "cursor-pointer"} dark:bg-gray-gray-900 rounded-full bg-gray-100 dark:bg-gray-500 dark:hover:bg-gray-400 p-3 hover:bg-gray-200`}
        >
          <Excel />
        </button>}

        {onClickPrint && <button
          aria-label={t('print_pdf_key')}
          title={t('print_pdf_key')}
          onClick={() => onClickPrint()}
          className={`${(isDisabledPrint) ? "cursor-not-allowed" : "cursor-pointer"} dark:bg-gray-gray-900 rounded-full bg-gray-100 dark:bg-gray-500 dark:hover:bg-gray-400 p-3 hover:bg-gray-200`}
        >
          <PrintPdf />
        </button>}
        {onClickPrintPaper && <button
          aria-label={t('print_paper_key')}
          title={t('print_paper_key')}
          onClick={() => onClickPrintPaper()}
          className={`${(isDisabledPrintPaper) ? "cursor-not-allowed" : "cursor-pointer"} dark:bg-gray-gray-900 rounded-full bg-gray-100 dark:bg-gray-500 dark:hover:bg-gray-400 p-3 hover:bg-gray-200`}
        >
          {t("print_paper_key")}
        </button>}

        {onClickAdd && <Button
          onClick={() => onClickAdd()}
          disabled={isDisabledAdd}
          className={`btn--primary flex flex-row items-center justify-center`}
          type="button"
        >
          <PlusIcon width={25} />
          <span>{addMsg}</span>
        </Button>}

        {props.Children}

      </div>
    </>
  )
}
Actions.propTypes = {
  onClickAdd: PropTypes.func,
  isDisabledAdd: PropTypes.bool,
  onClickPrint: PropTypes.func,
  isDisabledPrint: PropTypes.bool,
  onClickExport: PropTypes.func,
  isDisabledExport: PropTypes.bool,
  disableSearch: PropTypes.bool,
  addMsg: PropTypes.string,
  searchQuery: PropTypes.string,
  setSearchQuery: PropTypes.func,
  fetchReport: PropTypes.func,
  Children: PropTypes.node,
};