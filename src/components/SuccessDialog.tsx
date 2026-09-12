interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function SuccessDialog({
  isOpen,
  onClose,
  title = 'NOTICE',
  message = 'Your account Registration Success',
}: SuccessDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="van-overlay"
        style={{ zIndex: 2001 }}
        onClick={onClose}
        id="dialogOverlay"
      />
      <div
        role="dialog"
        tabIndex={0}
        className="van-dialog van-dialog--round-button singDialog"
        style={{ zIndex: 2006 }}
        aria-labelledby="NOTICE"
        id="successNoticeDialog"
      >
        <div className="van-dialog__header font-semibold text-[#090936] text-[18px] pb-2 border-b border-[#f7f7f7]">
          {title}
        </div>
        <div className="van-dialog__content py-6 px-4">
          <div className="van-dialog__message text-black text-[16px] font-normal leading-relaxed">
            {message}
          </div>
        </div>
        <div className="van-goods-action van-dialog__footer mt-2">
          <button
            id="confirmOk"
            type="button"
            onClick={onClose}
            className="van-button van-button--danger van-button--large van-goods-action-button van-dialog__confirm w-full bg-black text-white rounded-lg h-12 font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <div className="van-button__content">
              <span className="van-button__text text-[16px]">OK</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
