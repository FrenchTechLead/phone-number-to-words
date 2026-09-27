/*
 * Chiffrement de numéros de téléphone en mots hébreux.
 * Chaque chiffre (et le « + » international) correspond à plusieurs mots :
 * au chiffrement, un mot est tiré au hasard ; au déchiffrement, chaque mot
 * est reconverti en son chiffre. Une clé secrète optionnelle mélange la table.
 */
(function (root) {
  "use strict";

  // 88 mots uniques : 8 par symbole (0-9 puis « + »).
  const WORDS = [
    "שמש", "ירח", "כוכב", "ענן", "גשם", "שלג", "רוח", "ים",
    "נהר", "הר", "עץ", "פרח", "עלה", "שורש", "זרע", "דשא",
    "ורד", "ארז", "תמר", "זית", "כלב", "חתול", "סוס", "אריה",
    "נמר", "דוב", "זאב", "שועל", "ארנב", "צבי", "ציפור", "יונה",
    "נשר", "עורב", "דג", "לוויתן", "דבורה", "פרפר", "נמלה", "צב",
    "לחם", "מים", "יין", "חלב", "דבש", "תפוח", "ענב", "רימון",
    "תאנה", "אגוז", "בית", "דלת", "חלון", "גג", "קיר", "שער",
    "מגדל", "גשר", "דרך", "עיר", "ספר", "עט", "דף", "מכתב",
    "שיר", "מילה", "אות", "סיפור", "חלום", "שם", "אור", "אש",
    "אבן", "זהב", "כסף", "ברזל", "יהלום", "פנינה", "מפתח", "כתר",
    "לב", "יד", "עין", "ראש", "רגל", "פה", "אוזן", "אף",
  ];
  const SYMBOLS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+"];
  const PER_SYMBOL = WORDS.length / SYMBOLS.length;

  // Hachage de chaîne -> graine 32 bits (FNV-1a).
  function hashKey(key) {
    let h = 0x811c9dc5;
    for (const ch of key) {
      h ^= ch.codePointAt(0);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  // Générateur pseudo-aléatoire déterministe (mulberry32).
  function mulberry32(seed) {
    return function () {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Retire niqqud / cantillation et espaces superflus.
  function normalizeWord(word) {
    return word.replace(/[֑-ׇ]/g, "").trim();
  }

  function buildTable(key) {
    const words = WORDS.slice();
    if (key) {
      const rand = mulberry32(hashKey(key));
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
      }
    }
    const encode = {};
    const decode = {};
    SYMBOLS.forEach((sym, i) => {
      encode[sym] = words.slice(i * PER_SYMBOL, (i + 1) * PER_SYMBOL);
      encode[sym].forEach((w) => (decode[w] = sym));
    });
    return { encode, decode };
  }

  function randomIndex(n) {
    if (root.crypto && root.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      root.crypto.getRandomValues(buf);
      return buf[0] % n;
    }
    return Math.floor(Math.random() * n);
  }

  // Renvoie la liste des mots ; ignore tout caractère hors chiffres et « + » initial.
  function encrypt(phone, key) {
    const { encode } = buildTable(key);
    const trimmed = phone.trim();
    const symbols = [];
    if (trimmed.startsWith("+")) symbols.push("+");
    for (const ch of trimmed) if (ch >= "0" && ch <= "9") symbols.push(ch);
    return symbols.map((s) => {
      const options = encode[s];
      return options[randomIndex(options.length)];
    });
  }

  // Renvoie { number, unknown } ; unknown liste les mots non reconnus.
  function decrypt(text, key) {
    const { decode } = buildTable(key);
    const tokens = text
      .split(/[\s,;.\-–—·|/]+/)
      .map(normalizeWord)
      .filter(Boolean);
    let number = "";
    const unknown = [];
    for (const t of tokens) {
      if (t in decode) number += decode[t];
      else unknown.push(t);
    }
    return { number, unknown };
  }

  const api = { WORDS, SYMBOLS, buildTable, encrypt, decrypt };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PhoneCipher = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
