import { useTranslation } from 'react-i18next';

function App() {
  const [t, i18n] = useTranslation("global");

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="window" style={{ maxWidth: "500px", margin: "50px auto" }}>
      <div className="title-bar">
        <button aria-label="Close" className="close"></button>
        <h1 className="title">{t("header.title")}</h1>
        <button aria-label="Resize" className="resize"></button>
      </div>
      <div className="separator"></div>

      <div className="window-pane">
        <h2>{t("home.welcome")}</h2>
        <p>{t("home.description")}</p>

        <br />
        
        <div className="field-row">
          <button className="btn" onClick={() => changeLanguage("es")}>
            {t("buttons.switch_es")}
          </button>
          <button className="btn" onClick={() => changeLanguage("en")}>
            {t("buttons.switch_en")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;