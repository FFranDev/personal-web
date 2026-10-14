import { useTranslation } from 'react-i18next';
import logoCream from '../../assets/logo_inverted.svg';
import './Footer.css';

function Footer() {
  const [t] = useTranslation("global");
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <img src={logoCream} alt="Footer Logo" className="footer-logo" />

      <div className="footer-content">
        <nav className="footer-links">
          <a href="https://www.linkedin.com/in/francisco-fern%C3%A1ndez-ugidos-aa687a384" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href="https://github.com/FFranDev" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="/FranciscoFernándezUgidos_CV.pdf" download>
            {t("footer.cv")}
          </a>
          <a 
            href="https://mail.google.com/mail/?view=cm&fs=1&to=franferug@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("footer.email")}
          </a>
        </nav>

        <div className="footer-copyright">
          <p>© {currentYear} Fran. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;