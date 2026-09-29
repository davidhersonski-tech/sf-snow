(() => {
  "use strict";

  // =========================================================
  // Obersten erreichbaren SAP-SuccessFactors-Kontext verwenden
  // =========================================================
  let rootWindow = window;
  let rootDocument = document;

  try {
    if (window.top && window.top.document) {
      rootWindow = window.top;
      rootDocument = window.top.document;
    }
  } catch (e) {
    // Falls window.top aus Sicherheitsgründen nicht erreichbar ist,
    // wird automatisch der aktuelle Fensterkontext verwendet.
    rootWindow = window;
    rootDocument = document;
  }

  const EFFECT_KEY = "__sfWinterEffectV2";
  const STYLE_ID = "sf-winter-effect-styles";
  const FLAKE_CLASS = "sf-winter-flake";
  const TOAST_CLASS = "sf-winter-toast";

  const RUN_TIME_MS = 30_000;
  const MAX_FLAKES = 95;

  // Zweiter Klick: laufenden Effekt sofort beenden.
  if (rootWindow[EFFECT_KEY]?.cleanup) {
    rootWindow[EFFECT_KEY].cleanup();
    return;
  }

  // Nicht gleichzeitig mit dem Geburtstags-Effekt laufen lassen.
  rootWindow.__sfBirthdayEffectV1?.cleanup?.();

  // Reste einer älteren Snow-Version aufräumen.
  if (rootWindow.sfSnowInterval) {
    clearInterval(rootWindow.sfSnowInterval);
    rootWindow.sfSnowInterval = null;
  }

  rootDocument
    .querySelectorAll(".snowflake")
    .forEach((node) => node.remove());

  const state = {
    interval: null,
    autoStopTimer: null,
    finishTimer: null,
    toastTimer: null,
    cleanup: null,
  };

  const cleanup = () => {
    clearInterval(state.interval);
    clearTimeout(state.autoStopTimer);
    clearTimeout(state.finishTimer);
    clearTimeout(state.toastTimer);

    rootDocument
      .querySelectorAll(`.${FLAKE_CLASS}, .${TOAST_CLASS}`)
      .forEach((node) => node.remove());

    rootDocument.getElementById(STYLE_ID)?.remove();

    if (rootWindow[EFFECT_KEY] === state) {
      delete rootWindow[EFFECT_KEY];
    }
  };

  state.cleanup = cleanup;
  rootWindow[EFFECT_KEY] = state;

  // =========================================================
  // CSS in den obersten SAP-Kontext einfügen
  // =========================================================
  const style = rootDocument.createElement("style");
  style.id = STYLE_ID;

  style.textContent = `
    .${FLAKE_CLASS} {
      position: fixed;
      top: 0;
      left: var(--left);
      z-index: 2147483645;
      color: var(--color);
      font-family: "Segoe UI Symbol", "Noto Sans Symbols", sans-serif;
      font-size: var(--size);
      line-height: 1;
      opacity: 0;
      pointer-events: none;
      user-select: none;

      filter:
        drop-shadow(0 0 3px rgba(0, 112, 242, 0.75))
        drop-shadow(0 1px 1px rgba(18, 64, 94, 0.35));

      animation:
        sfWinterFall var(--duration)
        linear
        var(--delay)
        forwards;

      will-change: transform, opacity;
    }

    .${TOAST_CLASS} {
      position: fixed;
      top: 78px;
      left: 50%;
      z-index: 2147483646;

      transform: translateX(-50%);

      padding: 10px 18px;

      border:
        1px solid rgba(92, 197, 255, 0.85);

      border-radius: 999px;

      background:
        linear-gradient(
          135deg,
          rgba(13, 64, 104, 0.94),
          rgba(18, 121, 178, 0.94)
        );

      color: #ecfaff;

      box-shadow:
        0 8px 24px rgba(0, 73, 121, 0.3);

      font:
        600 15px/1.2 Arial, sans-serif;

      letter-spacing: 0.2px;
      pointer-events: none;

      animation:
        sfWinterToast 2.8s ease both;
    }

    @keyframes sfWinterFall {
      0% {
        transform:
          translate3d(0, -14vh, 0)
          rotate(0deg);

        opacity: 0;
      }

      7% {
        opacity: var(--opacity);
      }

      50% {
        transform:
          translate3d(
            var(--drift-half),
            52vh,
            0
          )
          rotate(var(--rotation-half));

        opacity: var(--opacity);
      }

      100% {
        transform:
          translate3d(
            var(--drift),
            112vh,
            0
          )
          rotate(var(--rotation));

        opacity: 0.9;
      }
    }

    @keyframes sfWinterToast {
      0% {
        opacity: 0;

        transform:
          translate(-50%, -12px)
          scale(0.96);
      }

      15%,
      78% {
        opacity: 1;

        transform:
          translate(-50%, 0)
          scale(1);
      }

      100% {
        opacity: 0;

        transform:
          translate(-50%, -8px)
          scale(0.98);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .${FLAKE_CLASS} {
        animation-duration: 14s;
      }
    }
  `;

  rootDocument.head.appendChild(style);

  const colors = [
    "#4aa8e8",
    "#60c6f2",
    "#7fd4ff",
    "#9ee4ff",
    "#c1f0ff"
  ];

  const symbols = [
    "❄",
    "❅",
    "❆"
  ];

  // =========================================================
  // Schneeflocke erzeugen
  // =========================================================
  const createFlake = (prefill = false) => {

    if (
      rootDocument.querySelectorAll(
        `.${FLAKE_CLASS}`
      ).length >= MAX_FLAKES
    ) {
      return;
    }

    const flake =
      rootDocument.createElement("span");

    const size =
      22 + Math.random() * 32;

    const duration =
      7.5 + Math.random() * 5;

    const drift =
      -110 + Math.random() * 220;

    const rotation =
      (Math.random() > 0.5 ? 1 : -1) *
      (300 + Math.random() * 540);

    flake.className = FLAKE_CLASS;

    flake.textContent =
      symbols[
        Math.floor(
          Math.random() *
          symbols.length
        )
      ];

    flake.setAttribute(
      "aria-hidden",
      "true"
    );

    flake.style.setProperty(
      "--left",
      `${Math.random() * 100}vw`
    );

    flake.style.setProperty(
      "--size",
      `${size.toFixed(1)}px`
    );

    flake.style.setProperty(
      "--duration",
      `${duration.toFixed(2)}s`
    );

    flake.style.setProperty(
      "--delay",
      prefill
        ? `${(-Math.random() * duration).toFixed(2)}s`
        : "0s"
    );

    flake.style.setProperty(
      "--drift",
      `${drift.toFixed(1)}px`
    );

    flake.style.setProperty(
      "--drift-half",
      `${(drift * 0.45).toFixed(1)}px`
    );

    flake.style.setProperty(
      "--rotation",
      `${rotation.toFixed(0)}deg`
    );

    flake.style.setProperty(
      "--rotation-half",
      `${(rotation * 0.46).toFixed(0)}deg`
    );

    flake.style.setProperty(
      "--opacity",
      `${(
        0.76 +
        Math.random() * 0.24
      ).toFixed(2)}`
    );

    flake.style.setProperty(
      "--color",
      colors[
        Math.floor(
          Math.random() *
          colors.length
        )
      ]
    );

    flake.addEventListener(
      "animationend",
      () => flake.remove(),
      { once: true }
    );

    rootDocument.body.appendChild(flake);
  };

  // =========================================================
  // Hinweis "Wintermodus aktiviert"
  // =========================================================
  const toast =
    rootDocument.createElement("div");

  toast.className = TOAST_CLASS;

  toast.textContent =
    "❄ Wintermodus aktiviert";

  toast.setAttribute(
    "role",
    "status"
  );

  rootDocument.body.appendChild(toast);

  state.toastTimer =
    rootWindow.setTimeout(
      () => toast.remove(),
      2_900
    );

  // =========================================================
  // Schnee starten
  // =========================================================

  // Sofort gefüllte Schneeszene
  for (
    let i = 0;
    i < 34;
    i += 1
  ) {
    createFlake(true);
  }

  // Danach regelmäßig neue Flocken
  state.interval =
    rootWindow.setInterval(
      () => createFlake(false),
      120
    );

  // =========================================================
  // Nach 30 Sekunden keine neuen Flocken mehr
  // =========================================================
  state.autoStopTimer =
    rootWindow.setTimeout(() => {

      clearInterval(state.interval);
      state.interval = null;

      // Letzte Flocken zu Ende fallen lassen
      state.finishTimer =
        rootWindow.setTimeout(
          cleanup,
          13_000
        );

    }, RUN_TIME_MS);

})();