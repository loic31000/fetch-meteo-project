function getIconMeteo(code, isDay) {
  console.log("Code météo :", code, "Jour ?", isDay);
  if (code === 0) return isDay ? "icon/soleil.png" : "icon/nuit.png";
  if ([1, 2, 3].includes(code))
    return isDay ? "icon/nuageux_partiel.png" : "icon/couvert.png";
  if ([51, 53, 55].includes(code)) return "icon/bruine.jpg";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "icon/pluie.png";
  if ([66, 67].includes(code)) return "icon/pluie_verglacante.png";
  if ([95, 96, 99].includes(code)) return "icon/orage.png";
  return "icon/inconnu.png"; // crée une image inconnue en PNG
}

// S'execute quand l'utilisateur accepte la géolocalisation
function onPosition(position_obj) {
  // Récupère latitude/longitude envoyées par navigateur
  const lat = position_obj.coords.latitude;
  const lon = position_obj.coords.longitude;
  // Met à jour les champs inputs
  document.getElementById("lat").value = lat;
  document.getElementById("lon").value = lon;
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
  const ville = document.getElementById("city").value.trim();
  // Si la chaîne est vide après trim, on stoppe et on affiche une alerte
  if (!ville) return alert("Veuillez saisir une ville.");

  try {
    // Appel à l'API de géocodage d'Open-Meteo : on envoie le nom de la ville encodé dans l'URL.
    // count=1 limite la réponse au résultat le plus pertinent.
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        ville
      )}&count=1`
    );
    // On récupère la réponse en JSON
    const geoData = await geoRes.json();

    // Si la réponse ne contient pas de résultats valides, on considère que la ville n'a pas été trouvée
    if (!geoData.results || !geoData.results[0])
      throw new Error("Ville non trouvée");

    // On prend le premier résultat (le plus pertinent)
    const loc = geoData.results[0];
    // On écrit les coordonnées dans les champs HTML 'lat' et 'lon' pour que l'utilisateur les voit
    document.getElementById("lat").value = loc.latitude;
    document.getElementById("lon").value = loc.longitude;

    // On appelle la fonction qui affiche la météo en lui passant lat, lon et le nom renvoyé par l'API
    await afficherMeteo(loc.latitude, loc.longitude, loc.name);
  } catch {
    // En cas d'erreur (fetch qui échoue, pas de résultat, etc.) on affiche un message simple
    document.getElementById("result").textContent = "Ville introuvable.";
  }
}

// Fonction qui récupère la météo et affiche les informations dans la page (inchangée)
function afficherMeteo(latitude, longitude, nom = "") {
  // On construit l'URL de l'API Open-Meteo pour récupérer la météo courante.
  // timezone=auto permet d'obtenir is_day correct selon le fuseau horaire du lieu.
  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  )
    .then((response) => response.json()) // Convertit la réponse HTTP en JSON
    .then((data) => {
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

      const inputs = ["lat", "lon", "city", "button", "ma position"];

      if (isDay) {
        document.body.style.background = "linear-gradient(#87ceeb, #e6e21dff)";
        document.body.style.color = "#000";
        const border = "thick double #e6e21dff";
        const bg = "white";
        const color = "black";
        inputs.forEach((id) => {
          document.getElementById(id).style.border = border;
          document.getElementById(id).style.background = bg;
          document.getElementById(id).style.color = color;
        });
        // Si le bouton spécial doit avoir un bord différent
        document.getElementById("ma position").style.border =
          "thick double #87ceeb";
      } else {
        document.body.style.background =
          "linear-gradient(#121872ff, #540d66ff)";
        document.body.style.color = "#fff";
        const border = "thick double #b80303ff";
        const bg = "black";
        const color = "white";
        inputs.forEach((id) => {
          document.getElementById(id).style.border = border;
          document.getElementById(id).style.background = bg;
          document.getElementById(id).style.color = color;
        });
      }

      // Récupère la div où l'on affichera le résultat
      const resultDiv = document.getElementById("result");
      // Vide la div (supprime tous ses enfants) pour réafficher proprement
      while (resultDiv.firstChild) {
        resultDiv.removeChild(resultDiv.firstChild);
      }

      // Crée un titre (h2) pour afficher le nom de la ville (peut être vide)
      const h2 = document.createElement("h2");
      h2.textContent = nom;
      resultDiv.appendChild(h2);

      // Crée un div pour afficher l'emoji météo avec une grande taille de police
      const iconeSrc = getIconMeteo(code, isDay);
      const imageIcone = document.createElement("img");
      imageIcone.src = iconeSrc;
      imageIcone.alt = "Icône météo";
      imageIcone.style.width = "500px"; // Ajuste la taille
      imageIcone.style.height = "500px";
      resultDiv.appendChild(imageIcone);

      // Crée un div pour afficher la température actuelle
      const tempDiv = document.createElement("div");
      tempDiv.style.fontSize = "51px";
      tempDiv.textContent = `${temp}°C`;
      resultDiv.appendChild(tempDiv);
    })
    .catch(() => {
      // Si une erreur survient dans la chaîne fetch → json → traitement, on affiche un message d'erreur simple
      const resultDiv = document.getElementById("result");
      // Vide la div existante
      while (resultDiv.firstChild) {
        resultDiv.removeChild(resultDiv.firstChild);
      }
      // Crée un paragraphe pour indiquer l'erreur
      const errorP = document.createElement("p");
      errorP.textContent = "Erreur lors du chargement de la météo.";
      resultDiv.appendChild(errorP);
    });
}

// Appelle la fonction principale main au chargement du script
main();
