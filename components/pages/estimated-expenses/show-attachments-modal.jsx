import PropTypes from "prop-types";
import { Button } from "components/UI";
import { useTranslation } from "next-i18next";
import { useApi } from "hooks/useApi";
import { ArrowDownCircleIcon, ShareIcon } from "@heroicons/react/24/outline";

export default function ShowAttachmentsModal({ showImagesModal, handleClose }) {
  const { t } = useTranslation("common");
  const public_ids = showImagesModal?.attachments.join(",");
  const queryString = `page=1&perPage=100&public_ids=${public_ids}`;
  const { data: tableData, isLoading } = useApi(`/attachments?${queryString}`);

  const downloadAttachment = async (attachment) => {
    try {
      const response = await fetch(attachment.secure_url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${attachment.public_id}.${attachment.format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }

  return (
    <div className="w-full md:max-w-screen-xl md:min-w-[80vh] overflow-y-auto max-h-[70vh]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {isLoading ? <>
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} />
          ))}
        </> :
          tableData?.map((attachment) => (
            <div key={attachment.asset_id} className="flex flex-col items-center">
              <img
                src={attachment.secure_url}
                alt={`attachment-${attachment.asset_id}`}
                className="object-cover w-full h-28 md:h-48 rounded-lg" // Increased size
              />
              <div className="mt-2 text-center text-sm">
                <p>{`${t('size_key')}: ${(attachment.bytes / 1024).toFixed(2)} KB`}</p>
                <p>{`${t('dimensions_key')}: ${attachment.width} x ${attachment.height}`}</p>
              </div>
              <div className="mt-4 flex items-center justify-start gap-2">
                <Button
                  className="btn btn--primary"
                  type="button"
                  onClick={() => window.open(attachment.secure_url, "_blank")}
                >
                  <ShareIcon className="w-5 h-5" />
                </Button>
                <Button
                  className="btn btn--secondary"
                  type="button"
                  onClick={() => downloadAttachment(attachment)}
                >
                  <ArrowDownCircleIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

ShowAttachmentsModal.propTypes = {
  handleClose: PropTypes.func.isRequired,
};


const Skeleton = () => (
  <div className="flex flex-col items-center animate-pulse">
    <div className="bg-gray-200 w-full h-28 md:h-48 rounded-lg" />
    <div className="mt-2 text-center text-sm">
      <div className="bg-gray-200 w-24 h-4 mb-2 rounded" />
      <div className="bg-gray-200 w-32 h-4 rounded" />
    </div>
    <div className="mt-4 flex items-center justify-start gap-2">
      <div className="bg-gray-200 w-10 h-10 rounded-full" />
      <div className="bg-gray-200 w-10 h-10 rounded-full" />
    </div>
  </div>
);