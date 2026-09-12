import { AmazonFooterLogo } from './AmazonFooterLogo';

export function Footer() {
  return (
    <footer className="footer bg-black py-12 px-5 text-white" id="zhmdFooter">
      <div className="footer-container max-w-5xl mx-auto flex flex-col items-center">
        <div className="footer-links flex justify-center flex-wrap gap-x-6 gap-y-3 mb-3 text-center">
          <a
            href="https://help.imdb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#f5c518] text-[16px] font-medium transition-colors"
          >
            Help
          </a>
          <a
            href="https://pro.imdb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#f5c518] text-[16px] font-medium transition-colors"
          >
            ZHMDPro
          </a>
          <a
            href="https://www.boxofficemojo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#f5c518] text-[16px] font-medium transition-colors"
          >
            Box Office Mojo
          </a>
          <a
            href="https://developer.imdb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#f5c518] text-[16px] font-medium transition-colors"
          >
            License ZHMD Data
          </a>
          <a
            href="https://www.imdb.com/conditions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#f5c518] text-[16px] font-medium transition-colors"
          >
            Conditions of Use
          </a>
          <a
            href="https://www.imdb.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#f5c518] text-[16px] font-medium transition-colors"
          >
            Privacy Policy
          </a>
        </div>

        <AmazonFooterLogo />

        <div className="copyright text-[#9d9d9d] text-[15px] text-center mt-1">
          © 1990-2026 by ZHMD.com, Inc.
        </div>
      </div>
    </footer>
  );
}
