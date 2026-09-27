(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const { encrypt, decrypt, buildTable, SYMBOLS } = window.PhoneCipher;

  let lastWords = [];

  function key() { return $("key").value.trim(); }

  function renderEncrypt() {
    const table = buildTable(key());
    lastWords = encrypt($("phone").value, key());
    const out = $("enc-out");
    out.textContent = "";
    for (const w of lastWords) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = w;
      const hint = document.createElement("small");
      hint.textContent = table.decode[w];
      chip.appendChild(hint);
      out.appendChild(chip);
    }
    const empty = lastWords.length === 0;
    ["reroll", "copy-enc", "to-dec"].forEach((id) => ($(id).disabled = empty));
  }

  function renderDecrypt() {
    const { number, unknown } = decrypt($("words").value, key());
    $("dec-out").textContent = number;
    $("copy-dec").disabled = !number;
    const messages = [];
    if (unknown.length) {
      messages.push("Mots non reconnus (ignorés) : " + unknown.join(", ") + (key() ? " — vérifiez la clé." : ""));
    }
    if (number.lastIndexOf("+") > 0) {
      messages.push("Un « + » apparaît au milieu du numéro : la clé est probablement incorrecte.");
    }
    const warn = $("dec-warn");
    warn.hidden = messages.length === 0;
    warn.textContent = messages.join(" ");
  }

  function renderTable() {
    const { encode } = buildTable(key());
    const box = $("table");
    box.textContent = "";
    for (const sym of SYMBOLS) {
      const row = document.createElement("div");
      row.className = "row";
      const b = document.createElement("b");
      b.textContent = sym;
      const s = document.createElement("span");
      s.lang = "he";
      s.textContent = encode[sym].join(" ");
      row.append(b, s);
      box.appendChild(row);
    }
  }

  function selectTab(which) {
    const enc = which === "enc";
    $("tab-enc").setAttribute("aria-selected", enc);
    $("tab-dec").setAttribute("aria-selected", !enc);
    $("panel-enc").hidden = !enc;
    $("panel-dec").hidden = enc;
  }

  async function copy(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      const old = btn.textContent;
      btn.textContent = "Copié ✓";
      setTimeout(() => (btn.textContent = old), 1200);
    } catch (e) { /* presse-papiers indisponible */ }
  }

  $("phone").addEventListener("input", renderEncrypt);
  $("words").addEventListener("input", renderDecrypt);
  $("key").addEventListener("input", () => { renderEncrypt(); renderDecrypt(); renderTable(); });
  $("reroll").addEventListener("click", renderEncrypt);
  $("copy-enc").addEventListener("click", (e) => copy(lastWords.join(" "), e.currentTarget));
  $("copy-dec").addEventListener("click", (e) => copy($("dec-out").textContent, e.currentTarget));
  $("to-dec").addEventListener("click", () => {
    $("words").value = lastWords.join(" ");
    renderDecrypt();
    selectTab("dec");
  });
  $("tab-enc").addEventListener("click", () => selectTab("enc"));
  $("tab-dec").addEventListener("click", () => selectTab("dec"));

  renderEncrypt();
  renderDecrypt();
  renderTable();
})();
