import { Link } from "react-router-dom";
import recipeJournalHero from "../assets/recipe-journal-hero.webp";

function Home({ isLoggedIn }) {
  const primaryAction = isLoggedIn
    ? { label: "Rezept erstellen", to: "/create" }
    : { label: "Rezepte entdecken", to: "/recipes" };
  const secondaryAction = isLoggedIn
    ? { label: "Meine Rezepte", to: "/my-recipes" }
    : { label: "Konto erstellen", to: "/register" };

  return (
    <section className="page home-page" aria-labelledby="home-title">
      <div className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Dein digitales Rezeptbuch</p>
          <h1 id="home-title">
            Eigene Rezepte sammeln. Neue entdecken.
          </h1>
          <p className="home-hero__description">
            Halte deine Lieblingsgerichte fest, verwalte deine persönliche
            Sammlung und entdecke, was andere kochen.
          </p>
          <div className="home-hero__buttons">
            <Link className="button" to={primaryAction.to}>
              {primaryAction.label}
            </Link>
            <Link className="button button--secondary" to={secondaryAction.to}>
              {secondaryAction.label}
            </Link>
          </div>
        </div>

        <div className="home-hero__media">
          <img className="home-hero__image" src={recipeJournalHero} alt="" />
        </div>
      </div>

      <section className="home-benefits" aria-labelledby="home-benefits-title">
        <header className="home-benefits__header">
          <h2 id="home-benefits-title">
            Rezepte sammeln, kochen und entdecken
          </h2>
          <p>
            Bewahre eigene Rezepte übersichtlich auf und lass dich von der
            öffentlichen Rezeptsammlung inspirieren.
          </p>
        </header>

        <div className="home-benefits__grid">
          <article className="home-benefit">
            <span className="home-benefit__label" aria-hidden="true">
              SAMMELN
            </span>
            <h3>Eigene Rezepte festhalten</h3>
            <p>
              Speichere Titel, Beschreibung, Zutaten und Zubereitungsschritte
              übersichtlich ab.
            </p>
          </article>
          <article className="home-benefit">
            <span className="home-benefit__label" aria-hidden="true">
              KOCHEN
            </span>
            <h3>Schritt für Schritt kochen</h3>
            <p>
              Ordne Zutaten und einzelne Arbeitsschritte so, dass dein Rezept
              leicht nachvollziehbar bleibt.
            </p>
          </article>
          <article className="home-benefit">
            <span className="home-benefit__label" aria-hidden="true">
              ENTDECKEN
            </span>
            <h3>Neue Rezepte entdecken</h3>
            <p>
              Lass dich von den Rezepten anderer inspirieren und entdecke neue
              Lieblingsgerichte.
            </p>
          </article>
        </div>
      </section>

    </section>
  );
}

export default Home;
