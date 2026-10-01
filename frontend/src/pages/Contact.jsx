import { useTranslation } from 'react-i18next';

function Home() {
  const [t] = useTranslation("global");

  return (
    <div className="window-pane">
      <h2>{t("header.contact")}</h2>
      <p>Sección de Contacto en construcción...</p>
    </div>
  );
}

export default Home;