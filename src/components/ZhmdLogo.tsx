interface ZhmdLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ZhmdLogo({ className = '', size = 'lg' }: ZhmdLogoProps) {
  if (size === 'sm') {
    return (
      <div
        className={`inline-flex items-center justify-center bg-[#f5c518] text-black font-extrabold select-none px-2.5 py-0.5 text-lg rounded-[4px] tracking-tight ${className}`}
        style={{
          fontFamily: "Impact, 'Arial Black', -apple-system, BlinkMacSystemFont, sans-serif",
          letterSpacing: '0.5px',
        }}
        id="zhmdHeaderLogo"
      >
        ZHMD
      </div>
    );
  }

  if (size === 'md') {
    return (
      <div
        className={`inline-flex items-center justify-center bg-[#f5c518] text-black font-black select-none px-4 py-1 text-2xl rounded-[5px] tracking-tight ${className}`}
        style={{
          fontFamily: "Impact, 'Arial Black', -apple-system, BlinkMacSystemFont, sans-serif",
          letterSpacing: '0.8px',
        }}
      >
        ZHMD
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center bg-[#f5c518] text-black font-black select-none px-6 py-1.5 text-[34px] rounded-[6px] shadow-sm tracking-tight ${className}`}
      style={{
        fontFamily: "Impact, 'Arial Black', -apple-system, BlinkMacSystemFont, sans-serif",
        letterSpacing: '1.2px',
        lineHeight: 1.1,
      }}
      id="zhmdMainLogo"
    >
      ZHMD
    </div>
  );
}
