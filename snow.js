(function() {
    // Falls bereits ein Schnee-Intervall läuft (Zweiter Klick -> Abbrechen)
    if (window.sfSnowInterval) {
        clearInterval(window.sfSnowInterval);
        window.sfSnowInterval = null;
        // Alle noch existierenden Flocken sofort löschen
        document.querySelectorAll('.snowflake').forEach(flake => flake.remove());
        return; // Skript hier beenden
    }

    // 1. CSS-Styling für die Schneeflocken in die Seite einfügen
    if (!document.getElementById('snow-styles')) {
        const style = document.createElement('style');
        style.id = 'snow-styles';
        style.innerHTML = `
            .snowflake {
                position: fixed;
                top: -10px;
                color: #fff;
                font-size: 1.5em;
                font-family: Arial, sans-serif;
                text-shadow: 0 0 5px rgba(0,0,0,0.3);
                user-select: none;
                z-index: 99999;
                pointer-events: none;
                animation: fall linear forwards;
            }
            @keyframes fall {
                to { transform: translateY(105vh); }
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Funktion für eine einzelne Schneeflocke
    function createSnowflake() {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.innerHTML = '❄';
        
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.opacity = Math.random();
        const duration = Math.random() * 3 + 2; // 2 bis 5 Sekunden Fallzeit
        flake.style.animationDuration = duration + 's';
        
        document.body.appendChild(flake);
        
        // Flocke löschen, wenn sie unten ankommt
        setTimeout(() => { flake.remove(); }, duration * 1000);
    }

    // 3. Schnee starten und das Intervall global speichern
    window.sfSnowInterval = setInterval(createSnowflake, 200);
    
    // 4. Nach exakt 30 Sekunden automatisch stoppen
    setTimeout(() => {
        if (window.sfSnowInterval) {
            clearInterval(window.sfSnowInterval);
            window.sfSnowInterval = null;
        }
    }, 30000);
})();
