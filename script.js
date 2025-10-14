// Fonction qui retourne un emoji météo selon le code et si c'est le jour (true) ou la nuit (false)
function getIconMeteo(code, isDay) {
  // Si code vaut 0 : ciel clair -> soleil le jour, lune la nuit
  if (code === 0) return isDay ? "☀️" : "🌙";          // ciel clair

  // Si code est 1, 2 ou 3 : nuages partiels/plus de nuages -> afficher un emoji "partiellement nuageux" selon le jour
  if ([1, 2, 3].includes(code)) return isDay ? "⛅" : "🌥️"; // nuageux partiel ou couvert

  // Brouillard (codes 45 et 48) : même emoji de brouillard quelle que soit l'heure
  if ([45, 48].includes(code)) return "🌫️";             // brouillard

  // Bruine légère (codes 51, 53, 55) : emoji pluie légère
  if ([51, 53, 55].includes(code)) return "🌦️";          // bruine 

  // Pluie (codes 61, 63, 65 et 80, 81, 82 pour averses) : emoji pluie
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "🌧️"; // pluie

  // Pluie verglaçante ou pluies glacées (codes 66, 67)
  if ([66, 67].includes(code)) return "🌨️";             // pluie verglaçante

  // Neige (codes 71, 73, 75, 77, 85, 86)
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️"; // neige

  // Orages (codes 95, 96, 99) : emoji orageux
  if ([95, 96, 99].includes(code)) return "⛈️";          // orage

  // Par défaut : on ne reconnaît pas le code, retourner un point d'interrogation
  return "❔";                                            // inconnu
}

    // S'execute quand l'utilisateur accepte la géolocalisation
function onPosition(position_obj) {
  // Récupère latitude/longitude envoyées par navigateur
  const lat = position_obj.coords.latitude;
  const lon = position_obj.coords.longitude;
  // Met à jour les champs inputs
  document.getElementById('lat').value = lat;
  document.getElementById('lon').value = lon;
  // Affiche la météo pour la position
  afficherMeteo(lat, lon, "Ma position");
}

function getMyPosition() {
  // Vérifie que la géolocalisation est disponible
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(onPosition, () => {
      alert("Impossible de récupérer votre position.");
    });
  } else {
    alert("Géolocalisation non supportée !");
  }
}

// Fonction principale async appelée au chargement ou pour tester
async function main() {
  // Ici tu peux lancer une recherche automatique par exemple, ou autre initialisation
  // Exemple : appeler rechercheVille() ou mettre des valeurs par défaut dans les inputs.
  // Le corps est vide pour l'instant — c'est une bonne place pour initialiser l'app.
}

// Fonction qui recherche la ville puis récupère la météo (reste inchangée)
async function rechercheVille() {
  // Récupère la valeur du champ HTML avec l'id 'city' et enlève les espaces autour
  const ville = document.getElementById('city').value.trim();
  // Si la chaîne est vide après trim, on stoppe et on affiche une alerte
  if (!ville) return alert('Veuillez saisir une ville.');

  try {
    // Appel à l'API de géocodage d'Open-Meteo : on envoie le nom de la ville encodé dans l'URL.
    // count=1 limite la réponse au résultat le plus pertinent.
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ville)}&count=1`);
    // On récupère la réponse en JSON
    const geoData = await geoRes.json();

    // Si la réponse ne contient pas de résultats valides, on considère que la ville n'a pas été trouvée
    if (!geoData.results || !geoData.results[0]) throw new Error("Ville non trouvée");

    // On prend le premier résultat (le plus pertinent)
    const loc = geoData.results[0];
    // On écrit les coordonnées dans les champs HTML 'lat' et 'lon' pour que l'utilisateur les voit
    document.getElementById('lat').value = loc.latitude;
    document.getElementById('lon').value = loc.longitude;

    // On appelle la fonction qui affiche la météo en lui passant lat, lon et le nom renvoyé par l'API
    await afficherMeteo(loc.latitude, loc.longitude, loc.name);
  } catch {
    // En cas d'erreur (fetch qui échoue, pas de résultat, etc.) on affiche un message simple
    document.getElementById('result').textContent = "Ville introuvable.";
  }
}

// Fonction qui récupère la météo et affiche les informations dans la page (inchangée)
function afficherMeteo(latitude, longitude, nom = "") {
  // On construit l'URL de l'API Open-Meteo pour récupérer la météo courante.
  // timezone=auto permet d'obtenir is_day correct selon le fuseau horaire du lieu.
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
    .then(response => response.json()) // Convertit la réponse HTTP en JSON
    .then(data => {
      // Si la propriété current_weather est absente, on considère que la météo n'est pas disponible
      if (!data.current_weather) throw new Error("Pas de météo trouvée");

      // Récupère la température actuelle
      const temp = data.current_weather.temperature;
      // Récupère le code météo (qui correspond aux codes utilisés dans getIconMeteo)
      const code = data.current_weather.weathercode;
      // is_day vaut 1 pour le jour, 0 pour la nuit — on convertit en booléen
      const isDay = data.current_weather.is_day === 1;
      // On obtient l'emoji correspondant
      const icon = getIconMeteo(code, isDay);

      // Change l'apparence de la page selon s'il fait jour ou nuit
      if (isDay) {
        document.body.style.backgroundColor = "#87ceeb"; // bleu ciel
        document.body.style.color = "#000";              // texte noir pour contraste
      } else {
        document.body.style.backgroundColor = "#001d3d"; // bleu nuit foncé
        document.body.style.color = "#fff";              // texte blanc pour contraste
      }

      // Récupère la div où l'on affichera le résultat
      const resultDiv = document.getElementById('result');
      // Vide la div (supprime tous ses enfants) pour réafficher proprement
      while (resultDiv.firstChild) {
        resultDiv.removeChild(resultDiv.firstChild);
      }

      // Crée un titre (h2) pour afficher le nom de la ville (peut être vide)
      const h2 = document.createElement('h2');
      h2.textContent = nom;
      resultDiv.appendChild(h2);

      // Crée un div pour afficher l'emoji météo avec une grande taille de police
      const iconDiv = document.createElement('div');
      iconDiv.style.fontSize = '240px';
      iconDiv.textContent = icon;
      resultDiv.appendChild(iconDiv);

      // Crée un div pour afficher la température actuelle
      const tempDiv = document.createElement('div');
      tempDiv.style.fontSize = '50px';
      tempDiv.textContent = `${temp}°C`;
      resultDiv.appendChild(tempDiv);
    })
    .catch(() => {
      // Si une erreur survient dans la chaîne fetch → json → traitement, on affiche un message d'erreur simple
      const resultDiv = document.getElementById('result');
      // Vide la div existante
      while (resultDiv.firstChild) {
        resultDiv.removeChild(resultDiv.firstChild);
      }
      // Crée un paragraphe pour indiquer l'erreur
      const errorP = document.createElement('p');
      errorP.textContent = "Erreur lors du chargement de la météo.";
      resultDiv.appendChild(errorP);
    });
}

// Appelle la fonction principale main au chargement du script
main();