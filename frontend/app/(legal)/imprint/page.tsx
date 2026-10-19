import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Impressum",
}

export default function ImprintPage() {
  return (
    <article className="grid gap-8">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Impressum
      </h1>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">
          Angaben gemäß § 5 DDG
        </h2>
        <address className="grid gap-1 text-sm text-muted-foreground not-italic">
          <p>
            <strong className="text-foreground">Name:</strong> [Vorname Nachname]
          </p>
          <p>
            <strong className="text-foreground">Anschrift:</strong> [Straße
            Hausnummer], [PLZ Ort]
          </p>
          <p>
            <strong className="text-foreground">Telefon:</strong>{" "}
            <a href="tel:+490000000000" className="text-primary hover:underline">
              [Telefonnummer]
            </a>
          </p>
          <p>
            <strong className="text-foreground">E-Mail:</strong>{" "}
            <a
              href="mailto:kontakt@example.com"
              className="text-primary hover:underline"
            >
              [E-Mail-Adresse]
            </a>
          </p>
        </address>
      </section>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">
          Haftung für Links
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung
          für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten
          sind ausschließlich deren Betreiber verantwortlich.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">Hinweis</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Quizly ist ein Lernprojekt der Developer Akademie. Die Angaben in
          eckigen Klammern sind Platzhalter für die Daten des Betreibers.
        </p>
      </section>
    </article>
  )
}
