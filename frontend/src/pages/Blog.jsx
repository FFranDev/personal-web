import { useTranslation } from 'react-i18next';

function Home() {
  const [t] = useTranslation("global");

  return (
    <div className="window-pane">
      <h2>{t("header.blog")}</h2>
      <p>Sección de Blog en construcción...</p>
    </div>
  );
}

export default Home;