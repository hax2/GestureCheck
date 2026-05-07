(function () {
  const config = {
    manifestUrl: "all_rating_videos.json",
    assetBaseUrl: "assets/rating-videos/",
    submitUrl: "",
    submitMode: "cors",
    submitEachResponse: false,
    completionUrl: "",
    completionCode: "GESTURE-RATING-COMPLETE",
    minWatchRatio: 0.5,
    blockSize: 20,
    tutorialReferenceTitles: ["04_Ball.avi", "40_Telephone.avi"],
    ...window.SURVEY_CONFIG,
  };

  const languageParam = new URLSearchParams(window.location.search).get("lang");
  const currentLang = ["en", "de", "it"].includes(languageParam) ? languageParam : "en";

  const translations = {
    en: {
      ui: {
        pageTitle: "Gesture Rating Survey",
        introEyebrow: "Human Gesture Rating",
        introTitle: "Rate short gesture videos for vocabulary learning",
        introLede: "You will watch short videos and rate each gesture on seven 1-5 scales. Use the target word shown with each video as the intended meaning.",
        languageLabel: "Language",
        participantIdLabel: "Participant ID, optional",
        participantPlaceholder: "Enter your assigned participant ID, if you have one",
        notesLabel: "Notes for this session, optional",
        notesPlaceholder: "Optional notes",
        continueButton: "Continue to tutorial",
        introFinePrint: "Your progress is autosaved in this browser. Each completed video is submitted automatically when collection is configured.",
        referenceVideo: "Reference Video",
        watchRequirement: "Watch at least 50% of the video before continuing.",
        watchRequirementMet: "Watch requirement met.",
        replay: "Replay",
        descriptionLabel: "Briefly describe what the gesture shows, optional",
        descriptionPlaceholder: "Example: The actor points upward and traces a rectangular shape.",
        ambiguitiesLabel: "Ambiguities or comments, optional",
        ambiguitiesPlaceholder: "Anything unclear, culturally specific, or hard to interpret?",
        back: "Back",
        next: "Next",
        saveContinue: "Save and continue",
        finishSurvey: "Finish survey",
        startRating: "Start rating videos",
        tutorialStep: "Tutorial {current} of {total}",
        tutorialIntroTitle: "How the tutorial works",
        tutorialIntroBody: "The reference video stays visible during the tutorial. The same gesture can receive different ratings across categories. In the survey, always rate the visible gesture relative to the target word shown above the video.",
        exampleDescription: "Example description",
        exampleRating: "Example rating for this reference video: {score}/5",
        readyTitle: "Ready to rate",
        readyBody: "You will now rate your assigned videos. Watch at least 50% of each video, then answer all seven scales. Brief descriptions and comments are optional.",
        reminderLabel: "Reminder:",
        reminderText: "Use the target word as the semantic reference. Do not infer a different intended word.",
        referenceNotInBlock: "This tutorial video is not part of your assigned rating block.",
        pressPlay: "Press play if the video does not start automatically.",
        blockAssigned: "You are rating block {block}: videos {start}-{end} of {total}.",
        allVideosAssigned: "You are rating {count} videos.",
        doneEyebrow: "Complete",
        doneTitle: "Ratings captured",
        doneLede: "Export the results for analysis. If a collection endpoint is configured, responses are also submitted automatically.",
        videosRated: "videos rated",
        ratingDimensions: "rating dimensions",
        videoSet: "video set",
        all: "All",
        block: "Block",
        downloadCsv: "Download CSV",
        downloadJson: "Download JSON",
        submitResults: "Submit results",
        submittedAsYouGo: "Submitted as you go",
        noEndpoint: "No submission endpoint is configured. Use CSV or JSON download.",
        autoSubmitted: "Each saved video response is submitted automatically. Download CSV/JSON as a backup.",
        submitting: "Submitting...",
        submittedBackup: "Submitted. Download CSV/JSON as a backup if this is a pilot run.",
        completionStatus: "Submitted. Completion code: {code}",
        submitFailed: "Submission failed: {message}. Download CSV/JSON as backup.",
        savedLocalFailed: "Saved locally, but Sheet submission failed: {message}.",
        completeRatings: "Please complete all required ratings.",
        watchBeforeContinue: "Please watch at least 50% of the video before continuing.",
        returnToPlatform: "Return to study platform",
      },
      examples: {
        "04_Ball.avi": {
          description: "The gesture shows hands forming a spherical shape, followed by an upward and sideward throwing motion.",
          ratings: {
            iconicity: "The hands forming a spherical shape combined with a throwing motion provides a highly transparent visual representation of a ball and its typical use.",
            sensorimotor_imagery: "The gesture vividly simulates the physical sensation of holding a round object and the bodily action of throwing it.",
            motional_salience_gesture: "The gesture involves a clear, expansive movement of both arms across and away from the body, making it visually prominent.",
            emotional_salience_facial_expression: "The actor's facial expression remains neutral throughout the gesture, conveying no affective meaning.",
            gesture_complexity_fit: "The movement is straightforward and perfectly balances simplicity with clear semantic meaning, making it optimal for learning.",
            cultural_familiarity: "The pantomime of holding and throwing a ball is a highly recognizable and universally understood action in Western cultures.",
            enactment_potential: "The throwing motion is very natural, requires no special coordination, and is effortless for learners to reproduce.",
          },
        },
        "40_Telephone.avi": {
          description: "The gesture shows a hand raised to the ear, with thumb near the ear and pinky near the mouth, mimicking a telephone receiver.",
          ratings: {
            iconicity: "The hand shape and position closely match the semantics of holding and using a telephone.",
            sensorimotor_imagery: "The gesture directly simulates the physical action and bodily experience of holding a phone to one's ear to listen and speak.",
            motional_salience_gesture: "The movement is relatively subtle and constrained, involving a simple raising of the hand to the head without expansive dynamics.",
            emotional_salience_facial_expression: "The actor maintains a neutral facial expression throughout the gesture.",
            gesture_complexity_fit: "The gesture is extremely simple, direct, and perfectly balances informativeness with ease of understanding.",
            cultural_familiarity: "This specific hand shape and movement is a highly familiar and widely used emblem for a telephone in Western cultures.",
            enactment_potential: "The gesture is very natural, requires minimal effort, and is effortless for learners to reproduce.",
          },
        },
      },
      categories: [
        ["iconicity", "Iconicity", "The degree to which the gesture visually resembles the semantics of the target word.", "1 = no visual relationship", "5 = highly transparent visual representation", ["no visual relationship to the semantics", "very weak resemblance", "moderate resemblance", "clear iconic relationship", "highly transparent visual representation of semantics"]],
        ["sensorimotor_imagery", "Sensorimotor Imagery", "The extent to which the gesture evokes bodily actions, physical interactions, or perceptual experiences related to the word's semantics.", "1 = no sensorimotor component", "5 = vivid action or bodily experience", ["no sensorimotor component", "weak bodily or action-related element", "moderate simulation of action or experience", "strong sensorimotor imagery", "very vivid action or bodily experience representation"]],
        ["motional_salience_gesture", "Motional Salience", "Motional salience captures how strongly a gesture stands out based on its movement features, such as large, fast, or complex actions, thereby guiding attention and supporting encoding.", "1 = subtle/minimal movement", "5 = visually commanding gesture", ["subtle, constrained, or minimal movement", "slight or slow movement dynamics", "moderate movement in size, speed, or complexity", "clear, pronounced, and expansive or rapid movement", "highly prominent, and visually commanding gesture"]],
        ["emotional_salience_facial_expression", "Emotional Salience, Facial Expression", "The extent to which facial expressions accompanying the gesture communicate affective meaning.", "1 = neutral/no expression", "5 = very strong facial expression", ["no facial expression or neutral face", "weak emotional cue", "moderate emotional cue", "clear facial emotional signal", "very strong and meaningful facial expression"]],
        ["gesture_complexity_fit", "Gesture Complexity Fit", "The degree to which the gesture's motor and cognitive complexity is appropriate for the learning context.", "1 = too complex/confusing", "5 = optimal balance", ["too complex or confusing", "somewhat difficult or overloaded", "moderate complexity", "well balanced complexity", "optimal balance of informativeness and simplicity"]],
        ["cultural_familiarity", "Cultural Familiarity", "The degree to which a gesture is readily recognized and interpreted based on shared sociocultural conventions and prior experience in Western cultural contexts.", "1 = completely unfamiliar", "5 = highly familiar or widely used", ["completely unfamiliar gesture", "rare or unusual gesture", "somewhat recognizable", "common gesture", "highly familiar or widely used gesture"]],
        ["enactment_potential", "Enactment Potential", "How easily learners can reproduce the gesture themselves.", "1 = very difficult", "5 = natural and effortless", ["very difficult to reproduce", "difficult for many learners", "moderate difficulty", "easy to reproduce", "very natural and effortless to enact"]],
      ],
    },
  };

  translations.de = {
    ui: {
      ...translations.en.ui,
      pageTitle: "Gesten-Bewertungsstudie",
      introEyebrow: "Menschliche Gestenbewertung",
      introTitle: "Bewerten Sie kurze Gestenvideos zum Vokabellernen",
      introLede: "Sie sehen kurze Videos und bewerten jede Geste auf sieben Skalen von 1 bis 5. Verwenden Sie das angezeigte Zielwort als gemeinte Bedeutung.",
      languageLabel: "Sprache",
      participantIdLabel: "Teilnehmer-ID, optional",
      participantPlaceholder: "Geben Sie Ihre Teilnehmer-ID ein, falls vorhanden",
      notesLabel: "Notizen zu dieser Sitzung, optional",
      notesPlaceholder: "Optionale Notizen",
      continueButton: "Weiter zum Tutorial",
      introFinePrint: "Ihr Fortschritt wird in diesem Browser automatisch gespeichert. Jedes abgeschlossene Video wird automatisch übermittelt, wenn die Erfassung eingerichtet ist.",
      referenceVideo: "Referenzvideo",
      watchRequirement: "Sehen Sie mindestens 50 % des Videos an, bevor Sie fortfahren.",
      watchRequirementMet: "Anforderung erfüllt.",
      replay: "Erneut abspielen",
      descriptionLabel: "Kurze Beschreibung der Geste, optional",
      descriptionPlaceholder: "Beispiel: Die Person zeigt nach oben und zeichnet eine rechteckige Form.",
      ambiguitiesLabel: "Unklarheiten oder Kommentare, optional",
      ambiguitiesPlaceholder: "War etwas unklar, kulturspezifisch oder schwer zu interpretieren?",
      back: "Zurück",
      next: "Weiter",
      saveContinue: "Speichern und weiter",
      finishSurvey: "Studie abschließen",
      startRating: "Videos bewerten",
      tutorialStep: "Tutorial {current} von {total}",
      tutorialIntroTitle: "So funktioniert das Tutorial",
      tutorialIntroBody: "Das Referenzvideo bleibt während des Tutorials sichtbar. Dieselbe Geste kann je nach Kategorie unterschiedliche Bewertungen erhalten. Bewerten Sie in der Studie immer die sichtbare Geste bezogen auf das Zielwort über dem Video.",
      exampleDescription: "Beispielbeschreibung",
      exampleRating: "Beispielbewertung für dieses Referenzvideo: {score}/5",
      readyTitle: "Bereit zum Bewerten",
      readyBody: "Sie bewerten nun die Ihnen zugewiesenen Videos. Sehen Sie mindestens 50 % jedes Videos an und beantworten Sie dann alle sieben Skalen. Kurze Beschreibungen und Kommentare sind optional.",
      reminderLabel: "Hinweis:",
      reminderText: "Verwenden Sie das Zielwort als semantische Referenz. Leiten Sie kein anderes gemeintes Wort ab.",
      referenceNotInBlock: "Dieses Tutorialvideo gehört nicht zu Ihrem Bewertungsblock.",
      pressPlay: "Drücken Sie Play, falls das Video nicht automatisch startet.",
      blockAssigned: "Sie bewerten Block {block}: Videos {start}-{end} von {total}.",
      allVideosAssigned: "Sie bewerten {count} Videos.",
      doneEyebrow: "Fertig",
      doneTitle: "Bewertungen erfasst",
      doneLede: "Exportieren Sie die Ergebnisse für die Analyse. Wenn eine Erfassungsstelle eingerichtet ist, werden Antworten auch automatisch übermittelt.",
      videosRated: "Videos bewertet",
      ratingDimensions: "Bewertungsdimensionen",
      videoSet: "Videoset",
      all: "Alle",
      block: "Block",
      downloadCsv: "CSV herunterladen",
      downloadJson: "JSON herunterladen",
      submitResults: "Ergebnisse senden",
      submittedAsYouGo: "Laufend übermittelt",
      noEndpoint: "Es ist keine Übermittlungsstelle eingerichtet. Verwenden Sie den CSV- oder JSON-Download.",
      autoSubmitted: "Jede gespeicherte Videobewertung wird automatisch übermittelt. Laden Sie CSV/JSON als Sicherung herunter.",
      submitting: "Wird gesendet...",
      submittedBackup: "Gesendet. Laden Sie CSV/JSON als Sicherung herunter, falls dies ein Pilotlauf ist.",
      completionStatus: "Gesendet. Abschlusscode: {code}",
      submitFailed: "Übermittlung fehlgeschlagen: {message}. Laden Sie CSV/JSON als Sicherung herunter.",
      savedLocalFailed: "Lokal gespeichert, aber die Übermittlung an die Tabelle ist fehlgeschlagen: {message}.",
      completeRatings: "Bitte füllen Sie alle erforderlichen Bewertungen aus.",
      watchBeforeContinue: "Bitte sehen Sie mindestens 50 % des Videos an, bevor Sie fortfahren.",
      returnToPlatform: "Zur Studienplattform zurückkehren",
    },
    examples: {
      "04_Ball.avi": {
        description: "Die Geste zeigt Hände, die eine kugelförmige Form bilden, gefolgt von einer Bewegung nach oben und zur Seite wie beim Werfen.",
        ratings: {
          iconicity: "Die kugelförmige Handform zusammen mit der Wurfbewegung stellt einen Ball und seine typische Nutzung sehr deutlich dar.",
          sensorimotor_imagery: "Die Geste simuliert sehr anschaulich das körperliche Gefühl, einen runden Gegenstand zu halten und ihn zu werfen.",
          motional_salience_gesture: "Die Bewegung nutzt beide Arme und ist deutlich und ausgreifend, daher fällt sie visuell gut auf.",
          emotional_salience_facial_expression: "Der Gesichtsausdruck bleibt neutral und vermittelt keine affektive Bedeutung.",
          gesture_complexity_fit: "Die Bewegung ist unkompliziert und verbindet klare Bedeutung mit Einfachheit.",
          cultural_familiarity: "Das pantomimische Halten und Werfen eines Balls ist in westlichen Kontexten gut erkennbar.",
          enactment_potential: "Die Wurfbewegung ist natürlich, erfordert keine besondere Koordination und ist leicht nachzumachen.",
        },
      },
      "40_Telephone.avi": {
        description: "Die Geste zeigt eine Hand am Ohr, mit Daumen nahe am Ohr und kleinem Finger nahe am Mund, wie bei einem Telefonhörer.",
        ratings: {
          iconicity: "Handform und Position passen gut zur Bedeutung, ein Telefon zu halten und zu benutzen.",
          sensorimotor_imagery: "Die Geste simuliert direkt die körperliche Handlung, ein Telefon ans Ohr zu halten, um zu hören und zu sprechen.",
          motional_salience_gesture: "Die Bewegung ist eher dezent und begrenzt, da nur die Hand zum Kopf geführt wird.",
          emotional_salience_facial_expression: "Der Gesichtsausdruck bleibt neutral.",
          gesture_complexity_fit: "Die Geste ist sehr einfach, direkt und gut verständlich.",
          cultural_familiarity: "Diese Handform ist in westlichen Kontexten ein sehr bekanntes Zeichen für Telefon.",
          enactment_potential: "Die Geste ist natürlich, erfordert wenig Aufwand und ist leicht nachzumachen.",
        },
      },
    },
    categories: [
      ["iconicity", "Ikonizität", "Das Ausmaß, in dem die Geste die Semantik des Zielworts visuell abbildet.", "1 = keine visuelle Beziehung", "5 = sehr transparente visuelle Darstellung", ["keine visuelle Beziehung zur Semantik", "sehr schwache Ähnlichkeit", "mittlere Ähnlichkeit", "klare ikonische Beziehung", "sehr transparente visuelle Darstellung der Semantik"]],
      ["sensorimotor_imagery", "Sensomotorische Vorstellung", "Das Ausmaß, in dem die Geste körperliche Handlungen, physische Interaktionen oder Wahrnehmungserfahrungen zur Wortsemantik hervorruft.", "1 = keine sensomotorische Komponente", "5 = sehr lebendige Handlung/Körpererfahrung", ["keine sensomotorische Komponente", "schwaches körper- oder handlungsbezogenes Element", "mittlere Simulation von Handlung oder Erfahrung", "starke sensomotorische Vorstellung", "sehr lebendige Darstellung von Handlung oder Körpererfahrung"]],
      ["motional_salience_gesture", "Bewegungssalienz", "Wie stark eine Geste durch Bewegungsmerkmale wie Größe, Geschwindigkeit oder Komplexität auffällt und Aufmerksamkeit lenkt.", "1 = subtile/minimale Bewegung", "5 = visuell sehr auffällige Geste", ["subtile, begrenzte oder minimale Bewegung", "leichte oder langsame Bewegungsdynamik", "mittlere Bewegung in Größe, Geschwindigkeit oder Komplexität", "klare, ausgeprägte und ausgreifende oder schnelle Bewegung", "sehr prominente und visuell dominante Geste"]],
      ["emotional_salience_facial_expression", "Emotionale Salienz, Gesichtsausdruck", "Das Ausmaß, in dem begleitende Gesichtsausdrücke affektive Bedeutung vermitteln.", "1 = neutral/kein Ausdruck", "5 = sehr starker Gesichtsausdruck", ["kein Gesichtsausdruck oder neutrales Gesicht", "schwacher emotionaler Hinweis", "mittlerer emotionaler Hinweis", "klares emotionales Signal im Gesicht", "sehr starker und bedeutungsvoller Gesichtsausdruck"]],
      ["gesture_complexity_fit", "Passung der Gestenkomplexität", "Das Ausmaß, in dem motorische und kognitive Komplexität der Geste zum Lernkontext passt.", "1 = zu komplex/verwirrend", "5 = optimale Balance", ["zu komplex oder verwirrend", "etwas schwierig oder überladen", "mittlere Komplexität", "gut ausbalancierte Komplexität", "optimale Balance aus Informationsgehalt und Einfachheit"]],
      ["cultural_familiarity", "Kulturelle Vertrautheit", "Das Ausmaß, in dem eine Geste in westlichen kulturellen Kontexten aufgrund gemeinsamer Konventionen und Erfahrungen erkannt und interpretiert wird.", "1 = völlig unbekannt", "5 = sehr vertraut oder weit verbreitet", ["völlig unbekannte Geste", "seltene oder ungewöhnliche Geste", "etwas erkennbar", "häufige Geste", "sehr vertraute oder weit verbreitete Geste"]],
      ["enactment_potential", "Nachahmbarkeit", "Wie leicht Lernende die Geste selbst reproduzieren können.", "1 = sehr schwierig", "5 = natürlich und mühelos", ["sehr schwierig zu reproduzieren", "für viele Lernende schwierig", "mittlere Schwierigkeit", "leicht zu reproduzieren", "sehr natürlich und mühelos auszuführen"]],
    ],
  };

  translations.it = {
    ui: {
      ...translations.en.ui,
      pageTitle: "Sondaggio di valutazione dei gesti",
      introEyebrow: "Valutazione umana dei gesti",
      introTitle: "Valuta brevi video di gesti per l'apprendimento del vocabolario",
      introLede: "Guarderai brevi video e valuterai ogni gesto su sette scale da 1 a 5. Usa la parola target mostrata come significato previsto.",
      languageLabel: "Lingua",
      participantIdLabel: "ID partecipante, facoltativo",
      participantPlaceholder: "Inserisci il tuo ID partecipante, se ne hai uno",
      notesLabel: "Note per questa sessione, facoltative",
      notesPlaceholder: "Note facoltative",
      continueButton: "Continua al tutorial",
      introFinePrint: "I tuoi progressi vengono salvati automaticamente in questo browser. Ogni video completato viene inviato automaticamente se la raccolta è configurata.",
      referenceVideo: "Video di riferimento",
      watchRequirement: "Guarda almeno il 50% del video prima di continuare.",
      watchRequirementMet: "Requisito di visione soddisfatto.",
      replay: "Rivedi",
      descriptionLabel: "Descrivi brevemente cosa mostra il gesto, facoltativo",
      descriptionPlaceholder: "Esempio: la persona indica verso l'alto e traccia una forma rettangolare.",
      ambiguitiesLabel: "Ambiguità o commenti, facoltativi",
      ambiguitiesPlaceholder: "Qualcosa era poco chiaro, culturalmente specifico o difficile da interpretare?",
      back: "Indietro",
      next: "Avanti",
      saveContinue: "Salva e continua",
      finishSurvey: "Termina il sondaggio",
      startRating: "Inizia a valutare i video",
      tutorialStep: "Tutorial {current} di {total}",
      tutorialIntroTitle: "Come funziona il tutorial",
      tutorialIntroBody: "Il video di riferimento rimane visibile durante il tutorial. Lo stesso gesto può ricevere valutazioni diverse a seconda della categoria. Nel sondaggio valuta sempre il gesto visibile rispetto alla parola target mostrata sopra il video.",
      exampleDescription: "Descrizione di esempio",
      exampleRating: "Valutazione di esempio per questo video di riferimento: {score}/5",
      readyTitle: "Pronto per valutare",
      readyBody: "Ora valuterai i video assegnati. Guarda almeno il 50% di ogni video, poi rispondi a tutte e sette le scale. Brevi descrizioni e commenti sono facoltativi.",
      reminderLabel: "Promemoria:",
      reminderText: "Usa la parola target come riferimento semantico. Non dedurre un'altra parola prevista.",
      referenceNotInBlock: "Questo video tutorial non fa parte del tuo blocco di valutazione.",
      pressPlay: "Premi play se il video non parte automaticamente.",
      blockAssigned: "Stai valutando il blocco {block}: video {start}-{end} di {total}.",
      allVideosAssigned: "Stai valutando {count} video.",
      doneEyebrow: "Completato",
      doneTitle: "Valutazioni registrate",
      doneLede: "Esporta i risultati per l'analisi. Se è configurato un endpoint di raccolta, le risposte vengono anche inviate automaticamente.",
      videosRated: "video valutati",
      ratingDimensions: "dimensioni di valutazione",
      videoSet: "set di video",
      all: "Tutti",
      block: "Blocco",
      downloadCsv: "Scarica CSV",
      downloadJson: "Scarica JSON",
      submitResults: "Invia risultati",
      submittedAsYouGo: "Inviato man mano",
      noEndpoint: "Nessun endpoint di invio è configurato. Usa il download CSV o JSON.",
      autoSubmitted: "Ogni risposta salvata viene inviata automaticamente. Scarica CSV/JSON come backup.",
      submitting: "Invio in corso...",
      submittedBackup: "Inviato. Scarica CSV/JSON come backup se questo è un test pilota.",
      completionStatus: "Inviato. Codice di completamento: {code}",
      submitFailed: "Invio non riuscito: {message}. Scarica CSV/JSON come backup.",
      savedLocalFailed: "Salvato localmente, ma l'invio al foglio non è riuscito: {message}.",
      completeRatings: "Completa tutte le valutazioni richieste.",
      watchBeforeContinue: "Guarda almeno il 50% del video prima di continuare.",
      returnToPlatform: "Torna alla piattaforma dello studio",
    },
    examples: {
      "04_Ball.avi": {
        description: "Il gesto mostra le mani che formano una sfera, seguite da un movimento verso l'alto e di lato come un lancio.",
        ratings: {
          iconicity: "La forma sferica creata con le mani insieme al movimento di lancio rappresenta chiaramente una palla e il suo uso tipico.",
          sensorimotor_imagery: "Il gesto simula vividamente la sensazione fisica di tenere un oggetto rotondo e l'azione corporea di lanciarlo.",
          motional_salience_gesture: "Il gesto usa entrambe le braccia con un movimento ampio e chiaro, quindi è visivamente saliente.",
          emotional_salience_facial_expression: "L'espressione facciale rimane neutra e non comunica significato affettivo.",
          gesture_complexity_fit: "Il movimento è semplice e bilancia bene chiarezza semantica e semplicità.",
          cultural_familiarity: "La pantomima di tenere e lanciare una palla è riconoscibile nei contesti occidentali.",
          enactment_potential: "Il movimento di lancio è naturale, non richiede coordinazione speciale ed è facile da riprodurre.",
        },
      },
      "40_Telephone.avi": {
        description: "Il gesto mostra una mano all'orecchio, con il pollice vicino all'orecchio e il mignolo vicino alla bocca, come una cornetta telefonica.",
        ratings: {
          iconicity: "La forma e la posizione della mano corrispondono bene alla semantica di tenere e usare un telefono.",
          sensorimotor_imagery: "Il gesto simula direttamente l'azione fisica di tenere un telefono all'orecchio per ascoltare e parlare.",
          motional_salience_gesture: "Il movimento è relativamente sottile e limitato, con la mano che si alza verso la testa.",
          emotional_salience_facial_expression: "L'attore mantiene un'espressione facciale neutra.",
          gesture_complexity_fit: "Il gesto è molto semplice, diretto e facile da capire.",
          cultural_familiarity: "Questa forma della mano è un segno molto familiare per il telefono nei contesti occidentali.",
          enactment_potential: "Il gesto è naturale, richiede poco sforzo ed è facile da riprodurre.",
        },
      },
    },
    categories: [
      ["iconicity", "Iconicità", "Il grado in cui il gesto assomiglia visivamente alla semantica della parola target.", "1 = nessuna relazione visiva", "5 = rappresentazione visiva molto trasparente", ["nessuna relazione visiva con la semantica", "somiglianza molto debole", "somiglianza moderata", "chiara relazione iconica", "rappresentazione visiva molto trasparente della semantica"]],
      ["sensorimotor_imagery", "Immaginazione sensomotoria", "Quanto il gesto evoca azioni corporee, interazioni fisiche o esperienze percettive legate alla semantica della parola.", "1 = nessuna componente sensomotoria", "5 = esperienza corporea molto vivida", ["nessuna componente sensomotoria", "debole elemento corporeo o legato all'azione", "simulazione moderata di azione o esperienza", "forte immaginazione sensomotoria", "rappresentazione molto vivida di azione o esperienza corporea"]],
      ["motional_salience_gesture", "Salienza del movimento", "Quanto il gesto risalta per le sue caratteristiche di movimento, come ampiezza, velocità o complessità, guidando l'attenzione.", "1 = movimento sottile/minimo", "5 = gesto visivamente dominante", ["movimento sottile, limitato o minimo", "dinamica leggera o lenta", "movimento moderato per ampiezza, velocità o complessità", "movimento chiaro, pronunciato, ampio o rapido", "gesto molto prominente e visivamente dominante"]],
      ["emotional_salience_facial_expression", "Salienza emotiva, espressione facciale", "Quanto le espressioni facciali che accompagnano il gesto comunicano significato affettivo.", "1 = neutro/nessuna espressione", "5 = espressione facciale molto forte", ["nessuna espressione facciale o volto neutro", "debole indizio emotivo", "indizio emotivo moderato", "chiaro segnale emotivo facciale", "espressione facciale molto forte e significativa"]],
      ["gesture_complexity_fit", "Adeguatezza della complessità", "Quanto la complessità motoria e cognitiva del gesto è appropriata al contesto di apprendimento.", "1 = troppo complesso/confuso", "5 = equilibrio ottimale", ["troppo complesso o confuso", "un po' difficile o sovraccarico", "complessità moderata", "complessità ben bilanciata", "equilibrio ottimale tra informatività e semplicità"]],
      ["cultural_familiarity", "Familiarità culturale", "Il grado in cui un gesto è riconosciuto e interpretato in contesti culturali occidentali sulla base di convenzioni ed esperienze condivise.", "1 = completamente sconosciuto", "5 = molto familiare o diffuso", ["gesto completamente sconosciuto", "gesto raro o insolito", "abbastanza riconoscibile", "gesto comune", "gesto molto familiare o ampiamente usato"]],
      ["enactment_potential", "Potenziale di esecuzione", "Quanto facilmente gli studenti possono riprodurre il gesto.", "1 = molto difficile", "5 = naturale e senza sforzo", ["molto difficile da riprodurre", "difficile per molti studenti", "difficoltà moderata", "facile da riprodurre", "molto naturale e senza sforzo da eseguire"]],
    ],
  };

  const copy = translations[currentLang] || translations.en;
  const ui = copy.ui;
  const categories = copy.categories.map(([key, label, definition, low, high, anchors]) => ({
    key,
    label,
    definition,
    low,
    high,
    anchors,
  }));

  const tutorialExamples = Object.fromEntries(
    Object.entries(copy.examples).map(([title, example]) => [
      title,
      {
        description: example.description,
        ratings: Object.fromEntries(
          Object.entries(example.ratings).map(([key, rationale]) => [
            key,
            {
              score: translations.en.examples[title].ratings[key] ? tutorialScore(title, key) : "-",
              rationale,
            },
          ]),
        ),
      },
    ]),
  );

  function tutorialScore(title, key) {
    const scores = {
      "04_Ball.avi": {
        iconicity: 5,
        sensorimotor_imagery: 5,
        motional_salience_gesture: 4,
        emotional_salience_facial_expression: 1,
        gesture_complexity_fit: 5,
        cultural_familiarity: 5,
        enactment_potential: 5,
      },
      "40_Telephone.avi": {
        iconicity: 5,
        sensorimotor_imagery: 5,
        motional_salience_gesture: 2,
        emotional_salience_facial_expression: 1,
        gesture_complexity_fit: 5,
        cultural_familiarity: 5,
        enactment_potential: 5,
      },
    };
    return scores[title]?.[key] || "-";
  }

  const state = {
    participant: {},
    videos: [],
    order: [],
    index: 0,
    responses: {},
    block: null,
    totalVideos: 0,
    fullManifest: [],
    tutorialIndex: 0,
    tutorialReference: null,
    currentWatchSeconds: 0,
    currentMaxTime: 0,
    videoStartedAt: 0,
    sessionStartedAt: new Date().toISOString(),
  };

  const $ = (id) => document.getElementById(id);
  const introScreen = $("introScreen");
  const tutorialScreen = $("tutorialScreen");
  const ratingScreen = $("ratingScreen");
  const doneScreen = $("doneScreen");
  const introEyebrow = $("introEyebrow");
  const introTitle = $("introTitle");
  const introLede = $("introLede");
  const languageLabel = $("languageLabel");
  const languageSelect = $("languageSelect");
  const participantIdLabel = $("participantIdLabel");
  const sessionNotesLabel = $("sessionNotesLabel");
  const continueButton = $("continueButton");
  const introFinePrint = $("introFinePrint");
  const participantForm = $("participantForm");
  const participantId = $("participantId");
  const sessionNotes = $("sessionNotes");
  const blockSummary = $("blockSummary");
  const tutorialStepText = $("tutorialStepText");
  const tutorialPanel = $("tutorialPanel");
  const tutorialVideo = $("tutorialVideo");
  const tutorialVideoTitle = $("tutorialVideoTitle");
  const tutorialVideoDescription = $("tutorialVideoDescription");
  const referenceVideoLabel = $("referenceVideoLabel");
  const tutorialBackButton = $("tutorialBackButton");
  const tutorialNextButton = $("tutorialNextButton");
  const progressText = $("progressText");
  const progressBar = $("progressBar");
  const targetWord = $("targetWord");
  const videoTitle = $("videoTitle");
  const videoPlayer = $("videoPlayer");
  const watchStatus = $("watchStatus");
  const replayButton = $("replayButton");
  const ratingForm = $("ratingForm");
  const rubricGrid = $("rubricGrid");
  const gestureDescriptionLabel = $("gestureDescriptionLabel");
  const gestureDescription = $("gestureDescription");
  const ambiguitiesLabel = $("ambiguitiesLabel");
  const ambiguities = $("ambiguities");
  const formWarning = $("formWarning");
  const backButton = $("backButton");
  const nextButton = $("nextButton");
  const summaryStats = $("summaryStats");
  const downloadCsvButton = $("downloadCsvButton");
  const downloadJsonButton = $("downloadJsonButton");
  const submitButton = $("submitButton");
  const submitStatus = $("submitStatus");
  const completionLink = $("completionLink");
  const doneEyebrow = $("doneEyebrow");
  const doneTitle = $("doneTitle");
  const doneLede = $("doneLede");

  function query() {
    return new URLSearchParams(window.location.search);
  }

  function format(text, values = {}) {
    return text.replaceAll(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
  }

  function setText(node, text) {
    if (node) node.textContent = text;
  }

  function applyLanguage() {
    document.documentElement.lang = currentLang;
    document.title = ui.pageTitle;
    if (languageSelect) languageSelect.value = currentLang;
    setText(introEyebrow, ui.introEyebrow);
    setText(introTitle, ui.introTitle);
    setText(introLede, ui.introLede);
    setText(languageLabel, ui.languageLabel);
    setText(participantIdLabel, ui.participantIdLabel);
    setText(sessionNotesLabel, ui.notesLabel);
    setText(continueButton, ui.continueButton);
    setText(introFinePrint, ui.introFinePrint);
    setText(referenceVideoLabel, ui.referenceVideo);
    setText(replayButton, ui.replay);
    setText(gestureDescriptionLabel, ui.descriptionLabel);
    setText(ambiguitiesLabel, ui.ambiguitiesLabel);
    setText(backButton, ui.back);
    setText(downloadCsvButton, ui.downloadCsv);
    setText(downloadJsonButton, ui.downloadJson);
    setText(submitButton, ui.submitResults);
    setText(doneEyebrow, ui.doneEyebrow);
    setText(doneTitle, ui.doneTitle);
    setText(doneLede, ui.doneLede);
    if (completionLink) completionLink.textContent = ui.returnToPlatform;
    participantId.placeholder = ui.participantPlaceholder;
    sessionNotes.placeholder = ui.notesPlaceholder;
    gestureDescription.placeholder = ui.descriptionPlaceholder;
    ambiguities.placeholder = ui.ambiguitiesPlaceholder;
    watchStatus.textContent = ui.watchRequirement;
  }

  function storageKey() {
    const pid = state.participant.participantId || "anonymous";
    const block = state.block ? `block-${state.block}` : "all";
    return `gesture-rating-survey:${pid}:${block}`;
  }

  function slug(title) {
    return title
      .replace(/\.[^.]+$/, "")
      .replace(/\.mov$/i, "")
      .replace(/[^A-Za-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function videoUrl(item) {
    if (item.video_url) return item.video_url;
    if (item.video) return item.video;
    if (item.github_pages_path) return item.github_pages_path;
    return `${config.assetBaseUrl}${slug(item.title)}.mp4`;
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function seededRandom(seed) {
    let value = seed || 1;
    return function () {
      value += 0x6d2b79f5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffledIndexes(length, seedText) {
    const indexes = Array.from({ length }, (_, index) => index);
    if (query().get("order") === "fixed") return indexes;
    const random = seededRandom(hashString(seedText));
    for (let i = indexes.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }
    return indexes;
  }

  function show(screen) {
    [introScreen, tutorialScreen, ratingScreen, doneScreen].forEach((node) => node.classList.add("hidden"));
    screen.classList.remove("hidden");
  }

  function tutorialSteps() {
    return [
      {
        type: "intro",
        title: ui.tutorialIntroTitle,
        body: ui.tutorialIntroBody,
      },
      ...categories.map((category, index) => ({
        type: "category",
        index,
        category,
      })),
      {
        type: "ready",
        title: ui.readyTitle,
        body: ui.readyBody,
      },
    ];
  }

  function renderTutorial() {
    const steps = tutorialSteps();
    const step = steps[state.tutorialIndex];
    tutorialStepText.textContent = format(ui.tutorialStep, { current: state.tutorialIndex + 1, total: steps.length });
    tutorialBackButton.disabled = state.tutorialIndex === 0;
    tutorialNextButton.textContent = state.tutorialIndex === steps.length - 1 ? ui.startRating : ui.next;

    if (step.type === "intro") {
      const example = tutorialExample();
      tutorialPanel.innerHTML = `
        <div class="tutorial-copy">
          <h1>${step.title}</h1>
          <p>${step.body}</p>
          <div class="example-box">
            <strong>${ui.exampleDescription}</strong>
            <p>${example.description}</p>
          </div>
        </div>
      `;
      return;
    }

    if (step.type === "ready") {
      tutorialPanel.innerHTML = `
        <div class="tutorial-single">
          <h1>${step.title}</h1>
          <p class="lede">${step.body}</p>
          <div class="tutorial-ready-note">
            <strong>${ui.reminderLabel}</strong>
            ${ui.reminderText}
          </div>
        </div>
      `;
      return;
    }

    const category = step.category;
    const example = tutorialExample().ratings[category.key];
    tutorialPanel.innerHTML = `
      <article class="tutorial-category single-step">
        <div class="tutorial-number">${step.index + 1}</div>
        <div>
          <h1>${category.label}</h1>
          <p class="tutorial-definition">${category.definition}</p>
          <ol class="anchor-list">
            ${category.anchors.map((anchor) => `<li>${anchor}</li>`).join("")}
          </ol>
          <div class="example-box">
            <strong>${format(ui.exampleRating, { score: example.score })}</strong>
            <p>${example.rationale}</p>
          </div>
        </div>
      </article>
    `;
  }

  function tutorialExample() {
    return tutorialExamples[state.tutorialReference?.title] || {
      description: ui.reminderText,
      ratings: Object.fromEntries(categories.map((category) => [category.key, { score: "-", rationale: ui.reminderText }])),
    };
  }

  function renderTutorialReferenceVideo() {
    const item = state.tutorialReference;
    if (!item) return;
    const example = tutorialExample();
    tutorialVideoTitle.textContent = `${item.target_word || item.title}`;
    tutorialVideoDescription.textContent = ui.referenceNotInBlock;
    if (tutorialVideo.src !== new URL(videoUrl(item), window.location.href).href) {
      tutorialVideo.src = videoUrl(item);
      tutorialVideo.load();
    }
    tutorialVideo.play().catch(() => {
      tutorialVideoDescription.textContent = `${example.description} ${ui.pressPlay}`;
    });
  }

  function blockForIndex(index, blockSize) {
    return Math.floor(index / blockSize) + 1;
  }

  function pickTutorialReference(fullManifest, assignedBlock, blockSize) {
    const references = config.tutorialReferenceTitles
      .map((title) => {
        const index = fullManifest.findIndex((item) => item.title === title);
        return index >= 0 ? { item: fullManifest[index], block: blockForIndex(index, blockSize) } : null;
      })
      .filter(Boolean);

    const usable = references.find((reference) => !assignedBlock || reference.block !== assignedBlock);
    if (usable) return usable.item;

    return fullManifest.find((item, index) => !assignedBlock || blockForIndex(index, blockSize) !== assignedBlock) || fullManifest[0];
  }

  function renderRubric() {
    rubricGrid.innerHTML = "";
    categories.forEach((category) => {
      const card = document.createElement("article");
      card.className = "rubric-card";
      card.innerHTML = `
        <h2>${category.label}</h2>
        <p>${category.definition}</p>
        <div class="score-row" role="radiogroup" aria-label="${category.label}">
          ${[1, 2, 3, 4, 5]
            .map(
              (score) => `
                <label class="score-option">
                  <input type="radio" name="${category.key}" value="${score}" required>
                  <span>${score}</span>
                </label>
              `,
            )
            .join("")}
        </div>
        <div class="scale-labels"><span>${category.low}</span><span>${category.high}</span></div>
        <ol class="anchor-list">
          ${category.anchors.map((anchor) => `<li>${anchor}</li>`).join("")}
        </ol>
      `;
      rubricGrid.appendChild(card);
    });
  }

  function currentItem() {
    return state.videos[state.order[state.index]];
  }

  function responseKey(item) {
    return `${item.collection || "video"}::${item.title}`;
  }

  function responseId(item) {
    return [
      state.participant.participantId || "anonymous",
      state.participant.sessionId || "session",
      item.collection || "video",
      item.title || "untitled",
    ].join("::");
  }

  function restoreForm(item) {
    ratingForm.reset();
    const saved = state.responses[responseKey(item)];
    if (!saved) return;
    categories.forEach((category) => {
      const input = ratingForm.querySelector(`input[name="${category.key}"][value="${saved.ratings[category.key]}"]`);
      if (input) input.checked = true;
    });
    gestureDescription.value = saved.gesture_description || "";
    ambiguities.value = saved.ambiguities || "";
  }

  function resetWatchState() {
    state.currentWatchSeconds = 0;
    state.currentMaxTime = 0;
    state.videoStartedAt = Date.now();
    watchStatus.textContent = ui.watchRequirement;
    formWarning.textContent = "";
  }

  function renderVideo() {
    const item = currentItem();
    if (!item) {
      renderDone();
      return;
    }

    resetWatchState();
    targetWord.textContent = item.target_word || item.title;
    videoTitle.textContent = item.title;
    progressText.textContent = `Video ${state.index + 1} of ${state.order.length}`;
    progressBar.style.width = `${Math.round((state.index / state.order.length) * 100)}%`;
    videoPlayer.src = videoUrl(item);
    videoPlayer.load();
    restoreForm(item);
    backButton.disabled = state.index === 0;
    nextButton.textContent = state.index === state.order.length - 1 ? ui.finishSurvey : ui.saveContinue;
  }

  function watchedEnough() {
    const duration = videoPlayer.duration || 0;
    if (!Number.isFinite(duration) || duration <= 0) return true;
    return state.currentMaxTime / duration >= config.minWatchRatio;
  }

  function saveState() {
    localStorage.setItem(
      storageKey(),
      JSON.stringify({
        participant: state.participant,
        order: state.order,
        index: state.index,
        responses: state.responses,
        sessionStartedAt: state.sessionStartedAt,
        block: state.block,
      }),
    );
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey()) || "null");
      if (!saved || !Array.isArray(saved.order)) return;
      state.order = saved.order.filter((index) => index >= 0 && index < state.videos.length);
      state.index = Math.min(saved.index || 0, state.order.length - 1);
      state.responses = saved.responses || {};
      state.sessionStartedAt = saved.sessionStartedAt || state.sessionStartedAt;
    } catch {
      localStorage.removeItem(storageKey());
    }
  }

  function collectCurrentResponse() {
    const item = currentItem();
    const formData = new FormData(ratingForm);
    const ratings = {};
    categories.forEach((category) => {
      ratings[category.key] = Number(formData.get(category.key));
    });

    const response = {
      response_id: responseId(item),
      participant_id: state.participant.participantId,
      study_id: state.participant.studyId,
      session_id: state.participant.sessionId,
      language: currentLang,
      collection: item.collection || "",
      source: item.source || "",
      block_id: state.block || "",
      title: item.title,
      target_word: item.target_word || "",
      video_url: videoUrl(item),
      order_index: state.index + 1,
      ratings,
      gesture_description: gestureDescription.value.trim(),
      ambiguities: ambiguities.value.trim(),
      watch_seconds: Math.round(state.currentMaxTime),
      response_seconds: Math.round((Date.now() - state.videoStartedAt) / 1000),
      submitted_at: new Date().toISOString(),
    };
    state.responses[responseKey(item)] = response;
    saveState();
    return response;
  }

  function validateForm() {
    if (!watchedEnough()) {
      formWarning.textContent = ui.watchBeforeContinue;
      return false;
    }
    if (!ratingForm.reportValidity()) {
      formWarning.textContent = ui.completeRatings;
      return false;
    }
    formWarning.textContent = "";
    return true;
  }

  function rows() {
    return state.order
      .map((index) => state.videos[index])
      .map((item) => state.responses[responseKey(item)])
      .filter(Boolean);
  }

  function csvEscape(value) {
    const text = value == null ? "" : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }

  function csvData() {
    const header = [
      "participant_id",
      "study_id",
      "session_id",
      "collection",
      "source",
      "block_id",
      "title",
      "target_word",
      "video_url",
      "order_index",
      "iconicity",
      "sensorimotor_imagery",
      "motional_salience_gesture",
      "emotional_salience_facial_expression",
      "gesture_complexity_fit",
      "cultural_familiarity",
      "enactment_potential",
      "gesture_description",
      "ambiguities",
      "watch_seconds",
      "response_seconds",
      "submitted_at",
    ];
    const body = rows().map((row) =>
      header
        .map((key) => {
          if (key in row.ratings) return csvEscape(row.ratings[key]);
          return csvEscape(row[key]);
        })
        .join(","),
    );
    return [header.join(","), ...body].join("\n");
  }

  function payloadFor(responses) {
    return {
      participant: state.participant,
      session_started_at: state.sessionStartedAt,
      exported_at: new Date().toISOString(),
      block: state.block,
      responses,
    };
  }

  function jsonData(responses = rows()) {
    return JSON.stringify(
      payloadFor(responses),
      null,
      2,
    );
  }

  function download(filename, data, type) {
    const blob = new Blob([data], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function renderDone() {
    progressBar.style.width = "100%";
    show(doneScreen);
    const completed = rows().length;
    summaryStats.innerHTML = `
      <article><strong>${completed}</strong><span>${ui.videosRated}</span></article>
      <article><strong>${categories.length}</strong><span>${ui.ratingDimensions}</span></article>
      <article><strong>${state.block ? `${ui.block} ${state.block}` : ui.all}</strong><span>${ui.videoSet}</span></article>
    `;

    submitButton.disabled = !config.submitUrl;
    if (!config.submitUrl) {
      submitStatus.textContent = ui.noEndpoint;
    } else if (config.submitEachResponse) {
      submitButton.disabled = true;
      submitButton.textContent = ui.submittedAsYouGo;
      submitStatus.textContent = ui.autoSubmitted;
    }

    const returnUrl = query().get("return") || config.completionUrl;
    if (returnUrl) {
      completionLink.href = `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}cc=${encodeURIComponent(config.completionCode)}`;
      completionLink.classList.remove("hidden");
    }
  }

  async function submitResults() {
    if (!config.submitUrl) return;
    submitButton.disabled = true;
    submitStatus.textContent = ui.submitting;
    try {
      await postResponses(rows());
      submitStatus.textContent =
        config.submitMode === "no-cors"
          ? ui.submittedBackup
          : format(ui.completionStatus, { code: config.completionCode });
    } catch (error) {
      submitStatus.textContent = format(ui.submitFailed, { message: error.message });
      submitButton.disabled = false;
    }
  }

  async function postResponses(responses) {
    const response = await fetch(config.submitUrl, {
      method: "POST",
      mode: config.submitMode,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: jsonData(responses),
    });
    if (config.submitMode !== "no-cors" && !response.ok) throw new Error(`HTTP ${response.status}`);
  }

  function submitResponseInBackground(response) {
    if (!config.submitUrl || !config.submitEachResponse) return;
    postResponses([response]).catch((error) => {
      formWarning.textContent = format(ui.savedLocalFailed, { message: error.message });
    });
  }

  async function loadManifest() {
    const manifestUrl = query().get("manifest") || config.manifestUrl;
    const response = await fetch(manifestUrl);
    if (!response.ok) throw new Error(`Could not load ${manifestUrl}`);
    let videos = await response.json();
    state.fullManifest = videos;
    state.totalVideos = videos.length;
    const block = Number(query().get("block") || 0);
    const blockSize = Number(query().get("block_size") || config.blockSize);
    if (block > 0 && blockSize > 0) {
      const start = (block - 1) * blockSize;
      videos = videos.slice(start, start + blockSize);
      state.block = block;
      if (videos.length === 0) {
        throw new Error(`Block ${block} has no videos. This manifest has ${Math.ceil(state.totalVideos / blockSize)} blocks.`);
      }
      blockSummary.textContent = format(ui.blockAssigned, { block, start: start + 1, end: Math.min(start + blockSize, state.totalVideos), total: state.totalVideos });
    } else {
      blockSummary.textContent = format(ui.allVideosAssigned, { count: videos.length });
    }
    state.tutorialReference = pickTutorialReference(state.fullManifest, state.block, blockSize);
    const limit = Number(query().get("limit") || 0);
    if (limit > 0) videos = videos.slice(0, limit);
    state.videos = videos;
  }

  function initParticipant() {
    const params = query();
    participantId.value = params.get("participant_id") || params.get("participant") || params.get("pid") || "";
    state.participant = {
      participantId: participantId.value.trim(),
      studyId: params.get("study_id") || "",
      sessionId: params.get("session_id") || randomId(),
      notes: "",
      block: state.block,
      language: currentLang,
    };
  }

  languageSelect.addEventListener("change", () => {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", languageSelect.value);
    window.location.href = url.toString();
  });

  participantForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.participant.participantId = participantId.value.trim() || `anon-${randomId()}`;
    state.participant.notes = sessionNotes.value.trim();
    state.participant.block = state.block;
    state.participant.language = currentLang;
    state.order = shuffledIndexes(state.videos.length, state.participant.participantId);
    loadState();
    if (!state.order.length) state.order = shuffledIndexes(state.videos.length, state.participant.participantId);
    saveState();
    state.tutorialIndex = 0;
    renderTutorialReferenceVideo();
    renderTutorial();
    show(tutorialScreen);
  });

  tutorialBackButton.addEventListener("click", () => {
    state.tutorialIndex = Math.max(0, state.tutorialIndex - 1);
    renderTutorial();
  });

  tutorialNextButton.addEventListener("click", () => {
    const lastIndex = tutorialSteps().length - 1;
    if (state.tutorialIndex >= lastIndex) {
      renderVideo();
      show(ratingScreen);
      return;
    }
    state.tutorialIndex += 1;
    renderTutorial();
  });

  ratingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    const response = collectCurrentResponse();
    submitResponseInBackground(response);
    state.index += 1;
    saveState();
    renderVideo();
  });

  backButton.addEventListener("click", () => {
    if (state.index === 0) return;
    state.index -= 1;
    saveState();
    renderVideo();
  });

  replayButton.addEventListener("click", () => {
    videoPlayer.currentTime = 0;
    videoPlayer.play();
  });

  videoPlayer.addEventListener("timeupdate", () => {
    state.currentMaxTime = Math.max(state.currentMaxTime, videoPlayer.currentTime || 0);
    if (watchedEnough()) {
      watchStatus.textContent = ui.watchRequirementMet;
    }
  });

  downloadCsvButton.addEventListener("click", () => download("gesture-human-ratings.csv", csvData(), "text/csv"));
  downloadJsonButton.addEventListener("click", () => download("gesture-human-ratings.json", jsonData(), "application/json"));
  submitButton.addEventListener("click", submitResults);

  applyLanguage();
  renderRubric();
  initParticipant();
  loadManifest().catch((error) => {
    document.body.innerHTML = `<main class="screen"><div class="hero-card"><h1>Survey failed to load</h1><p>${error.message}</p></div></main>`;
  });
})();
