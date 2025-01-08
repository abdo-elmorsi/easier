import PropTypes from "prop-types";

// Custom
import { Button, Spinner } from "components/UI";
import { useTranslation } from "react-i18next";

export default function DeleteModal({ showDeleteModal, handleClose, handleDelete }) {
  const { t } = useTranslation("common");

  return (<div className="w-full md:w-96">
    <h2 className=" text-xl">{t("warning_delete_key")}</h2>

    <div className='flex items-center justify-end gap-4 pt-4 mt-20 border-t'>
      <Button
        onClick={handleClose}
        className="w-32 btn--secondary"
        type="button"
      >{t("cancel_key")}</Button>
      <Button
        disabled={showDeleteModal?.loading}
        onClick={handleDelete}
        className="w-32 btn--primary"
      >
        {showDeleteModal?.loading ? (
          <>
            <Spinner className="w-4 h-4 mr-3 rtl:ml-3" />
            {t("loading_key")}
          </>
        ) : (
          t("delete_key")
        )}
      </Button>
    </div>
  </div>

  )
}
DeleteModal.propTypes = {
  showDeleteModal: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};