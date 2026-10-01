import { useTranslation } from 'react-i18next';

function Home() {
  const [t] = useTranslation("global");

  return (
    <div className="window-pane" style={{ minHeight: "200vh" }}>
      <h2>{t("header.home")}</h2>
      <p>Sección de Presentación y CV en construcción...</p>
      
      <p style={{ marginTop: "150vh" }}>Has llegado al final de la página (TEMP)</p>
    </div>
  );
}

export default Home;