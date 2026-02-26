"""
Programme SAE 105: Traitement de données:
Fichier: ville_france.csv contenant des informations sur les 36700 Villes de France
BUT1 : Année 2024-2025
@author: UNWISTER
"""
import math

import folium
import matplotlib.pyplot as plt

# pour afficher la carte avec les villes
"""
import folium,branca
import matplotlib.pyplot as plt
import math
"""

#-----------------------------------------------------------
# Fonction qui extrait les 12 informations sur chaque ville
#-----------------------------------------------------------

def lire_fichier_csv(nomFich):
    """
    Cette fonction permet de LIRE les données du fichier villes_france.csv
    le fait d'utiliser readlines permet de récupérer une liste dont chaque élément correspond à une ville
    ainsi que toutes les données associées
    :param nomFich: fichier "villes_france.csv"
    :return: une liste "liste_villes" dont chaque élément est une str qui comporte toutes les données d'une ville
    (27 données par ville au total)
    """
    fich = open(nomFich,'r')
    liste_villes = fich.readlines()

    print("Fin de l'Extraction des infos du fichier",nomFich)
    fich.close()
    return liste_villes

def extract_info_villes(uneListe):
    """
    Fonction qui extrait les 12 informations de la liste[str] extraite du fichier Excel
    :param : uneListe:
    :return: L: une liste dont chaque élément contient les 12 infos de la ville
    la taille de la liste L[] retournée est de 36700 villes
    """
    L= []
    temp = []
    for i in uneListe:
        temp.append(i.split(','))
    print("taille = ",len(temp))

    """
    Il faut faire attention aux Départements de Corse : 2A et 2B
    et également aux département d'Outre-Mer : 971, 972, ...,977
    """
    for i in temp:
        # eval(..) transforme "Annecy" en Annecy, et "18.59" en 18.59 donc une chaîne de caractères sans les "..."
        # ensuite il faut transformer le type str() en int() ou float()
        # Pour tous les départements sauf la Corse 2A et 2B
        # et les territoires d'Outre-Mer : les derniers champs sont à 'NULL'
        if ((eval(i[1]) != '2A') and (eval(i[1]) != '2B')) and i[25] != 'NULL':
            L.append([int(eval(i[1])),      # numéro du Département
                    eval(i[3]),             # Nom de la ville en MAJUSCULE
                    eval(i[8]),             # Code postal
                    int(eval(i[14])),       # population en 2010
                    int(eval(i[15])),       # population en 1999
                    int(eval(i[16])),       # population en 2012
                    float(eval(i[17])),     # densité
                    float(eval(i[18])),     # surface
                    float(eval(i[19])),     # longitude
                    float(eval(i[20])),     # latitude
                    int(eval(i[25])),       # altitude min
                    int(eval(i[26]))])      # altitude max
        elif i[13] == 'NULL': # pour gérer les départements et territoires d'Outre-Mer : 971, 972, 974, ...
            L.append([int(eval(i[1])),
                      eval(i[3]),
                      eval(i[8]),
                      int(eval(i[14])),
                      int(eval(i[15])),
                      int(eval(i[16])),
                      float(eval(i[17])),
                      float(eval(i[18])),
                      float(eval(i[19])),
                      float(eval(i[20])),
                      "NULL",
                      "NULL"])
        else:
            L.append([eval(i[1]),
                      eval(i[3]),
                      eval(i[8]),
                      int(eval(i[14])),
                      int(eval(i[15])),
                      int(eval(i[16])),
                      float(eval(i[17])),
                      float(eval(i[18])),
                      float(eval(i[19])),
                      float(eval(i[20])),
                      i[25],
                      i[26]])


    return L

#====================================================================
# Compte le Nombre de villes en fonction de l'indicatif téléphonique
#====================================================================
def appelNombre_Villes_Indicatif(indTel, unelisteInfo):

    if indTel == 1:
        listeDept1 = [75,77,78,91,92,93,94,95]  #Initialisation des numéros des département pour l'indicatif 02
        nb = extract_villes_depart_indicatif(listeDept1, unelisteInfo) #Appel de la fonction
        print("Le nombre de villes pour l'indicatif 02 est : ", nb)

    if indTel == 2:
        listeDept2 = [14, 18, 22, 27, 28, 29, 35, 36, 37, 41, 44, 45, 49, 50, 53, 56, 61, 72, 76, 85, 974, 976]  #Initialisation des numéros des département pour l'indicatif 02
        nb = extract_villes_depart_indicatif(listeDept2, unelisteInfo) #Appel de la fonction
        print("Le nombre de villes pour l'indicatif 02 est : ", nb)

    if indTel == 3:
        listeDept3 = [2,8,10,21,25,39,51,52,54,55,57,58,59,60,62,67,68,70,71,80,88,89,90]   #Initialisation des numéros des département pour l'indicatif 03
        nb = extract_villes_depart_indicatif(listeDept3, unelisteInfo)
        print("Le nombre de ville pour l'indicatif 03 est : ", nb)

    if indTel == 4:
        listeDept4 = [1,3,4,5,6,7,11,13,15, 26,30,34,38,42,43,48,63,66,69,73,74,83,84]  #Initialisation des numéros des département pour l'indicatif 04
        nb = extract_villes_depart_indicatif(listeDept4, unelisteInfo)
        print("Le nombre de ville pour l'indicatif 04 est : ", nb)

    if indTel == 5:
        listeDept5 = [9,12,16,17,19,23,24,31,32,33,40,46,47,64,65,79,81,82,86,87,971,972,973,975,977,978] #Initialisation des numéros des département pour l'indicatif 05
        nb = extract_villes_depart_indicatif(listeDept5, unelisteInfo)
        print("Le nombre de ville pour l'indicatif 05 est : ", nb)







#--------------------------------------------------------
# Fonction extract_villes_depart_indicatif(....)
#--------------------------------------------------------
def extract_villes_depart_indicatif(listeDept, listeVilles):
    """
    Fonction qui extrait l'ensemble des villes pour chaque département,
    en fonction de l'indicatif téléphonique (01 = Île-de-France, 02 = Nord-Ouest, ...

    :param listeDept: qui est la liste des départements ayant cet indicatif
    :param listeVilles: liste du nom de villes
    :return: nbVilles = nombre de villes
    """
    listeVilles02 = []
    liste_nomVille02 = []
    filine = open("NO0{}.txt".format(indicatif), 'w')   #Création du fichier texte pour l'écriture
    for i in range (len(listeVilles)):
        for y in range (len(listeDept)):
            if listeVilles[i][0]==listeDept[y]:  #Si pour chaque ligne la première colonne est égal à un département dans la liste des départements correspondant à l'indicatif 02 alors:
                listeVilles02.append(listeVilles[i])  #On ajoute dans la liste "listeVilles02" la ligne avec les 12 info de la liste "listeInfo"
                liste_nomVille02.append(listeVilles[i][1])  #On ajoute dans la liste "liste_nomVille02" juste le nom de la ville voulu
    for i in range (len(listeVilles02)):
        filine.write("{} {} ({})\n".format(i+1, liste_nomVille02[i], listeVilles02[i][0]))
    filine.close()
    nbVilles = len(listeVilles02)
    return nbVilles

#--------------------------------------------------------
# Procédure qui permet d'appeler la fonction
# qui extrait les informations sur les villes
#---------------------------------------------------------
def appelExtractionVilles():
    print("Extraction des informations des Villes de France")
    listeVillesFr = lire_fichier_csv("villes_france.csv")
    print("une ligne = ",listeVillesFr[0])

    # la liste info contient les 12 Informations retenues pour la suite du programme
    info = extract_info_villes(listeVillesFr)

    return info

#==========================================================
# Recherche les infos d'une Ville dans la liste
#==========================================================
def rechercheVille(name,listeVilles):
    """

    :param name: nom de la ville recherchée doit être en MAJUSCULE
    :param listeVilles: liste de toutes les villes
    :return: listeVilles[i] : la ville recherchée
    """
    lst = []
    name = name.upper()
    i = 0
    trouve = False
    while (trouve == False) and (i < len(listeVilles)):
        if name == listeVilles[i][1]:  #Parcours la liste de toutes les villes jusqu'à trouver le nom correspondant
            lst.append(listeVilles[i])  #Ajoute la liste de la bonne ville avec les 12 info dans la liste "lst"
            trouve = True   #Trouve passe en "True" pour fermer la boucle
        else:
            i+=1    #Si le nom correspond pas on ajoute 1 à "i" pour passer à la ville suivante
    return lst  #on retourne la liste contenant les 12 infos de la liste soihaité

# --------------------------------------------------------
# Fonction extract_villes_NumDepart(....)
# --------------------------------------------------------
def extract_villes_NumDepart(numDept, listeVilles):
    """
    Fonction qui extrait l'ensemble des villes pour chaque département,
    en fonction du numéro du Département

    :param numDept: numéro du département
    :param listeVilles: liste des noms de villes
    :return: nbVilles = nombre de villes du département
    """
    nb_villes=[]
    filine = open("villes_{}.txt".format(numDept), 'w')     #Création du fichier pour l'écriture de toutes les villes correspondant à un numéro de département
    for i in range (len(listeVilles)):      #Parcours toute la liste contenant toutes les infos de toutes les villes
        if listeVilles[i][0]==numDept:
            nb_villes.append(listeVilles[i])    #Si le numéro de département correspond à celui de la liste alors on ajoute la lignes contenant les 12 infos de la ville
    nbVilles = len(nb_villes)       #Le nombre de ville qu'il y a dans le département
    for i in range (len(nb_villes)):
        filine.write("{}\n".format(nb_villes[i]))   #Ecriture au bon format dans le fichier texte
    filine.close()      #On ferme le fichier texte
    return nbVilles, nb_villes  #On retourne le nombre de ville dans le département ainsi que la liste de cette dernière


# ================================================
# Fonctions Utiles pour le Tri Bulle lié à la POPULATION
# ================================================
def MinMax5_villes_Habitants(lstVillesDepart):
    """

    :param lstVillesDepart: Liste des départements

        recherche de 5 villes ayant le MOINS d'habitants dans un tableau
        recherche de 5 villes ayant le PLUS d'habitants dans un tableau
        on peut trier la liste par ordre croissant
        *** On IMPOSE le TRI BULLE vu au TP7 ****
        puis extraire les 5 premières valeurs
    """
    ####Fonction tribulle####

    for i in range(len(lstVillesDepart) - 1):
        for y in range(0, len(lstVillesDepart) - i - 1):
            if int(lstVillesDepart[y][3]) > int(lstVillesDepart[y + 1][3]):
                lstVillesDepart[y], lstVillesDepart[y + 1] = lstVillesDepart[y + 1], lstVillesDepart[y]     #Si la valeur de y+1 est inférieur à celle de y alors on inverse les deux valeurs

    ##########################

    mini = open("Min5Villes_{}.txt".format(dep), 'w', encoding = "utf-8")       #Création du fichier texte pour l'écriture
    mini.write("Les 5 villes les moins peuplé du département {} :\n".format(dep))   #Lignes de présentation
    for i in range(0, 5):
        mini.write("{}\n".format(lstVillesDepart[i]))       #Ecriture au bon format dans le fichier texte
    mini.close()        #On ferme le fichier texte
    maxi = open("Top5Villes_{}.txt".format(dep), 'w', encoding = "utf-8")       #Création du fichier texte pour l'écriture
    maxi.write("Les 5 villes les plus peuplé du département {} :\n".format(dep))    #Lignes de présentation
    for i in range(0 , 5):
        maxi.write("{}\n".format(lstVillesDepart[len(lstVillesDepart)- 1 - i]))     #Ecriture au bon format dans le fichier texte
    maxi.close()        #On ferme le fichier texte
    print("Traitement des fichiers texte terminé ")


#-------------------------------------------------------------------------
# Procédure qui permet d'afficher sur une carte OpenStreetMap
# les 10 villes (5 ayant la population MAX, et 5 ayant la population MIN)
#-------------------------------------------------------------------------
def mapTenVilles(maxPopul, minPopul):
    """

    :param maxPop: fichier contenant les 5 villes de forte densité
    :param minPop: fichier contenant les 5 villes de faible densité
    :return:
    """
    MinMax5_villes_Habitants(liste)     #Appel de la procédure MinMax5_villes_Habitants(lstVillesDepart) pour créer les fichiers texte au cas où on demande la procédure actuelle sans avoir appelé MinMax5_villes_Habitants(lstVillesDepart)
    dens_max = []
    LATS = []
    LONGS = []
    TEMPS = []
    STATIONS = []
    filine = open(maxPopul, 'r')
    lignes = filine.readlines()
    for i in lignes:
        dens_max.append(i.split(","))       #Ajout des lignes souhaitées du fichier texte précedent, on sépare chaque info par "," pour créer une liste
    for i in range (1, 6):
        STATIONS.append(dens_max[i][1])     #On stock les noms des villes dans la liste STATIONS
        TEMPS.append(float(dens_max[i][6]))     #On stock la densité des villes dans la liste TEMPS
        LONGS.append(float(dens_max[i][8]))     #On stock les longitudes des villes dans la liste LONGS
        LATS.append(float(dens_max[i][9]))      #On stock les latitudes des villes dans la liste LATS
    filine.close()

    filine = open(minPopul, 'r')

    dens_min = []
    lignes = filine.readlines()
    for i in lignes:
        dens_min.append(i.split(","))       #Ajout des lignes souhaitées du fichier texte précedent, on sépare chaque info par "," pour créer une liste
    for i in range (1, 6):
        STATIONS.append(dens_min[i][1])     #On stock les noms des villes dans la liste STATIONS
        TEMPS.append(float(dens_min[i][6]))     #On stock la densité des villes dans la liste TEMPS
        LONGS.append(float(dens_min[i][8]))     #On stock les longitudes des villes dans la liste LONGS
        LATS.append(float(dens_min[i][9]))      #On stock les latitudes des villes dans la liste LATS
    filine.close()


    ########Création de la map##########

    import folium, branca

    coords = (46.539758, 2.430331)      #Coordonnées du centre de la France
    # Pour customizer les cercles avec des couleurs, .....
    map1 = folium.Map(location=coords, tiles='OpenStreetMap', zoom_start=6)
    cm = branca.colormap.LinearColormap(['blue', 'red'], vmin=min(TEMPS), vmax=max(TEMPS))
    map1.add_child(cm)  # add this colormap on the display
    for lat, lng, size, color in zip(LATS, LONGS, TEMPS, TEMPS):
        folium.CircleMarker(
            location=[lat, lng],
            radius=size/100,
            color=cm(color),
            fill=True,
            fill_color=cm(color),
            fill_opacity=0.6
        ).add_to(map1)

    map1.save(outfile="Map_{}.html".format(dep))
    print("Traitement de la carte terminé")

    ##############################################

def MinMax10Accroissement(lstVillesDepart):
    """
    :param lstVillesDepart:

        recherche de 10 villes ayant la plus FORTE BAISSE de sa population entre 1999 et 2012
        recherche de 10 villes ayant le plus FORT ACCROISSEMENT de sa population entre 1999 et 2012
        on peut trier la liste par ordre croissant
        *** On IMPOSE le TRI BULLE vu au TP7 ****
        puis extraire les 10 premières valeurs et 10 dernières valeurs
    """
    #########Tribulle#############

    for i in range(len(lstVillesDepart) - 1):
        for y in range(0, len(lstVillesDepart) - i - 1):
            if int(lstVillesDepart[y][5]) - int(lstVillesDepart[y][4]) > int(lstVillesDepart[y + 1][5]) -int(lstVillesDepart[y + 1][4]):
                lstVillesDepart[y], lstVillesDepart[y + 1] = lstVillesDepart[y + 1], lstVillesDepart[y]

    ##############################

    mini = open("TopBaisse10Villes_{}.txt".format(dep), 'w', encoding="utf-8")       #Création du fichier texte pour l'écriture
    mini.write("Les 10 avec le plus faible accroissement de la population du département {} :\n".format(dep))       #Ligne de présentation
    for i in range(0, 10):
        diff = lstVillesDepart[i][5] - lstVillesDepart[i][4]
        mini.write("{}, {}, {}\n".format(lstVillesDepart[i][0], lstVillesDepart[i][1], diff))       #Ecriture du fichier au bon format
    mini.close()        #Fermeture du fichier
    maxi = open("TopAcc10Villes_{}.txt".format(dep), 'w', encoding="utf-8")         #Création du fichier texte pour l'écriture
    maxi.write("Les 10 villes avec le plus fort accroissement de la population du département {} :\n".format(dep))      #Ligne de présentation
    for i in range(0, 10):
        diff = lstVillesDepart[len(lstVillesDepart) - 10 + i][5] - lstVillesDepart[len(lstVillesDepart) - 10 + i][4]
        maxi.write("{}, {}, {}\n".format(lstVillesDepart[len(lstVillesDepart) - 10 + i][0], lstVillesDepart[len(lstVillesDepart) - 10 + i][1], diff))       #Ecriture du fichier au bon format
    maxi.close()        #Fermeture du fichier
    print("Traitement des fichiers texte terminé ")

def MinMax5Alt_Dept(lstVillesDepart):
    """
    :param lstVillesDepart:

        recherche de 5 villes ayant la plus FAIBLE différence d'altitude dans un tableau
        recherche de 5 villes ayant la plus FORTE différence d'altitude dans un tableau
        on peut trier la liste par ordre croissant
        *** On IMPOSE le TRI BULLE vu au TP7 ****
        puis extraire les 5 premières valeurs
        Numéro du département = lstVillesDepart[0][0]
    """


"""
    A compléter
"""


#-------------------------------------------------------------------------
# Procédure qui permet d'afficher sur une carte OpenStreetMap
# les 10 villes (5 ayant la différence d'ALTITUDE MAX
# et 5 ayant la différence d'ALTITUDE MIN)
#-------------------------------------------------------------------------
def mapTenAlt(maxAlt, minAlt):
    """

    :param maxAlt: fichier contenant les 5 villes de forte différence d'altitude
    :param minAlt: fichier contenant les 5 villes de faible différence d'altitude
    :return:
    """

    """
        A compléter
    """


#===================================================================
# Construction de l'HISTOGRAMME
#===================================================================
def traceHistoVilles(lstVillesDepart):
    """
        A compléter
    """
    ####Tracer de l'historigramme######

    population = []
    for i in lstVillesDepart:       #i prend la valeur de chaque élément de la liste des villes d'un département
        population.append(i[3])     #Sélectionne le nombre d'habitants d'une ville et l'ajoute à la liste "population"
    plt.hist(population, bins=100, color='blue', edgecolor='red')
    plt.title("Dépt {} nombre de villes en fonction des Habitants".format(dep))     #Titre de l'historigramme
    plt.xlabel("Nombre d'habitants")        #Axe des abscisses
    plt.ylabel("Nombre de villes")      #Axe des ordonnées
    plt.show()      #Affichage de l'historigramme

    #####Calcul moyenne#####

    total = 0
    pop = 0
    for i in lstVillesDepart:       #i prend la valeur de chaque élément de la liste des villes d'un département
        pop = pop + i[3]        #Ajoute le nombre d'habitants de toutes les villes
        total +=1       #Compte le nombre de ville qu'il y a
    moyenne = pop / total       #Calcul de la moyenne
    print("la moyenne d'habitants dans le département {} est : {:.0f}".format(dep, moyenne))    #Résultat arrondie à l'unité car on parle d'habitants

    ####Calcul de l'écart type#####
    ecart = 0
    for i in lstVillesDepart:
        ecart = ecart + (i[3] - moyenne)**2
    ecart_type = math.sqrt(ecart / len(lstVillesDepart))
    print("L'écart type de la population dans le département {} est : {:.0f}".format(dep, ecart_type))      #Résultat arrondie à l'unité car on parle d'habitants

#====================================================================
# Distance EUCLIDIENNE entre 2 villes (en km)
#====================================================================
def dist_Euclidienne(city1, city2):

# Méthode par le calcul de Pythagore


    dist_eucl = math.sqrt((city1[0][8] - city2[0][8])**2 + (city2[0][9] - city1[0][9])**2)*111.11       #Calcul de la distance euclidienne (multiplié par 111.11 pour convertir les angles en Km)
    return dist_eucl
#===============================================================
# ETAPE 5 : Parcours Ville1 ==> Ville2
#===============================================================

#=================================================================
# Recherche un ensemble de villes distante de R km dans une liste
#=================================================================
def ensembleVilles(name, rayon, listeVilles):
    """

    :param name: centre = ville avec les 12 infos
    :param rayon: distance de la ville retenue
    :param listeVilles: liste de toutes les villes
    :return: listeVilles[i] : la ville recherchée
    """

    Villes = []
    i = 0
    total = 0
    trouve = False
    a = rechercheVille(name, listeVilles)       #la variable a est la liste avec les 12 info de la ville autour du quelle on va faire la recherche
    while (trouve == False) and (i<len(listeVilles)):
        b = rechercheVille(listeVilles[i][1], listeVilles)      #la variable b est la liste avec les 12 info de chaque ville de listeInfo
        c = dist_Euclidienne(a, b)      #Distance euclidienne entre la ville de départ et les autres villes
        if c <= int(rayon):     #Si cette distance est inférieur au rayon alors :
            Villes.append(listeVilles[i])       #On ajoute la liste avec les 12 infos de la ville dans la liste Villes
            i += 1      #On incrémente 1 à i pour passer à la ville d'après
            total += 1      #On incrémente 1 à total pour compter le nombre de ville dans le rayon
        elif total > 300:
            trouve = True       #Si le nombre de ville dans le rayon atteint 300 alors on sort de la boucle
        else:
            i += 1      #On incrémente 1 à total pour compter le nombre de ville dans le rayon
    return Villes   #On retourne la liste des villes dans le rayon


def plusProche(listeVilles, ville2):

    res = []
    nom = []
    vil2 = rechercheVille(ville2, listeInfo) #la variable vil2 est la liste avec les 12 info de la ville d'arrivé
    for i in range (0, len(listeVilles)):
        vil1 = rechercheVille(listeVilles[i][1], listeInfo) #la variable vil1 est la liste avec les 12 info de la ville autour du quelle on va faire la recherche
        res.append(dist_Euclidienne(vil1, vil2))        #On ajoute la distance euclidienne dans la liste res
        nom.append(listeVilles[i])      #Ainsi que le nom correspondant à cette distance

    mini = res[0]
    nom_mini = nom[0]
    for i in range (0, len(res)):
        if res[i] < mini:
            mini = res[i]       #Si la distance euclidienne est plus petite que celle qu'on compare on la remplace sinon on passe à la suivante
            nom_mini = nom[i]   #On fait de même avec les noms pour garder la corélation entre les noms et les distances
    nom_mini = nom_mini[1]      #On garde seulement le nom de la ville ayant la distances euclidienne la plus petite avec la ville d'arrivé
    return nom_mini     #On retourne ce nom





#===================================================================
# ETAPE 5 : Plus court chemin entre les 2 Villes vil1 et vil2
#===================================================================
def parcoursVilles(vil1, vil2, listeRef, rayon):

    #########Cette procédure répete les étapes précedentes en changeant la ville de départ et on ajoute chaque ville gardée dans la liste parcours##################
    vil_dep = vil1
    vil1 = rechercheVille(vil1, listeRef)
    vil2 = rechercheVille(vil2, listeRef)
    vil1 = vil1[0][1]
    vil2 = vil2[0][1]
    parcours = []
    while vil1 != vil2:
        ens = ensembleVilles(vil1, rayon, listeRef)
        proche = plusProche(ens, vil2)
        vil1 = proche
        parcours.append(vil1)
    parcours.append(vil_dep)
    return parcours



#----------------------------------------------------------------------------------
# On sauvegarde le trajet dans un fichier html pour l'afficher dans un navigateur
#----------------------------------------------------------------------------------
def map_trajet(villes_traversees):


    lst = []
    LATS = []
    LONGS = []
    STATIONS = []
    for i in villes_traversees:
        lst.append(rechercheVille(i, listeInfo))
    for i in range (len(villes_traversees)):
        STATIONS.append(lst[i][1])     #On stock les noms des villes dans la liste STATIONS
        LONGS.append(float(lst[i][8]))     #On stock les longitudes des villes dans la liste LONGS
        LATS.append(float(lst[i][9]))      #On stock les latitudes des villes dans la liste LATS

    #######Création de la map##############

    coords = (46.539758, 2.430331)  # Coordonnées du centre de la France
    # Pour customizer les cercles avec des couleurs, .....
    map1 = folium.Map(location=coords, tiles='OpenStreetMap', zoom_start=6)
    for lat, lng in zip(LATS, LONGS):
        folium.CircleMarker(
            location=[lat, lng],
            radius=20,
            color='red',
            fill=True,
            fill_color=cm(color),
            fill_opacity=0.6
        ).add_to(map1)

    map1.save(outfile="Map_trajet.html")

#===============================================================
# AFFICHE MENU
#===============================================================

def afficheMENU():
    print("\n================ MENU ==================")
    print("taper 1: Nombre de villes en fonction de l'indicatif téléphonique")
    print("taper 2: Extraire des Statistiques des Villes d’un département")
    print("taper 3: Distance Euclidienne entre 2 villes")
    print("taper 4: Plus court chemin entre 2 villes")
    print("F: pour finir")


def afficheSOUS_MENU(unDepartement):
    print("\n================ SOUS MENU : STATISTIQUES du Département ", unDepartement, "==================")
    print("taper 1: Lister les 5 Villes ayant le plus/le moins d'habitants")
    print("taper 2: Afficher les 10 Villes en fonction de la DENSITE sur une carte")
    print("taper 3: Lister les 10 Villes ayant le plus fort/faible taux d'accroissement")
    print("taper 4: HISTOGRAMME des villes par habitants")
    print("Q: pour Quitter le sous-menu")


#=============================================================================================
# Programme principal
# Appel de la procédure afficheMENU()
#=============================================================================================
fini = False
while fini == False:
    afficheMENU()
    choix = input("votre choix: ")
    if choix == '1':
        # Pour débuter il faut extraire des informations du fichier CSV
        listeInfo = appelExtractionVilles()
        #=====================================
        """
        A compléter en demandant l'indicatif Téléphonique
        Puis faire un appel à la procédure : appelNombre_Villes_Indicatif(...)
        """
        indicatif = int(input("Entrez l'indicatif téléphonique souhaité : "))
        appelNombre_Villes_Indicatif(indicatif, listeInfo)  #Appel de la procédure

    elif choix == '2':
        listeInfo = appelExtractionVilles()
        print("\n**** Nombre de Villes par Département *****")
        dep = int(input("Entrez le département voulu : "))
        res, liste = extract_villes_NumDepart(dep, listeInfo)  #Appel de la fonction, la variable "res" prend la valeur de la variable qui est retournée par la focntion
        print("Le nombre de villes dans le département {} est : {}".format(dep, res))

        #=====================================
        finiBis = False
        while finiBis == False:
            # ==> Changer le numéro du Département <==
            afficheSOUS_MENU("{}".format(dep))
            choixBis = input("votre choix: ")
            if choixBis == '1':
                print("\nappel de la stat1 : Min/Max Habitants : 5 villes\n")
                """
                    A compléter
                """
                MinMax5_villes_Habitants(liste)
            elif choixBis == '2':
                print("\nappel de la stat2: Afficher les 10 villes (DENSITE) sur la carte\n")
                """
                    A compléter
                """
                mapTenVilles("Top5villes_{}.txt".format(dep), "Min5Villes_{}.txt".format(dep))
            elif choixBis == '3':
                print("\nappel de la stat3: ACCROISSEMENT/BAISSE population entre 1999 et 2012\n")
                """
                    A compléter
                """
                MinMax10Accroissement(liste)
            elif choixBis == '4':
                print("\nappel de la stat4 : HISTOGRAMME du nombre des Villes par habitants\n")
                """
                    A compléter
                """
                traceHistoVilles(liste)

            elif choixBis == '5':
                print("\nappel de la stat5 : ALTITUDE Min/Max : 5 villes\n")
                """
                    A compléter
                """
            elif choixBis == '6':
                print("\nappel de la stat6: Afficher les 10 villes (ALTITUDE) sur la carte\n")
                """
                    A compléter
                """
            else:
                finiBis = True
    elif choix == '3':
        listeInfo = appelExtractionVilles()

        print("\nDistance Euclidienne entre 2 villes")
        """
            A compléter
        """
        nom1 = input("Entrez le nom de la première ville : ")
        nom2 = input("Entrez le nom de la deuxième ville : ")
        ville1 = rechercheVille(nom1, listeInfo)
        ville2 = rechercheVille(nom2, listeInfo)
        res = dist_Euclidienne(ville1, ville2)
        print("La distance euclidienne entre {} et {} est de : {:.3f}km".format(ville1[0][1], ville2[0][1], res))
    elif choix == '4':
        print("\nPLus court chemine entre 2 villes")
        """
            A compléter
        """
        listeInfo = appelExtractionVilles()
        cit1 = input("Entrez la ville de départ : ")
        cit2 = input("Entrez la ville d'arrivé : ")
        r = input("Entrez le rayon de recherche : ")
        park = parcoursVilles(cit1, cit2, listeInfo, r)
        map_trajet(park)
        print("*** Traitement terminé, Map réalisée ****")
    elif choix == '5':
        print("\nAppel de la fonction4\n")
    elif choix == 'F':
        fini = True


print("Fin du programme")
