import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Datenschutz",
}

const SECTIONS = [
  {
    title: "Verantwortlicher",
    body: "Verantwortlich für die Datenverarbeitung ist der im Impressum genannte Betreiber. Die dort in eckigen Klammern stehenden Angaben sind Platzhalter.",
  },
  {
    title: "Konto",
    body: "Bei der Registrierung werden Benutzername, E-Mail-Adresse und ein Hash des Passworts gespeichert. Das Passwort selbst wird nicht gespeichert.",
  },
  {
    title: "Anmeldung und Cookies",
    body: "Nach der Anmeldung setzt der Server zwei technisch notwendige Cookies: access_token (15 Minuten gültig) und refresh_token (1 Tag gültig). Beide sind HttpOnly, also für Skripte auf der Seite nicht lesbar. Beim Abmelden werden sie gelöscht und das Refresh-Token wird gesperrt. Tracking- oder Werbe-Cookies setzt Quizly nicht.",
  },
  {
    title: "Lokaler Speicher im Browser",
    body: "Im localStorage deines Browsers liegen dein Benutzername und deine E-Mail-Adresse für die Anzeige sowie der Fortschritt laufender Quizze, damit du nach einem Neuladen weitermachen kannst. Diese Daten verlassen den Browser nicht. Du kannst sie jederzeit über die Browsereinstellungen löschen.",
  },
  {
    title: "Erstellung eines Quiz",
    body: "Wenn du einen YouTube-Link einreichst, lädt der Server die Tonspur des Videos herunter und wandelt sie lokal mit Whisper in Text um. Dieser Text wird an die Gemini-API von Google gesendet, die daraus Titel, Beschreibung und Fragen erstellt. Gespeichert werden der Link und das fertige Quiz, die Audiodatei wird danach gelöscht.",
  },
  {
    title: "Eingebettete Videos",
    body: "Auf der Detailseite eines Quiz wird das Video über youtube-nocookie.com eingebettet. Dabei stellt dein Browser eine Verbindung zu Servern von Google her. Für diese Verarbeitung gilt die Datenschutzerklärung von Google.",
  },
  {
    title: "Deine Rechte",
    body: "Du kannst Auskunft über deine gespeicherten Daten verlangen sowie ihre Berichtigung oder Löschung. Quizze kannst du selbst in der Bibliothek löschen. Für alles Weitere wende dich an die im Impressum genannte Adresse.",
  },
  {
    title: "Hinweis",
    body: "Quizly ist ein Lernprojekt. Dieser Text ersetzt keine rechtliche Beratung.",
  },
]

export default function PrivacyPage() {
  return (
    <article className="grid gap-8">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Datenschutzerklärung
      </h1>

      {SECTIONS.map((section) => (
        <section key={section.title} className="grid gap-3">
          <h2 className="font-heading text-lg font-semibold">
            {section.title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {section.body}
          </p>
        </section>
      ))}
    </article>
  )
}
