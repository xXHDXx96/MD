interface CaptchaBoxProps {
  captchaText: string;
  onRefresh: () => void;
}

export function CaptchaBox({ captchaText, onRefresh }: CaptchaBoxProps) {
  return (
    <div
      id="captchaContainer"
      className="captcha-container cursor-pointer select-none"
      onClick={onRefresh}
      title="Click to refresh captcha"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onRefresh();
        }
      }}
    >
      <div className="captcha-line line1"></div>
      <div className="captcha-line line2"></div>
      <div className="captcha-line line3"></div>
      <div className="noise-dot dot1"></div>
      <div className="noise-dot dot2"></div>
      <div className="noise-dot dot3"></div>
      <div className="noise-dot dot4"></div>
      <span className="captcha-text tracking-widest">{captchaText}</span>
    </div>
  );
}
