function Impressum() {
  return (
    <section className="page page--legal">
      <article className="legal-card">
        <h1>Impressum</h1>
        <p>
          Dieses Projekt ist ein nicht-kommerzielles Ausbildungs- und
          Demonstrationsprojekt im Rahmen einer Webentwickler-Umschulung.
        </p>
        <p>
          <strong>Verantwortlich für den Inhalt dieser Seite:</strong>{' '}
          Privatperson (nur Testprojekt)
        </p>
        <p>Kontakt: Musteradresse oder E-Mail (optional)</p>
        <p>
          Diese Webseite dient ausschließlich Übungs- und Lernzwecken und
          verarbeitet keine echten personenbezogenen Daten. Alle Eingaben dienen
          nur der technischen Demonstration. Es findet keine Speicherung,
          Analyse oder Weitergabe von Daten statt.
        </p>

        <h2>Datenschutzhinweis</h2>
        <p>
          Dieses Projekt dient ausschließlich Ausbildungs- und Testzwecken. Es
          werden keine echten personenbezogenen Daten verarbeitet. Es werden
          keine Tracking-Tools, Analyse-Systeme oder externen CDNs genutzt.
        </p>
      </article>
    </section>
  );
}

export default Impressum;
