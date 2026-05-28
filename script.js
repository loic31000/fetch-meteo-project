// Fonction qui retourne le chemin d'une icône météo en fonction du code météo et si c'est le jour (isDay=true) ou la nuit
function getIconMeteo(code, isDay) {
  // Affiche dans la console le code météo et s'il fait jour, pour déboguer
  console.log("Code météo :", code, "Jour ?", isDay);

  // Si le code météo est 0 (ciel clair), on retourne l'image du soleil si jour, ou de la nuit si nuit
  if (code === 0) return isDay ? "/icon/soleil.png" : "icon/nuit.png";

  // Si le code est 1, 2 ou 3 (nuages partiels ou couverts), on retourne l'icône jour ou nuit
  if ([1, 2, 3].includes(code))
    return isDay ? "/icon/nuageux_partiel.png" : "icon/couvert.png";

  // Si le code est 51, 53 ou 55 (bruine), on retourne l'icône bruine
  if ([51, 53, 55].includes(code)) return "/icon/bruine.jpg";

  // Si le code indique pluie ou averses (61, 63, 65, 80, 81, 82), on affiche l'icône pluie
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "/icon/pluie.png";

  // Si le code indique pluie verglaçante (66, 67), on affiche l'icône adaptée
  if ([66, 67].includes(code)) return "/icon/pluie_verglacante.png";

  // Si orages (codes 95, 96, 99), on affiche l'icône orage
  if ([95, 96, 99].includes(code)) return "/icon/orage.png";

  // Si aucun code connu, on retourne une image d'icône inconnue
  return "/icon/inconnu.png";
}

// Fonction asynchrone appelée lorsque la géolocalisation réussit (utilisateur accepte)
async function onPosition(position_obj) {
  // Récupère la latitude depuis l'objet position envoyé par le navigateur
  const lat = position_obj.coords.latitude;
  // Récupère la longitude
  const lon = position_obj.coords.longitude;

  // Met à jour les champs input avec ces coordonnées pour affichage
  document.getElementById("lat").value = lat;
  document.getElementById("lon").value = lon;

  // Affiche la météo pour la position de l'utilisateur avec un nom par défaut "Ma position"
  afficherMeteo(lat, lon, "Ma position");
}

// Fonction pour demander au navigateur la position de l'utilisateur
function getMyPosition() {
  // Vérifie que la géolocalisation est supportée par le navigateur
  if ("geolocation" in navigator) {
    // Demande la position et appelle onPosition en cas de succès, affiche un message en cas d'erreur
    navigator.geolocation.getCurrentPosition(onPosition, () => {
      alert("Impossible de récupérer votre position.");
    });
  } else {
    // Si le navigateur ne supporte pas la géolocalisation, alerte l'utilisateur
    alert("Géolocalisation non supportée !");
  }
}

// Fonction principale appelée au chargement du script (page ou app)
async function main() {
  // On lance la récupération et affichage automatique de la météo de l'utilisateur
  getMyPosition();
}

// Fonction asynchrone pour rechercher une ville selon le nom saisi et récupérer ses coordonnées
async function rechercheVille() {
  // Récupère la ville saisie dans le champ input avec id "city" et enlève les espaces autour
  const ville = document.getElementById("city").value.trim();

  // Si la saisie est vide, on prévient l'utilisateur et on arrête la fonction
  if (!ville) return alert("Veuillez saisir une ville.");

  try {
    // Appelle l'API Open-Meteo de géocodage en y mettant le nom de ville encodé dans l'URL
    // count=1 limite la réponse à un seul résultat (le plus pertinent)
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        ville
      )}&count=1`
    );

    // On récupère la réponse transformée en JSON
    const geoData = await geoRes.json();

    // Si pas de résultat ou résultat vide, on signale une erreur
    if (!geoData.results || !geoData.results[0])
      throw new Error("Ville non trouvée");

    // On récupère le premier résultat, qui sera le plus pertinent
    const loc = geoData.results[0];

    // On met à jour les champs inputs lat et lon avec les coordonnées trouvées
    document.getElementById("lat").value = loc.latitude;
    document.getElementById("lon").value = loc.longitude;

    // On affiche la météo à cette position avec le nom de la ville récupéré
    await afficherMeteo(loc.latitude, loc.longitude, loc.name);
  } catch {
    // En cas d'erreur dans la requête ou résultat vide, on affiche un message d'erreur dans la div result
    document.getElementById("result").textContent = "Ville introuvable.";
  }
}

// Fonction pour afficher la météo à une position donnée (latitude, longitude) et afficher le nom fourni
function afficherMeteo(latitude, longitude, nom = "") {
  // Construit l'URL de l'API Open-Meteo pour récupérer les données météo actuelles
  // timezone=auto permet d'obtenir le bon indicateur jour/nuit selon la position
  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  )
    // Transforme la réponse HTTP en JSON
    .then((response) => response.json())
    // Utilise les données reçues pour mettre à jour l'affichage
    .then((data) => {
      // Si la propriété 'current_weather' n'existe pas, on considère qu'il n'y a pas de données météo valides
      if (!data.current_weather) throw new Error("Pas de météo trouvée");

      // Récupère la température actuelle (en °C)
      const temp = data.current_weather.temperature;

      // Récupère le code météo (correspondant aux codes gérés dans getIconMeteo)
      const code = data.current_weather.weathercode;

      // Récupère si c'est le jour (1) ou la nuit (0) et convertit en booléen true/false
      const isDay = data.current_weather.is_day === 1;

      // Appelle la fonction qui retourne le chemin de l'icône correspondante au code météo et moment
      const icon = getIconMeteo(code, isDay);

      // Tableau avec les ids des inputs et bouton pour appliquer un style commun
      const inputs = ["lat", "lon", "city", "button", "ma position"];

      // Si c'est le jour, applique un style clair
      if (isDay) {
        document.body.style.background = "linear-gradient(#87ceeb, #e6e21dff)";
        document.body.style.color = "#000";

        // Couleurs pour bordures et textes des inputs/jouons
        const border = "thick double #e6e21dff";
        const bg = "white";
        const color = "black";

        // Applique ces styles à tous les éléments identifiés dans le tableau inputs
        inputs.forEach((id) => {
          document.getElementById(id).style.border = border;
          document.getElementById(id).style.background = bg;
          document.getElementById(id).style.color = color;
        });

        // Pour un bouton spécial (ma position), on met une bordure différente
        document.getElementById("ma position").style.border = "thick double #87ceeb";
      } else {
        // Si c'est la nuit, on applique un style sombre
        document.body.style.background = "linear-gradient(#121872ff, #540d66ff)";
        document.body.style.color = "#fff";

        // Couleurs pour bordures et textes des inputs/jouons en mode nuit
        const border = "thick double #b80303ff";
        const bg = "black";
        const color = "white";

        // Applique ces styles à tous les éléments du tableau inputs
        inputs.forEach((id) => {
          document.getElementById(id).style.border = border;
          document.getElementById(id).style.background = bg;
          document.getElementById(id).style.color = color;
        });
      }

      // Sélectionne la div où afficher les résultats météo
      const resultDiv = document.getElementById("result");

      // Vide la div pour ne pas empiler les affichages
      while (resultDiv.firstChild) {
        resultDiv.removeChild(resultDiv.firstChild);
      }

      // Crée un titre h2 et y place le nom de la ville ou lieu
      const h2 = document.createElement("h2");
      h2.textContent = nom;
      resultDiv.appendChild(h2);

      // Crée une image et met la source sur l'icône météo correspondante
      const imageIcone = document.createElement("img");
      imageIcone.src = icon; // chemin de l'image
      imageIcone.alt = "Icône météo"; // texte alternatif pour accessibilité
      imageIcone.style.width = "500px"; // taille largeur
      imageIcone.style.height = "500px"; // taille hauteur
      resultDiv.appendChild(imageIcone);

      // Crée un div pour afficher la température actuelle
      const tempDiv = document.createElement("div");
      tempDiv.style.fontSize = "51px"; // taille du texte
      tempDiv.textContent = `${temp}°C`; // text affichant la température + °C
      resultDiv.appendChild(tempDiv);
    })
    // En cas d'erreur pendant la récupération ou l'affichage, lance un message simple
    .catch(() => {
      // Sélectionne la div résultat
      const resultDiv = document.getElementById("result");

      // Vide la div pour supprimer juste contenu précédent
      while (resultDiv.firstChild) {
        resultDiv.removeChild(resultDiv.firstChild);
      }

      // Crée un paragraphe avec message erreur
      const errorP = document.createElement("p");
      errorP.textContent = "Erreur lors du chargement de la météo.";
      resultDiv.appendChild(errorP);
    });
}

// Lancer la fonction principale main() au chargement du script (de la page)
main();
