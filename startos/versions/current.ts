import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.9.2:2',
  releaseNotes: {
    en_US:
      'Requires StartOS 0.4.2 or later. Configure now rejects a pool address, authority public key, reward address, username or coinbase signature that is not in the form Stratum V2 expects, and nothing entered there can change any other setting. If Configure flags a saved answer the next time you open it, correct it before saving.',
    es_ES:
      'Requiere StartOS 0.4.2 o posterior. Configurar ahora rechaza una dirección del pool, clave pública de autoridad, dirección de recompensa, nombre de usuario o firma de coinbase que no tenga la forma que espera Stratum V2, y nada de lo que se introduzca allí puede cambiar ningún otro ajuste. Si Configurar marca una respuesta guardada la próxima vez que lo abras, corrígela antes de guardar.',
    de_DE:
      'Erfordert StartOS 0.4.2 oder neuer. Konfigurieren weist jetzt eine Pool-Adresse, einen Authority-Public-Key, eine Belohnungsadresse, einen Benutzernamen oder eine Coinbase-Signatur zurück, die nicht die von Stratum V2 erwartete Form haben, und nichts, was dort eingegeben wird, kann eine andere Einstellung ändern. Markiert Konfigurieren beim nächsten Öffnen eine gespeicherte Antwort, korrigiere sie vor dem Speichern.',
    pl_PL:
      'Wymaga StartOS 0.4.2 lub nowszego. Konfiguruj odrzuca teraz adres puli, klucz publiczny autorytetu, adres nagrody, nazwę użytkownika lub podpis coinbase, które nie mają postaci oczekiwanej przez Stratum V2, a nic, co się tam wpisze, nie może zmienić żadnego innego ustawienia. Jeśli przy następnym otwarciu Konfiguruj oznaczy zapisaną odpowiedź, popraw ją przed zapisaniem.',
    fr_FR:
      "Nécessite StartOS 0.4.2 ou une version ultérieure. Configurer refuse désormais une adresse de pool, une clé publique d'autorité, une adresse de récompense, un nom d'utilisateur ou une signature coinbase qui n'a pas la forme attendue par Stratum V2, et rien de ce qui y est saisi ne peut modifier un autre réglage. Si Configurer signale une réponse enregistrée la prochaine fois que vous l'ouvrez, corrigez-la avant d'enregistrer.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
