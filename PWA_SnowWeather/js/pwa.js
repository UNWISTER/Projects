/******************************************************************************
                        Déclaration des constantes
*******************************************************************************/

const RECHERCHE_INPUT = document.getElementById("recherche_input");
const RES_RECHERCHE = document.getElementById("recherche");
const INFO_STATION = document.getElementById("res_recherche");
const RES_ENNEIGEMENT = document.getElementById("res_enneigement");
const RES_BRA = document.getElementById("res_bra");
const PRE_ENNEIGEMENT = document.getElementById("legende_pre");
const POST_ENNEIGEMENT = document.getElementById("legende_post");
const POST_METEO = document.getElementById("prevision_meteo");
const GRAPH_PRE_ENNEIGEMENT = document.getElementById('pre_enneigement');
const GRAPH_POST_ENNEIGEMENT = document.getElementById('post_enneigement');
const MORE_METEO1 = document.getElementById("more_meteo1");
const MORE_METEO2 = document.getElementById("more_meteo2");
const MORE_METEO3 = document.getElementById("more_meteo3");
const IMG_ACCUEIL = document.getElementById("img_accueil");
const BOUTON_MAP = document.getElementById("logo_map");
const BOUTON_MENU = document.getElementById("logo_menu");
const RECHERCHE_INPUT_MAP = document.getElementById("recherche_input_map");
const LIST_STATION_MAP = document.getElementById("liste_stations_map");
const MARKERS = new L.layerGroup;
const ACTIVE_RAYON = document.getElementById("active_rayon");
const IS_RAYON = document.getElementById("is_rayon");
const CHOIX_RAYON = document.getElementById("rayon");
const OUTPUT_RAYON = document.getElementById("rangeValue");
const BOUTON_FAVORI = document.getElementById("bouton_favori");
const MENU_FAVORI = document.getElementById("menu_favori");
const RECHERCHE_VOCALE_MENU = document.getElementById("recherche_voix_menu");
const RETOUR_ACCUEIL = document.getElementById("retour_accueil");
const PAGE_RECHERCHE = document.getElementById("page_default")
const NOTIF_OFFLINE = document.getElementById("notif_hors_ligne");
const NOTIF_AJOUT_FAV = document.getElementById("notif_ajout_favori");
const NOTIF_SUPP_FAV = document.getElementById("notif_supp_favori");





const WEATHER_CODE = {
  0: "Ciel dégagé",
  1: "Quelques nuages",
  2: "Partiellement nuageux",
  3: "Nuages",
  45: "Brouillard",
  48: "Brouillard avec givre",
  51: "Bruine légère",
  53: "Bruine modérée",
  55: "Bruine dense",
  61: "Pluie légère",
  63: "Pluie modérée",
  65: "Pluie forte",
  66: "Pluie verglaçante légère",
  67: "Pluie verglaçante forte",
  71: "Neige légère",
  73: "Neige modérée",
  75: "Neige forte",
  77: "Grains de neige",
  80: "Averses de pluie légères",
  81: "Averses de pluie modérées",
  82: "Averses de pluie violantes",
  85: "Averses de neige légères",
  86: "Averses de neige forte",
  95: "Orages",
  96: "Orage avec grêle légère",
  99: "Orage avec grêle forte"
  };

/***********************************************************************************/

/******************************************************************************
                        Déclaration des variables
*******************************************************************************/
let trouve;
let stations
let n
let graph_post_enneigement = false;
let graph_pre_enneigement = false;
let latitude = false;
let longitude = false;
let is_map = false;
let is_circle = false;
let options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};
let plan = null;
let circle = null;
let icon_rouge = L.icon(
{
iconUrl: "./lib/leaflet/dist/images/marker-icon-rouge.png",
iconAnchor: [16, 32], // Position de l'icone (ce qu'on a créé) par rapport au marker (ce qu'on place)
popupAnchor: [0, -32] // Position du popup
});
let index_stations = 0;
let filtre;

/***********************************************************************************/


/******************************************************************************
                        Ajout des écouteurs d'évenements
*******************************************************************************/

RECHERCHE_INPUT.addEventListener("input", liste_recherche);
RECHERCHE_INPUT_MAP.addEventListener("input", liste_recherche);
BOUTON_MAP.addEventListener("click", initMap);
BOUTON_MENU.addEventListener("click", affiche_img_accueil);
ACTIVE_RAYON.addEventListener("click", active_rayon);
CHOIX_RAYON.addEventListener("input", active_rayon);
BOUTON_FAVORI.addEventListener("click", affiche_favori);
RECHERCHE_VOCALE_MENU.addEventListener("click", recherche_vocal);
RETOUR_ACCUEIL.addEventListener("click", affiche_img_accueil);

/***********************************************************************************/

/******************************************************************************
                        Appel des fonctions de bases
*******************************************************************************/

setInterval(is_offline, 10000) // Vérificationn de la connexion du client toutes les 10secondes (10000)
update_massifs(); // Récupération de la liste des massifs
update_stations();  // Récupération de la liste des stations
update_images();  // Récupération des images
localisation(); // Récupération de la géolocalisation du client

/***********************************************************************************/

function is_offline()
{
  console.log("is_offline()")
  if (!navigator.onLine)
  {
    bootstrap.Toast.getOrCreateInstance(NOTIF_OFFLINE).show() // Si le client est hors ligne alors on affiche une notification (voir HTML pour contenu)
  }
}

function affiche_menu() // Fonction pour réinitialiser l'affichage
{
  console.log("affiche_menu()")
  window.scrollTo({ top: 0, behavior: "smooth" }); // Afficher la page depuis le début

  /**********************************************************************************
    La classe "pas_affiche" permet de rendre le contenu invisible si elle est affecté.
    Ici on ajoute et on enleve cette classe en fonction de ce qu'on veut afficher
  ************************************************************************************/

  document.getElementById("main_container").classList.remove("pas_affiche");  
  document.getElementById("menu_map").classList.add("pas_affiche"); 
  MENU_FAVORI.classList.add("pas_affiche");
  BOUTON_MENU.classList.add("pas_affiche");
  BOUTON_MAP.classList.remove("pas_affiche");
  BOUTON_FAVORI.classList.remove("pas_affiche");
  PAGE_RECHERCHE.classList.add("pas_affiche");

  /***********************************************************************************/
}

async function get_sans_clef(url, id, option)
{
  try
  {
    const RESPONSE = await fetch(url);
    console.log("Requête terminée et réponse prête");
    if( ! RESPONSE.ok)
    {
      throw new Error("Erreur HTTP : ", RESPONSE.status);
    }

    let data2;
    switch (id) // En fonction de la valeur de l'id passé en paramètre à l'appel de la fonction on traite l'information différemment mais le principe reste le même comme expliquer pour le premier cas 
    {
      case "meteo":
        data2 = await RESPONSE.json(); // ou await RESPONSE.text()
        console.log("Traitement local de la réponse");
        console.log(data2);
        localStorage.setItem("meteo_station_"+option, JSON.stringify(data2)); // On stock les données météo de la station demandé pour les avoirs en hors ligne
        
        /*****************************************************
          Appel des fonctions pour traiter les données reçu
        ******************************************************/

        affiche_meteo(data2); 
        affiche_meteo_prevision(data2);

        /*****************************************************/

        break;

      case "more":

        // Ici on ne stockera pas l'information en local car ce sont des données précise heure par heure

        data2 = await RESPONSE.json(); // ou await RESPONSE.text()
        console.log("Traitement local de la réponse");
        console.log(data2);
        
        more_meteo(data2);
        break;

      case "images":
        
        // Ici le principe est différent, on récupere la réponse de l'API pixabai puis on refait une requête pour télécharger toutes les images qu'on a reçu

        data2 = await RESPONSE.json(); // ou await RESPONSE.text()
        console.log("Traitement local de la réponse");
        console.log(data2);
        for (let i=0; i<data2.hits.length; i++)
        {
          await get_sans_clef(data2.hits[i].webformatURL, "download_images");
        }
        break;

      case "download_images":

        // C'est ici qu'on téléchargera les images

        data2 = await RESPONSE.blob(); // On récupere les données en binaire

        /********************************************************************
                          Stockage des images dans l'IndexDB
        ********************************************************************/
        donnee =
        {
          nom: stations[index_stations].nom.toUpperCase(), // C'est cette valeur qu'on utilisera pour reprendre l'image
          blob: data2 // Ici ce sont les données de l'image en binaire
        }
        const BDD_IMAGES = window.indexedDB.open("images_stations", 1); // On essaie d'ouvrir la BDD

        BDD_IMAGES.onsuccess = function(event)  // Si elle réussi (.onsuccess) alors on écrit l'image dans le stockage "images" de la BDD et une fois terminé on affiche un msg de log
        {
          event.target.result.transaction(["images"], "readwrite").objectStore("images").put(donnee)
          event.target.result.transaction(["images"], "readwrite").oncomplete = function(event)
          {
            console.log("image stockée")
          }
        }
        index_stations ++ // comme on passe plusieurs fois dans cette fonction car elle est appelé dans une boucle for juste au dessus, alors on incrémente la variable globale index_stations

        // Ici on ne gere pas l'erreur de l'ouverture de la bdd (.onerror) car elle est déja créer à l'appel de la fonction update_images() au début
    }

  }
  catch (error)
  {
    console.error("Erreur lors de la requête :", error);
  }
}


async function get(url, id, option) // Cette fonction est identique à get_sans_clef() au détail près que l'api demande une "apikey" pour les requêtes
{
    try
    {
      const RESPONSE = await fetch(url, {
        method: 'GET',
        headers: {
            "apikey": "eyJ4NXQiOiJZV0kxTTJZNE1qWTNOemsyTkRZeU5XTTRPV014TXpjek1UVmhNbU14T1RSa09ETXlOVEE0Tnc9PSIsImtpZCI6ImdhdGV3YXlfY2VydGlmaWNhdGVfYWxpYXMiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1bndpc3RlckBjYXJib24uc3VwZXIiLCJhcHBsaWNhdGlvbiI6eyJvd25lciI6InVud2lzdGVyIiwidGllclF1b3RhVHlwZSI6bnVsbCwidGllciI6IlVubGltaXRlZCIsIm5hbWUiOiJEZWZhdWx0QXBwbGljYXRpb24iLCJpZCI6MzYxNzcsInV1aWQiOiI2YWNlYmZiZC0wMWY0LTRlNmYtOWY3Yi0xYmQ1MjQ5YTRjMzQifSwiaXNzIjoiaHR0cHM6XC9cL3BvcnRhaWwtYXBpLm1ldGVvZnJhbmNlLmZyOjQ0M1wvb2F1dGgyXC90b2tlbiIsInRpZXJJbmZvIjp7IjUwUGVyTWluIjp7InRpZXJRdW90YVR5cGUiOiJyZXF1ZXN0Q291bnQiLCJncmFwaFFMTWF4Q29tcGxleGl0eSI6MCwiZ3JhcGhRTE1heERlcHRoIjowLCJzdG9wT25RdW90YVJlYWNoIjp0cnVlLCJzcGlrZUFycmVzdExpbWl0IjowLCJzcGlrZUFycmVzdFVuaXQiOiJzZWMifX0sImtleXR5cGUiOiJQUk9EVUNUSU9OIiwic3Vic2NyaWJlZEFQSXMiOlt7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiRG9ubmVlc1B1YmxpcXVlc0JSQSIsImNvbnRleHQiOiJcL3B1YmxpY1wvRFBCUkFcL3YxIiwicHVibGlzaGVyIjoiYmFzdGllbmciLCJ2ZXJzaW9uIjoidjEiLCJzdWJzY3JpcHRpb25UaWVyIjoiNTBQZXJNaW4ifV0sImV4cCI6MTc2ODk3NDM5MiwidG9rZW5fdHlwZSI6ImFwaUtleSIsImlhdCI6MTc2ODg4Nzk5MiwianRpIjoiNzEyYmM4NGUtNTExZS00MWQ2LWIzMDAtZGI1NDhhOTU0Y2Q5In0=.QzyVPICak5xsagKOYCflIoknS9EWGpmmkk_NEhrXku3V_-zhHEwheAmM4rzcVWFtJEw2CNQuO7wobykZZaKar6TEGoxe2-8hXQstiYs_xQJJYRI0NvTjEc0mHsVf_tv1v_7aqjNnZ6BUH0Gk74NcLQxXAu_Z7TKs09X4y26rnxFgYyfR7jR6LD2pzOcRjfr_tUHudps74C3L3-7_3eShz9P73-AMl7Wm7Lq6M3Ita7ih3wWTnm7g3ah__wU0exIE9UdRod5KVdwT7fuE6I4rjTuUkmystM5DG-jYOK2RIunlbFb0axptAceVc9Yt49ctUqDB_uZIdQvAY9xcGgtrJg==",
            "accept": "*/*",
        },
      });
      console.log("Requête terminée et réponse prête");
      if( ! RESPONSE.ok)
      {
        throw new Error("Erreur HTTP : ", RESPONSE.status);
      }
      console.log("Traitement local de la réponse");
      let data;
      switch(id)
      {
        case "massifs":
          data = await RESPONSE.text(); // ou await RESPONSE.text()
          localStorage.setItem("data_massifs", data);
          console.log(JSON.parse(localStorage.getItem("data_massifs")));
          break;

        case "bra":

          // Ici on stock le BERA dans la BDD pour pouvoir y acceder hors ligne

          data = await RESPONSE.blob(); // ou await RESPONSE.text()

          donnee =
          {
            nom: option,
            blob: data
          }
          const BDD_IMAGES = window.indexedDB.open("images_stations", 1);

          BDD_IMAGES.onsuccess = function(event)
          {
            event.target.result.transaction(["images"], "readwrite").objectStore("images").put(donnee)
            event.target.result.transaction(["images"], "readwrite").oncomplete = function(event)
            {
              console.log("BRA stockée")
            }
          }
          affiche_pdf_bra(data); // Appel de la fonction pour afficher le BERA


          break;

        case "stations":
          data = await RESPONSE.text();
          localStorage.setItem("data_stations", data);
          console.log(JSON.parse(localStorage.getItem("data_stations")));
          break;

        case "meteo":
          data = await RESPONSE.text();
          localStorage.setItem("data_meteo", data);
          console.log(localStorage.getItem("data_meteo"));
          break;
      }
    }

    catch (error)
    {
      console.error("Erreur lors de la requête :", error);
    }
}

async function update_stations()
{
  console.log("update_stations()");
  if(localStorage.getItem("data_stations")) // Si les stations sont dans le local storage on les utilises sinon on fait la requêtes et on met à jour l'objet "stations" ainsi que la variable globale "n"
  {
    console.log(JSON.parse(localStorage.getItem("data_stations")));
  }
  else
  {
    await get("./js/stations_ski_alpes_france.json", "stations")
  }
  stations = JSON.parse(localStorage.getItem("data_stations"));
  n = stations.length;
}

async function update_images()
{
  console.log("update_images()");
  const BDD_IMAGES = window.indexedDB.open("images_stations", 1); // On essaie d'ouvrir la BDD
  BDD_IMAGES.onerror = function (event) // Gestion des erreurs
  {
    console.log("erreur avec la bdd");
  }
  BDD_IMAGES.onsuccess = function (event) // Si elle s'ouvre correctement on appel la fonction pour afficher les images
  {
    console.log("ouverture bdd réussie");
    affiche_img_accueil();
  }
  BDD_IMAGES.onupgradeneeded = async function (event) // Cette évenement se produit si la BDD n'est pas créer ou si le numéro de version est changé
  {
    event.target.result.createObjectStore("images", {keyPath : "nom"}); // On créer l'espace de stockage dans la BDD, les images seront identifiées par leur "keyPath", ici leur nom
    console.log("bdd créé");
    await get_sans_clef("https://pixabay.com/api/?key=54187326-38043289379cc9208ae4f89cd&q=ski%20resort&min_width=1920&min_height=1080&per_page="+n+"&image_type=photo", "images"); // On fait la requête pour stocker les images dans la BDD
    affiche_img_accueil(); // Appel de la fonction pour afficher les images
  }
}

function update_massifs()
{
  console.log("update_massifs()");
  if(localStorage.getItem("data_massifs")) // Si les massifs sont dans le local storage on les utilise sinon on fait la requête
  {
      console.log(JSON.parse(localStorage.getItem("data_massifs")));
  }
  else
  {
    get("https://public-api.meteofrance.fr/public/DPBRA/v1/liste-massifs", "massifs")
  }
}



function update_bra(url, nom) // Ici on tente la requête même si le BERA est dans le local storage pour avoir le BERA le plus fidèle possible 
// Pour le BERA le local storage est juste la en cas de "secour" si le client est hors ligne
{
  console.log("update_bra()");
  get(url, "bra", nom);
}

function update_meteo(url, nom) // Idemn que pour le BERA
{
  console.log("update_meteo()");
  get_sans_clef(url, "meteo", nom);
}

function update_more_meteo(event)
{
  console.log("update_more_meteo()");
  MORE_METEO1.scrollIntoView({ behavior: 'smooth' }); // On déplace la page pour afficher la météo heure par heure
  const COORD = event.target.value.split(' '); // On récupère la value du bouton "Plus d'info" sous forme "latitude longitude nom" donc on le reformate en tableau et on indique que les valeurs sont séparées par " "
  get_sans_clef("https://api.open-meteo.com/v1/forecast?latitude="+COORD[0]+"&longitude="+COORD[1]+"&hourly=,temperature_2m,weather_code,wind_speed_10m,snowfall&forecast_days=3", "more");
}

function recup_images()
{
  console.log("recup_images()");
  console.log(IMG_ACCUEIL.children.length);
  const BDD_IMAGES = window.indexedDB.open("images_stations", 1); // On essaie d'ouvrir la BDD

  BDD_IMAGES.onsuccess = function(event) // Si elle réussi alors on récupere l'image
  // Les images sont créer avec l'id img et un nombre ainsi que l'alt qui est le nom de la station, on se sert de ça pour associer l'id a l'image car la key de l'image est le nom de la station
  {
    for (let i=0; i<IMG_ACCUEIL.children.length; i++) // IMG_ACCUEIL.children.length récupère le nombre d'enfant présent dans la div pour afficher les images donc le nombre d'images car il n'y a que ca dedans
    {
      event.target.result.transaction(["images"], "readonly").objectStore("images").get(document.getElementById("img"+i).alt.toUpperCase()).onsuccess = function(event)
      {
        document.getElementById("img"+i).src = URL.createObjectURL(event.target.result.blob); // Si on récupère l'image alors on créer un lien grace au binaire de l'image et on l'associe à la source de l'image souhaité
      }
    }
  }
}

function affiche_img_accueil(event)
{
  console.log("affiche_img_accueil()")
  console.log(event);

  /***********************************************************************
                    Réinitialisation de l'affiche
  ***********************************************************************/
  IMG_ACCUEIL.innerHTML = ""; 
  MENU_FAVORI.innerHTML = "";
  document.getElementById("main_container").classList.remove("pas_affiche");
  document.getElementById("menu_map").classList.add("pas_affiche");
  MENU_FAVORI.classList.add("pas_affiche");
  BOUTON_MENU.classList.add("pas_affiche");
  BOUTON_MAP.classList.remove("pas_affiche");
  BOUTON_FAVORI.classList.remove("pas_affiche");
  PAGE_RECHERCHE.classList.add("pas_affiche");

  /***********************************************************************/

  let str = ""; // Initialisation de la chaine de caractère qu'on va ajouter à la page
  let liste_favorie = []; // Initialisation d'un tableau pour stocker les favoris et gérer l'affichage des boutons en fonction


  if (localStorage.getItem("stations_favories")) // Si les favoris sont dans le local storage alors on recupère la liste et on la stocke dans le tableau liste_favorie
  {
    liste_favorie = JSON.parse(localStorage.getItem("stations_favories"))

    for (let i=0; i<n; i++)
    {
      if (liste_favorie.includes(stations[i].nom.toUpperCase())) // Ici on verifie à chaque fois si la station est dans la liste des favoris
      // Si elle est présente dans la liste des favoris alors on affichera le bouton pour la supprimer sinon pour l'ajouter
      {
        str += "<div class='col-sm'><div class='card h-100 shadow mb-5' style='width: 25rem;'> <img id=\"img"+i+"\" class='card-img-top object-fit-cover' alt=\""+stations[i].nom+"\"> <div class='card-body'> <h5 class='card-title'>"+stations[i].nom+"</h5><a id='info"+i+"' title=\""+stations[i].nom+"\" class='btn btn-primary'>Voir les infos</a><button class='btn btn-secondary m-1' id=\"supp_favori_accueil"+i+"\" value=\""+stations[i].nom+"\">Supprimer des favoris</button></div></div></div>"
      }
      else
      {
        str += "<div class='col-sm'><div class='card h-100 shadow mb-5' style='width: 25rem;'> <img id=\"img"+i+"\" class='card-img-top object-fit-cover' alt=\""+stations[i].nom+"\"> <div class='card-body'> <h5 class='card-title'>"+stations[i].nom+"</h5><a id='info"+i+"' title=\""+stations[i].nom+"\" class='btn btn-primary'>Voir les infos</a><button class='btn btn-primary m-1' id=\"ajout_favori_accueil"+i+"\" value=\""+stations[i].nom+"\">Ajoutez aux favoris</button></div></div></div>"
      }
    }
  }
  else  // Si la liste des favoris n'existe pas alors toutes les images on le boutons pour les ajouter
  {
    for (let i=0; i<n; i++)
    {
     str += "<div class='col-sm'><div class='card h-100 shadow mb-5' style='width: 25rem;'> <img id=\"img"+i+"\" class='card-img-top object-fit-cover' alt=\""+stations[i].nom+"\"> <div class='card-body'> <h5 class='card-title'>"+stations[i].nom+"</h5><a id='info"+i+"' title=\""+stations[i].nom+"\" class='btn btn-primary'>Voir les infos</a><button class='btn btn-primary m-1' id=\"ajout_favori_accueil"+i+"\" value=\""+stations[i].nom+"\">Ajoutez aux favoris</button></div></div></div>"
    }
  }

  IMG_ACCUEIL.innerHTML = str; // Ajout du contenu à la page
  for (let i=0; i<n; i++) // Ajout des listeners une fois le contenu ajouté
  // Ici on regardera pour chaque stations si c'est le bouton ajouter ou supprimer qui est présent
  // Le bouton info est dans tous les cas présent
  {
    document.getElementById("info"+i).addEventListener("click", info_station);

    if (document.getElementById("ajout_favori_accueil"+i))
    {
    document.getElementById("ajout_favori_accueil"+i).addEventListener("click", ajout_favori);
    }

    if (document.getElementById("supp_favori_accueil"+i))
    {
    document.getElementById("supp_favori_accueil"+i).addEventListener("click", supp_favori);
    }
  }
  recup_images(); // A ce stade les "card" sont créer mais les images n'ont pas de source, c'est cette fonction qui va associez les images aux stations comme décrit plus haut
}

function liste_recherche(event)
{
  console.log("liste_recherche()");
  MENU_FAVORI.innerHTML = ""; // Réinitialisation du contenu de la page pour afficher les bonnes stations
  PAGE_RECHERCHE.classList.add("pas_affiche"); // On masque le résultat d'une potentiel précedente recherche
  const REGEX = new RegExp("[a-zA-Z]"); // Ce regex va nous servir pour la recherche sur la map
  IMG_ACCUEIL.innerHTML = ""; // Réinitialisation du contenu de la page pour afficher les bonnes stations
  LIST_STATION_MAP.innerHTML = "";  // Réinitialisation du contenu de la page pour afficher les bonnes stations
  let i = 0;
  let is_map = false; // Ce booléen va nous servir pour savoir si on est dans le menu classique ou alors sur la map
  if (typeof event === "string") // Si l'event est de type string alors c'est que la fonction est appelé par l'ajout ou la suppresion d'un favori
  // La valeur de l'event est l'input qui était présent dans la barre de recherche lors de la suppression
  {
    filtre = event.toUpperCase();
  }
  else // Sinon le filtre prend pour valeur la value qui est présent dans la barre de recherche à chaque changement
  {
    filtre = event.target.value.toUpperCase();
    if (event.target.id == "recherche_input_map") // On vérifie juste si l'input provient de la map ou du menu classique
    {
      is_map = true;
    }
  }

  let nom;
  if (is_map) // Si on est dans la map alors on vérifie grace au REGEX si l'input n'est pas juste des espaces vide, dans ce cas on affichera toutes les stations sur la map
  {
    if (!REGEX.test(event.target.value))
    {
      initMap("reset");
    }
    for (const STATION of stations) // Ici on va vérifier si le noms des stations contient ce qui est marqué dans la barre de recherche, si c'est la cas alors les ajoutes dans la balise "datalist" pour que le client puisse les séléctionner
    {
      nom = STATION.nom.toUpperCase();
      if (nom.includes(filtre))
      {
        option = document.createElement("option");

        option.value = nom ;
        LIST_STATION_MAP.appendChild(option);
      }
    }
    RECHERCHE_INPUT_MAP.addEventListener("change", initMap); // A chaque fois que la client sélectionnera une stations en fonction de sa recherche on appelera la fonction pour l'afficher sur la map
  }
  else // Ici on est dans le menu principal, c'est le même principe que pour la fonction affiche_img_accueil() sauf que l'on vérifie aussi si ce qui est marqué dans la barre de recherche est contenu dans le nom des stations en plus de savoir si elles sont dans les favoris pour les boutons
  {
    if (localStorage.getItem("stations_favories")) 
    {

      liste_favorie = JSON.parse(localStorage.getItem("stations_favories"));

      for (const STATION of stations)
      {
        nom = STATION.nom.toUpperCase();
        if (nom.includes(filtre))
        {
          if (liste_favorie.includes(nom))
          {
            IMG_ACCUEIL.innerHTML += "<div class='col-sm'><div class='card h-100 shadow mb-5' style='width: 18rem;'> <img id=\"img"+i+"\" class='card-img-top' alt=\""+nom+"\"> <div class='card-body'> <h5 class='card-title'>"+nom+"</h5><a id='bouton_info"+i+"' title=\""+nom+"\" class='btn btn-primary'>Voir les infos</a><button class='btn btn-secondary m-1' id=\"supp_favori_recherche"+i+"\" value=\""+nom+"\">Supprimer des favoris</button></div></div></div>"
            i += 1;
          }
          else
          {
            IMG_ACCUEIL.innerHTML += "<div class='col-sm'><div class='card h-100 shadow mb-5' style='width: 18rem;'> <img id=\"img"+i+"\" class='card-img-top' alt=\""+nom+"\"> <div class='card-body'> <h5 class='card-title'>"+nom+"</h5><a id='bouton_info"+i+"' title=\""+nom+"\" class='btn btn-primary'>Voir les infos</a><button class='btn btn-primary m-1' id=\"ajout_favori_recherche"+i+"\" value=\""+nom+"\">Ajoutez aux favoris</button></div></div></div>"
            i += 1;
          }
        }
      }
    }
    else
    {
      for (const STATION of stations)
      {
        nom = STATION.nom.toUpperCase();
        if (nom.includes(filtre))
        {
          IMG_ACCUEIL.innerHTML += "<div class='col-sm'><div class='card h-100 shadow mb-5' style='width: 18rem;'> <img id=\"img"+i+"\" class='card-img-top' alt=\""+nom+"\"> <div class='card-body'> <h5 class='card-title'>"+nom+"</h5><a id='bouton_info"+i+"' title=\""+nom+"\" class='btn btn-primary'>Voir les infos</a><button class='btn btn-primary m-1' id=\"ajout_favori_recherche"+i+"\" value=\""+nom+"\">Ajoutez aux favoris</button></div></div></div>"
          i += 1;
        }
      }
    }

    for (let indice = 0; indice<IMG_ACCUEIL.children.length; indice++) // Ajout des listener comme dans la fonction affiche_img_accueil()
    {
      document.getElementById("bouton_info" + indice).addEventListener("click", info_station);

      if (document.getElementById("ajout_favori_recherche"+indice))
      {
        document.getElementById("ajout_favori_recherche"+indice).addEventListener("click", ajout_favori);
      }

      if (document.getElementById("supp_favori_recherche"+indice))
      {
        document.getElementById("supp_favori_recherche"+indice).addEventListener("click", supp_favori);
      }
    }
    recup_images(); // Affichage des images comme dans la fonction affiche_img_accueil()
  }
}


function recherche_vocal(event)
{
  console.log("recherche_vocal()");
  const IS_SPEECH = window.SpeechRecognition || window.webkitSpeechRecognition; // On vérifie si le navigateur est compatible avec l'api Web Speech

  if (!IS_SPEECH) // Si ce n'est pas le cas alors on affiche un msg de log
    {
      console.log("Reconnaissance vocal indisponible");
    }
    else
    {
      const RECHERCHE_VOCALE = new IS_SPEECH(); // Sinon on créer une nouvelle reconnaissance vocal
      RECHERCHE_VOCALE.lang = "fr-FR"; // On précise la langue
      RECHERCHE_VOCALE.interimResults = false; // On veut seulement le résultat final, pas de résultat intermediaire

      RECHERCHE_VOCALE.start(); // On lance l'enregistrement
      RECHERCHE_VOCALE.onresult = function(event) // Une fois terminé on récupère le résultat puis on appel la fonction liste_recherche() pour faire une recherche de la station en fonction du résultat
      {
      console.log(event.results[0][0].transcript);
      RECHERCHE_INPUT.value = event.results[0][0].transcript; // On l'écrit dans la barre de recherche pour plus de cohérence
      liste_recherche(RECHERCHE_INPUT.value);
      console.log("Recherche vocal terminé");
      };
    }
  }


function info_station(event)
{
  console.log("info_station()");
  window.scrollTo({ top: 0, behavior: "smooth" });

  /***********************************************************************
                    Réinitialisation de l'affiche
  ***********************************************************************/
  PAGE_RECHERCHE.classList.remove("pas_affiche");
  MENU_FAVORI.classList.add("pas_affiche");
  PAGE_RECHERCHE.classList.remove("pas_affiche");

  BOUTON_MAP.classList.remove("pas_affiche");
  BOUTON_MENU.classList.add("pas_affiche");
  BOUTON_FAVORI.classList.remove("pas_affiche");
  document.getElementById("menu_map").classList.add("pas_affiche");
  document.getElementById("main_container").classList.remove("pas_affiche");

  RES_BRA.width = 0;
  RES_BRA.height = 0;

  

  MENU_FAVORI.innerHTML = "";
  INFO_STATION.innerHTML = "";
  POST_ENNEIGEMENT.innerHTML = "";
  POST_METEO.innerHTML = "";
  PRE_ENNEIGEMENT.innerHTML = "";
  IMG_ACCUEIL.innerHTML = "";
  MORE_METEO1.innerHTML = "";
  MORE_METEO2.innerHTML = "";
  MORE_METEO3.innerHTML = "";
  RECHERCHE_INPUT.blur();

  /*************************************************************************/

  let index = 0;
  let liste_favorie = [];
  let is_info = false;
  trouve = false

  if (typeof event === "string") // On verifie où est appeler la fonction pour l'affichage
  {
    console.log("supprimé depuis info")
    is_info = true
  }

  if (!is_info) // Si ce n'est pas depuis la page d'information alors elle peut être appeler depuis l'accueil ou la map
  {
    if (event.target._leaflet_id)
    {
      nom = event.target.id.toUpperCase();
    }
    else if (event.target.title)
    {
      nom = event.target.title.toUpperCase();
    }
    else
    {
      nom = event;
    }
  }
  else
  {
    nom = event;
  }


  do // On cherche la station voulu puis on stop la boucle quand c'est le cas
  {
    if (nom == stations[index].nom.toUpperCase())
    {
      INFO_STATION.innerHTML += "<h1 id='titre_station' class='title is-1'>"+nom+"<h1><br>"
      INFO_STATION.innerHTML += "Altitude du village : "+stations[index].altitude_village+"<br>"
      INFO_STATION.innerHTML += "Altitude max du domaine : "+stations[index].altitude_max+"<br>"
      INFO_STATION.innerHTML += "Massif : "+stations[index].massif+"<br>"
      INFO_STATION.innerHTML += "<button id='bra' class='btn btn-primary m-1' value='"+stations[index].massif+"'>Obtenir le BRA</button>"
      INFO_STATION.innerHTML += "<button id='more_info_meteo' class='btn btn-primary m-1' value='"+stations[index].latitude+" "+stations[index].longitude+"'>Plus d'info sur la météo</button>"
      INFO_STATION.innerHTML += "<button id='go_map' class='btn btn-primary m-1' value=\""+stations[index].latitude+"|"+stations[index].longitude+"|"+stations[index].nom+"\">Voir sur la map</button><br>"


      if (localStorage.getItem("stations_favories")) // On regarde si elle est dans les favoris, on adapte les boutons et on ajoute les listeners en conséquence 
      {
        liste_favorie = JSON.parse(localStorage.getItem("stations_favories"));

        if (liste_favorie.includes(nom))
        {
          INFO_STATION.innerHTML += "<button id=\"supp_favori_info"+index+"\" value=\""+stations[index].nom+"\" class='btn btn-secondary'>Supprimez des favoris</button><br>"
          document.getElementById("supp_favori_info"+index).addEventListener("click", supp_favori);
        }
        else
        {
          INFO_STATION.innerHTML += "<button id=\"ajout_favori_info"+index+"\" value=\""+stations[index].nom+"\" class='btn btn-primary'>Ajoutez aux favori</button><br>"
          document.getElementById("ajout_favori_info"+index).addEventListener("click", ajout_favori);
        }
      }
      else
      {
        INFO_STATION.innerHTML += "<button id=\"ajout_favori_info"+index+"\" value=\""+stations[index].nom+"\" class='btn btn-primary'>Ajoutez aux favori</button><br>"
        document.getElementById("ajout_favori_info"+index).addEventListener("click", ajout_favori);
      }

      if (navigator.onLine) // Pour afficher les prévisions météos on regarde si le client est en ligne pour avoir les données les plus précises sinon on utilise le local storage si il est présent
      {
        update_meteo("https://api.open-meteo.com/v1/forecast?latitude="+stations[index].latitude+"&longitude="+stations[index].longitude+"&daily=weather_code,temperature_2m_max,temperature_2m_min,snowfall_sum,wind_speed_10m_max&past_days=7", stations[index].nom)
      }
      else if (!navigator.onLine && localStorage.getItem("meteo_station_"+stations[index].nom))
      {
        console.log("info recup hors ligne")
        affiche_meteo(JSON.parse(localStorage.getItem("meteo_station_"+stations[index].nom)));
        affiche_meteo_prevision(JSON.parse(localStorage.getItem("meteo_station_"+stations[index].nom)));
      }
      trouve = true
    }
    else
    {
        index += 1
    }
  }
  while (trouve == false && index<n)

  // On ajoute les listener

  const BRA = document.getElementById("bra");
  const MORE_INFO_METEO = document.getElementById("more_info_meteo");
  BRA.addEventListener("click", affiche_bra);
  MORE_INFO_METEO.addEventListener("click", update_more_meteo);
  document.getElementById("go_map").addEventListener("click", initMap);

}


function affiche_bra(event)
{
  console.log("affiche_bra()");
  let index = 0;
  trouve = false
  massif = event.target.value.toUpperCase();
  const MASSIFS = JSON.parse(localStorage.getItem("data_massifs"))

  do // On recherche le massifs de la station dans la liste des massifs pour obtenir son ID
  {
    if (massif == MASSIFS.features[index].properties.title.toUpperCase())
    {
      if (navigator.onLine) // Si on est en ligne alors on fait la requête pour le BERA pour avoir des données fiable
      {
      update_bra("https://public-api.meteofrance.fr/public/DPBRA/v1/massif/BRA?id-massif="+MASSIFS.features[index].properties.code+"&format=pdf", "data_bra_"+MASSIFS.features[index].properties.code)
      }
      else if (!navigator.onLine) // Sinon on regarde si le BRA est présent dans la BDD et on l'affiche en hors ligne
      {
        console.log("affiche sans connexion")
        const BDD_IMAGES = window.indexedDB.open("images_stations", 1);

        BDD_IMAGES.onsuccess = function(event)
        {
          event.target.result.transaction(["images"], "readonly").objectStore("images").get("data_bra_"+MASSIFS.features[index].properties.code).onsuccess = function(event)
          {
             affiche_pdf_bra(event.target.result.blob);
          }
        }
      }
      console.log("trouvé")
      trouve = true
    }
    else
    {
        index += 1
    }
  }
  while (trouve == false && index<n)
}

async function affiche_pdf_bra(donnee)
{
  console.log("affiche_pdf()")

  // On réinitialise la taille du canva au cas ou il aurait déjà été affiché
  RES_BRA.width = 0;
  RES_BRA.height = 0;

  let loadingTask = pdfjsLib.getDocument(URL.createObjectURL(donnee)) // On créer un lien pour afficher l'image à l'aide de la libraire pdfjs
  let pdf = await loadingTask.promise;  // On attend que pdfjs récupère toutes les infos du PDF
  let page = await pdf.getPage(1) // Une fois terminé on récupere la page 1
  let viewport = page.getViewport({ scale: 1 }) // Une fois terminé on règle la taille

  // On redonne une taille au canva en fonction de la taille du PDF

  RES_BRA.width = viewport.width;
  RES_BRA.height = viewport.height;

  let context = RES_BRA.getContext('2d'); 
  let renderContext =
  {
    canvasContext: context,
    viewport: viewport
  };

  await page.render(renderContext); // On affiche le BERA en fonction des paramètres donné au dessus
}


function affiche_meteo(donnee)
{

  PRE_ENNEIGEMENT.innerHTML = "";
  let date_brut;
  let date;
  let date_formate = [];
  let histogramme;
  let donnee_enneigement = [];
  for (let i=0; i<7; i++)
  {
    date_brut = donnee.daily.time[i]; // On récupère les dates dans la réponses de l'api
    date = new Date(date_brut); // On créer une nouvelle date a partir de notre date brut pour la reformaté

    // Ici on la reformate en DD/month/YYYY

    date_formate.push(date.toLocaleDateString("fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }));
    
    PRE_ENNEIGEMENT.innerHTML += "<span>"+date_formate[i]+"</span>"; // On ajoute les dates à notre graphique


    donnee_enneigement.push(donnee.daily.snowfall_sum[i]) // On récupere les données de chute de neige des 7 derniers jours
  }

  // Création de l'histogramme à l'aide de chart.js

  histogramme =
  {
    type: 'bar', 
    data: 
    {
      labels: date_formate,   // L'axe des abscisse sera les dates
      datasets: // L'axe des ordonnées sera les données de chute de neige
      [{
        data: donnee_enneigement,
        backgroundColor: "#2F80ED",  // Couleur des barres
        borderRadius: 6,
        barThickness: 8,
        label: 'Chute de neige récente'  // Nom de l'histogramme
      }]
    },
    options:
    {
      plugins:
      {
        legend:
        {
          display: true,  // On affiche la légende
          position: 'top',  // On positionne la légende
          labels:
          {
            font:
            {
              size: 14,
              weight: 'bold'
            },
            color: '#333' 
          }
        }
      },
      scales:
      {
        x:
        {
          grid: { display: false },  // On masque la grille de l'axe des abscisse
          ticks:
          {
            color: "#666",
            maxRotation: 0,
            minRotation: 0,
            font:
            {
              size: 12,
              weight: 'bold'
            },
          }
        },
        y:
        {
          display: false  // On masque la grille de l'axe des ordonnées
        }
      }
    }
  };
  if (graph_pre_enneigement) // Ici avant d'afficher le graphique on vérifie si un graphique a déjà été affiché, si c'est le cas on le detruit
  {
    graph_pre_enneigement.destroy();
  }

  graph_pre_enneigement = new Chart(GRAPH_PRE_ENNEIGEMENT.getContext('2d'), histogramme) // Enfin, on affiche le graphique

}

function affiche_meteo_prevision(donnee)
{
  // Cette fonction affiche un autre histogramme des prévisions de chute de neige pour les 7 prochains jours ainsi que d'autre données de prévision sous forme de tableau cette fois

  console.log("affiche_meteo_prevision()")
  POST_ENNEIGEMENT.innerHTML = "";
  POST_METEO.innerHTML = "";
  console.log(donnee);
  console.log(donnee.daily.time[0])

  let date_brut;
  let date;
  let date_formate = [];
  let histogramme;
  let donnee_enneigement = [];
  let tbody = "<thead> <th>Jour</th> <th>Temps</th> <th>Min/Max</th> <th>Vent</th> <th>Précipitation</th> </thead> <tbody>"; // On créé l'entête du tableau

  for (let i=7; i<14; i++) // On récupère les données à partir du jour J (l'api renvoie des données allant de J-7 à J+7)
  {
    date_brut = donnee.daily.time[i];
    date = new Date(date_brut);

    date_formate.push(date.toLocaleDateString("fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }));
    POST_ENNEIGEMENT.innerHTML += "<span>"+date_formate[i]+"</span>";
    donnee_enneigement.push(donnee.daily.snowfall_sum[i])
    
    //On créer le contenu de notre tableau
    tbody += "<tr><td>"+date_formate[i-7]+"</td><td>"+WEATHER_CODE[donnee.daily.weather_code[i]]+"</td><td>"+donnee.daily.temperature_2m_min[i]+"/"+donnee.daily.temperature_2m_max[i]+" °C</td><td>"+donnee.daily.wind_speed_10m_max[i]+"km/h</td><td>"+donnee_enneigement[i-7]+" cm</td></tr>"; 
  }
  tbody += "</tbody>";
  POST_METEO.innerHTML = tbody; // On ajoute notre tableau

  // Idem que la création de l'histogramme au dessus
  histogramme =
  {
    type: 'bar',
    data:
    {
      labels: date_formate,
      datasets:
      [{
        data: donnee_enneigement,
        backgroundColor: "#2F80ED", 
        borderRadius: 6,
        barThickness: 8,
        label: 'Prévision neige'  
      }]
    },
    options:
    {
      plugins:
      {
        legend:
        {
          display: true,  
          position: 'top', 
          labels:
          {
            font:
            {
              size: 14,
              weight: 'bold'
            },
            color: '#333'  
          }
        }
      },
      scales:
      {
        x:
        {
          grid: { display: false },  
          ticks:
          {
            color: "#666",
            maxRotation: 0,
            minRotation: 0,
            font:
            {
              size: 12,
              weight: 'bold'
            },
          }
        },
        y:
        {
          display: false, 
          beginAtZero: true
        }
      }
    }
  };
  if (graph_post_enneigement)
  {
    graph_post_enneigement.destroy();
  }
  graph_post_enneigement = new Chart(GRAPH_POST_ENNEIGEMENT.getContext('2d'), histogramme)
}

function more_meteo(donnee)
{
  // Cette fonction utilise les même fonctionnalité que affiche_meteo_prevision() mais elle le fait heure par heure de j-j à j+3
  console.log("more_meteo()");
  MORE_METEO1.innerHTML = "";
  MORE_METEO2.innerHTML = "";
  MORE_METEO3.innerHTML = "";
  let date_brut;
  let date;
  let date_formate;
  let tbody = "<thead> <th class='text-warning'>Aujourd'hui</th> <th>Temps</th> <th>Température</th> <th>Vent</th> <th>Précipitation</th> </thead> <tbody>";

  for (let i=0; i<24; i++)
  {
    date_brut = donnee.hourly.time[i];
    date = new Date(date_brut);

    date_formate = date.toLocaleTimeString("fr-FR",
    {
      hour: '2-digit',
      minute: '2-digit'
    });
    console.log(date_formate);
    tbody += "<tr><td>"+date_formate+"</td><td>"+WEATHER_CODE[donnee.hourly.weather_code[i]]+"</td><td>"+donnee.hourly.temperature_2m[i]+" °C</td><td>"+donnee.hourly.wind_speed_10m[i]+"km/h</td><td>"+donnee.hourly.snowfall[i]+" cm</td></tr>";
  }
  MORE_METEO1.innerHTML = tbody;

  tbody = "<thead> <th class='text-warning'>Demain</th> <th>Temps</th> <th>Température</th> <th>Vent</th> <th>Précipitation</th> </thead> <tbody>";
  for (let i=24; i<48; i++)
  {
    date_brut = donnee.hourly.time[i];
    date = new Date(date_brut);

    date_formate = date.toLocaleTimeString("fr-FR",
    {
      hour: '2-digit',
      minute: '2-digit'
    });

    tbody += "<tr><td>"+date_formate+"</td><td>"+WEATHER_CODE[donnee.hourly.weather_code[i]]+"</td><td>"+donnee.hourly.temperature_2m[i]+" °C</td><td>"+donnee.hourly.wind_speed_10m[i]+"km/h</td><td>"+donnee.hourly.snowfall[i]+" cm</td></tr>";
  }
  MORE_METEO2.innerHTML = tbody;

  tbody = "<thead> <th class='text-warning'>Après demain</th> <th>Temps</th> <th>Température</th> <th>Vent</th> <th>Précipitation</th> </thead> <tbody>";
  for (let i=48; i<72; i++)
  {
    date_brut = donnee.hourly.time[i];
    date = new Date(date_brut);

    date_formate = date.toLocaleTimeString("fr-FR",
    {
      hour: '2-digit',
      minute: '2-digit'
    });

    tbody += "<tr><td>"+date_formate+"</td><td>"+WEATHER_CODE[donnee.hourly.weather_code[i]]+"</td><td>"+donnee.hourly.temperature_2m[i]+" °C</td><td>"+donnee.hourly.wind_speed_10m[i]+"km/h</td><td>"+donnee.hourly.snowfall[i]+" cm</td></tr>";
  }
  MORE_METEO3.innerHTML = tbody;
}



function ajout_favori(event)
{
  console.log("ajout_favori()")
  const ADD_FAVORIE = event.target.value.toUpperCase(); // On récupère le nom de la stations à ajouter aux favoris
  let liste_favorie = [] 


  if (localStorage.getItem("stations_favories")) // Si une liste de favoris existe déjà alors on la stock dans liste_favorie
  {
    liste_favorie = JSON.parse(localStorage.getItem("stations_favories"));
  }
  else // Sinon liste_favorie contient uniquement la station qu'on veux ajouter aux favoris
  {
    liste_favorie.push(ADD_FAVORIE);
  }

  if (!liste_favorie.includes(ADD_FAVORIE)) // On vérifie si la station à ajouter n'est pas déjà présente dans les favoris sinon on l'ajoute
  {
    liste_favorie.push(ADD_FAVORIE);
  }
  else
  {
    console.log("déjà dans les favoris");
  }

  localStorage.setItem("stations_favories", JSON.stringify(liste_favorie)); // On mets à jour la liste des favoris


  /************************************************************************************************************************************
   Ici on va regarder où est ce que la fonction a été appelé pour ne pas changer l'affichage de l'utilisateur
  ***********************************************************************************************************************************/

  if (event.target.id.startsWith("ajout_favori_menu_favori"))
  {
    console.log("ajouté depuis favori")
    affiche_favori();
  }
  else if (event.target.id.startsWith("ajout_favori_recherche"))
  {
    console.log("ajouté depuis recherche")
    liste_recherche(document.getElementById("recherche_input").value)
  }
  else if (event.target.id.startsWith("ajout_favori_info"))
  {
    console.log("ajouté depuis info")
    info_station(document.getElementById("titre_station").innerHTML);
  }
  else
  {
    console.log("ajouté depuis l'accueil")
    affiche_img_accueil("add_fav");
  }

  /***************************************************************************************************************************************/

  // Une fois ajouté on fait apparaître une notification pour avertir l'utilisateur

  document.getElementById("contenu_notif_fav").innerHTML = ADD_FAVORIE+ " à bien été ajouté à la liste des favoris" 
  bootstrap.Toast.getOrCreateInstance(NOTIF_AJOUT_FAV).show()

}

function affiche_favori(event)
{
  console.log("affiche_favori()")
  MENU_FAVORI.innerHTML = "<h2>Mes favoris</h2>";
  let liste_favorie = []
  let i = 0;

  /****************************************************************************************
                            Initialisation de l'affichage
  ****************************************************************************************/

  document.getElementById("main_container").classList.add("pas_affiche");
  document.getElementById("menu_map").classList.add("pas_affiche");
  BOUTON_FAVORI.classList.add("pas_affiche");
  BOUTON_MAP.classList.remove("pas_affiche");
  BOUTON_MENU.classList.remove("pas_affiche");
  MENU_FAVORI.classList.remove("pas_affiche");

  /***************************************************************************************/

  if (localStorage.getItem("stations_favories")) // On récupère la liste des favoris et on la stock dans liste_favorie
  {
    liste_favorie = JSON.parse(localStorage.getItem("stations_favories"));

    if (liste_favorie.length == 0) // Si la a une longueur de 0 alors il n'y a pas de favoris
    {
      console.log("Pas de favori");
      MENU_FAVORI.innerHTML += "Vous n'avez pas de favoris"
    }
    else // Sinon on affiche toutes les stations présente dans les favoris
    {
      for (const STATION of liste_favorie)
      {
        nom = STATION.toUpperCase();
        MENU_FAVORI.innerHTML += "<div class='col-sm'><div class='card h-100 shadow mb-5' style='width: 18rem;'> <img id=\"img"+i+"\" class='card-img-top' alt=\""+nom+"\"> <div class='card-body'> <h5 class='card-title'>"+nom+"</h5><a id='bouton_info"+i+"' title=\""+nom+"\" class='btn btn-primary'>Voir les infos</a><button class='btn btn-secondary' id=\"supp_favori_menu_favori"+i+"\" value=\""+nom+"\">Supprimer des favoris</button></div></div></div>"
        i += 1;
      }

      for (let indice = 0; indice<liste_favorie.length; indice++) // On ajoute des listeners sur tous les boutons des "cards"
      {
        console.log(indice);
        document.getElementById("bouton_info" + indice).addEventListener("click", info_station);
        document.getElementById("supp_favori_menu_favori" + indice).addEventListener("click", supp_favori);
      }
      recup_images(); // On récupère les images
    }
  }
  else // Si la liste des favoris n'existe pas dans le local storage c'est qu'il n'y a pas de favoris
  {
    MENU_FAVORI.innerHTML += "<p>Vous n'avez pas de favoris</p>"
    console.log("Pas de favori");
  }


}

function supp_favori(event)
{
  console.log("supp_favori()")
  let liste_favorie = JSON.parse(localStorage.getItem("stations_favories"));
  let new_favorie = [];
  for (const FAVORI of liste_favorie) // Ici on recréer une liste de favoris
  {
    if (FAVORI != event.target.value.toUpperCase()) // Si la stations n'est pas celle qu'on veut supprimer alors on l'ajoute à la nouvelle liste
    {
      new_favorie.push(FAVORI);
    }
  }

  localStorage.setItem("stations_favories", JSON.stringify(new_favorie)); // On met à jour la liste
  console.log(JSON.parse(localStorage.getItem("stations_favories")));

  /************************************************************************************************************************************
    Ici comme quand on veut ajouter un favori on va regarder où est ce que l'utilisateurs le fait pour ne pas modifier son affichage
  ***********************************************************************************************************************************/
  if (event.target.id.startsWith("supp_favori_recherche"))
  {
    console.log("supprimé depuis recherche")
    liste_recherche(document.getElementById("recherche_input").value);
  }
  else if (event.target.id.startsWith("supp_favori_info"))
  {
    console.log("supprimé depuis info")
    console.log(document.getElementById("titre_station"));
    info_station(document.getElementById("titre_station").innerHTML);
  }
  else if (event.target.id.startsWith("supp_favori_menu_favori"))
  {
    console.log("supprimé depuis favori")
    affiche_favori();
  }
  else
  {
    console.log("supprimé depuis l'accueil")
    affiche_img_accueil("supp_fav");
  }

  /********************************************************************************************************************************************/

  document.getElementById("contenu_notif_supp_fav").innerHTML = event.target.value.toUpperCase() + " à bien été supprimé de la liste des favoris" // On affiche une notification pour confirmer la suppression
  bootstrap.Toast.getOrCreateInstance(NOTIF_SUPP_FAV).show()

}


/*******************************************************
                Fonctions pour la carte
*******************************************************/


function localisation()
{
  console.log("localisation()");
  navigator.geolocation.getCurrentPosition(success, error, options); // On récupère la localisation de l'utilisateur et on appel une fonction selon le résultat
}

function success(pos) // Si la géolocalisation a fonctionné alors on mets à jour la latitude et la longitude de l'utilisateur
{
  latitude = pos.coords.latitude;
  longitude = pos.coords.longitude;
}

function error(err) // Si la géolocalisation a échoué alors on affiche un message de log
{
  console.log("ERREUR "+err.code+" "+err.message); 
}


function initMap(event)
{
  console.log("initMap()");

  /********************************************************************
                Initialisation de l'affichage
  ********************************************************************/

  document.getElementById("main_container").classList.add("pas_affiche");
  document.getElementById("menu_map").classList.remove("pas_affiche");
  BOUTON_MENU.classList.remove("pas_affiche");
  BOUTON_MAP.classList.add("pas_affiche");
  BOUTON_FAVORI.classList.remove("pas_affiche");
  MENU_FAVORI.classList.add("pas_affiche");
  console.log(event);
  console.log(latitude);
  window.scrollTo({ top: 0, behavior: "smooth" });

  /*******************************************************************/


  trouve = false;
  if (!is_map) // On vérifie si une map a déjà été créé
  {
    if (latitude !== false) // Si ce n'est pas le cas alors on récupère centre la map sur la latitude et la longitude du client si la geolocalisation a fonctioné
    {
      plan = L.map('map').setView([latitude , longitude], 8);
    }
    else  // Sinon on centre la map sur le centre de la France
    {
      plan = L.map('map').setView([46.603354 , 3.124319], 8);
    }

    // Affichage de la map

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(plan);
    is_map = true;
  }

  MARKERS.clearLayers(); // On efface les potentiel markers déjà créé

  let mark;
  let index = 0;

  if (latitude !== false) // Si on possède la position du client alors on place le marker rouge qu'on a créé au debut sur sa position
  {
    mark = L.marker([latitude, longitude], {icon: icon_rouge});
    mark.bindPopup("Vous êtes ici").openPopup();
    mark.addTo(MARKERS);
  }

  if (event.target && event.target.alt == "logo_map" || event == "reset") // Si la map à été appeler par un espace vide dans la recherche ("reset") ou alors par le logo alors on affiche toutes les stations par défaut
  {
    for (let i=0; i<stations.length; i++) // Création d'un marker par stations
    {
      mark = L.marker([stations[i].latitude, stations[i].longitude]);
      mark.bindPopup(stations[i].nom+"<br><button id=\""+stations[i].nom+"\" class='btn btn-primary'>Plus d'info</button>").openPopup();
      mark.addTo(MARKERS);
      mark.addEventListener("popupopen", ajout_listener);
    }
  }
  else if (event.target.id == "recherche_input_map") // Si la map est appeler par la recherche d'une station alors on cherche la stations dans la liste puis on affiche que elle
  {
    do
    {
      if (event.target.value == stations[index].nom.toUpperCase())
      {
        mark = L.marker([stations[index].latitude, stations[index].longitude]);
        mark.bindPopup(stations[index].nom+"<br><button id=\""+stations[index].nom+"\" class='btn btn-primary'>Plus d'info</button>").openPopup();
        mark.addTo(MARKERS);
        mark.addEventListener("popupopen", ajout_listener);
        trouve = true;
      }
      else
      {
          index += 1
      }
    }
    while (trouve == false && index<n)
  }
  else  // La derniere option correspond au cas où l'on appui sur le bouton "Voir sur la map" dans le menu info d'une station
  {
    const OPTIONS = event.target.value.split('|');
    mark = L.marker([OPTIONS[0], OPTIONS[1]]);
    mark.bindPopup(OPTIONS[2]+"<br><button id=\""+OPTIONS[2]+"\" class='btn btn-primary'>Plus d'info</button>").openPopup();
    mark.addTo(MARKERS);
    mark.addEventListener("popupopen", ajout_listener);
  }


  MARKERS.addTo(plan); // On ajoute les markers à la map

}

function ajout_listener(event)  // On ajoute un listener sur le bouton dans le popup quand on l'ouvre et pas avant car le bouton n'existe pas tant que le popup n'est pas ouvert
{
  console.log(event.popup.getElement().getElementsByTagName('button')[0].id);
  event.popup.getElement().getElementsByTagName('button')[0].addEventListener("click", info_station);
}

function active_rayon(event)
{
  document.getElementById("rayon_possible").innerHTML = ""
  if (ACTIVE_RAYON.checked) // On vérifie la recherche par rayon est activé
  // Si c'est le cas on désactive la recherche par nom
  {
    RECHERCHE_INPUT_MAP.disabled = true;
    RECHERCHE_INPUT_MAP.placeholder = "Désactiver la recherche par rayon"
    IS_RAYON.classList.remove("pas_affiche"); // On affiche la barre pour séléctionner le rayon
    OUTPUT_RAYON.textContent = CHOIX_RAYON.value+" km"; // On affiche le rayon choisi
    let centre = L.latLng(latitude, longitude); // On initialise le centre du rayon pour calculer les distances
    let position_station;
    MARKERS.clearLayers(); // On efface les potentiel markers déjà créé

    if (latitude !== false)
    {
    mark = L.marker([latitude, longitude], {icon: icon_rouge}); // On créer le marker du client
    mark.bindPopup("Vous êtes ici").openPopup();
    mark.addTo(MARKERS);

    if (is_circle) // Si il y a déjà un cercle de rayon alors on le supprime
    {
      circle.remove();
    }

    // On affiche le rayon
    circle = L.circle(centre, {
    radius: CHOIX_RAYON.value*1000
    }).addTo(plan);
  
    is_circle = true; // Comme on affiche un cercle alors on passe is_circle à true

    for (let i=0; i<stations.length; i++)
    // On regarde pour chaque station sa distance par rapport à l'utilisateur (le centre du cercle)
    {
      position_station = L.latLng(stations[i].latitude, stations[i].longitude);
      if (centre.distanceTo(position_station) <= CHOIX_RAYON.value*1000) // Si la distance entre l'utilisateur et la station est inférieur ou égal au rayon alors on créer le marker
      {
        mark = L.marker([stations[i].latitude, stations[i].longitude]);
        mark.bindPopup(stations[i].nom+"<br><button id=\""+stations[i].nom+"\" class='btn btn-primary'>Plus d'info</button>").openPopup();
        mark.addTo(MARKERS);
        mark.addEventListener("popupopen", ajout_listener);
      }
    }
    MARKERS.addTo(plan); // On affiche les markers
    }
    else
    {
      console.log("test");
      IS_RAYON.classList.add("pas_affiche");
      document.getElementById("rayon_possible").innerHTML = "Recherche par rayon indisponible"
    }
  }
  else if (!ACTIVE_RAYON.checked) // Si la recherche par rayon n'est pas activer alors on réactive la recherche par nom et on cache la barre du rayon
  {
    RECHERCHE_INPUT_MAP.disabled = false;
    RECHERCHE_INPUT_MAP.placeholder = "Rechercher une station"
    IS_RAYON.classList.add("pas_affiche");
    circle.remove();  // On enleve le cercle
    initMap("reset"); // On affiche par défaut toutes les stations
  }
}
