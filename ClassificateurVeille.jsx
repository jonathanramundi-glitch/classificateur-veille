const { useState, useMemo, useEffect, useRef } = React;

const STORAGE_KEY = 'twincare_veille_v2';

// ============================================================
// DONNEES BRUTES (36 sources uniques)
// ============================================================

const SOURCES_BRUTES_RAW = [
  { id: 1, fichier: "VeilleStrategique-Tableau.xlsx", campagne: "Veille Jan-Fev 2026", date: "23 fev. 2026", titre: "Telemonitoring continu de l'insuffisance cardiaque par analyse vocale personnalisee", nature: "Preprint / etude de recherche", resume: "Etude proposant un modele d'IA (deep learning) analysant la dynamique de la voix de patients insuffisants cardiaques, enregistree en continu a domicile, pour predire les episodes de decompensation. Le systeme personnalise les profils vocaux de chaque patient et montre une forte sensibilite pour detecter la deterioration avant l'aggravation clinique.", impact: "Patients : suivi passif sans friction, detection precoce. Soignants : nouvel outil de triage et d'alerte pour les plateformes de telesurveillance existantes. Industriels : segment digital biomarkers vocaux a integrer dans les solutions de RPM cardiaque.", lien: "https://arxiv.org/abs/2602.19674", importance: "fort" },
  { id: 2, fichier: "VeilleStrategique-Tableau.xlsx", campagne: "Veille Jan-Fev 2026", date: "3 mars 2026", titre: "Detection de cardiopathies structurelles par modeles fondation ECG interpretables", nature: "Preprint / recherche methodo", resume: "Utilisation d'un modele fondation ECG couple a un modele additif generalise interpretable pour detecter les cardiopathies structurelles a partir d'ECG standards. Depistage a large echelle via ECG acquis en ville ou a domicile (dispositifs connectes) avec bonne explicabilite pour les cliniciens.", impact: "Patients : depistage precoce des atteintes structurelles a domicile. Soignants : scores explicables (GAM) facilitant l'acceptabilite. Industriels : opportunite pour fabricants ECG connectes et plateformes SaaS de telecardiologie.", lien: "https://arxiv.org/abs/2603.02616", importance: "fort" },
  { id: 3, fichier: "VeilleStrategique-Tableau.xlsx", campagne: "Veille Jan-Fev 2026", date: "19 jan. 2026", titre: "ECGomics : plateforme ouverte pour biomarqueurs numeriques ECG en contexte clinique et domicile", nature: "Plateforme open source / article methodo", resume: "ECGomics propose un cadre et une plateforme open source pour decomposer finement le signal ECG en biomarqueurs numeriques exploites par des modeles d'IA. Concue pour environnement hospitalier et suivi decentralise, reliant signaux ECG collectes a domicile a des modeles predictifs.", impact: "Patients : suivi ECG a domicile puissant et personnalise. Soignants : base d'algorithmes ECG standardises. Industriels : la couche biomarqueurs ECG se commoditise via l'open source, differenciation vers qualite des donnees et conformite reglementaire.", lien: "https://arxiv.org/abs/2601.15326", importance: "fort" },
  { id: 4, fichier: "VeilleStrategique-Tableau.xlsx", campagne: "Veille Jan-Fev 2026", date: "12 jan. 2026", titre: "AnyECG : modele fondation ECG pour un profilage de sante holistique", nature: "Preprint / modele fondation", resume: "Modele fondation ECG entraine pour couvrir un large spectre de pathologies et comorbidites. Perspectives d'utilisation pour le suivi de maladies chroniques et la prediction de risques futurs, incluant les pathologies cardiaques chroniques via ECG enregistres regulierement au domicile.", impact: "Patients : suivi ECG global anticipant plusieurs complications. Soignants : un seul modele generant plusieurs signaux de risque. Industriels : montee en puissance des modeles fondation ECG, enjeu d'acces aux donnees ECG massives et hebergement souverain (UE).", lien: "https://arxiv.org/abs/2601.10748", importance: "fort" },
  { id: 5, fichier: "VeilleStrategique-Tableau.xlsx", campagne: "Veille Jan-Fev 2026", date: "Fev. 2026", titre: "Croissance soutenue du marche des dispositifs de surveillance de l'insuffisance cardiaque", nature: "Rapport de marche", resume: "Rapport projettant une forte croissance du marche mondial des dispositifs de surveillance de l'insuffisance cardiaque jusqu'en 2034, tiree par la demande en telesurveillance et diagnostic precoce. Montee en puissance des solutions de monitoring a distance et importance des algorithmes.", impact: "Patients : acceleration de la disponibilite de dispositifs de telesurveillance IC. Soignants : diversification de l'offre d'outils. Industriels : marche en expansion rapide, necessite de se positionner sur les segments a plus forte valeur.", lien: "https://www.fortunebusinessinsights.com/fr/heart-failure-monitoring-devices-market-115705", importance: "fort" },
  { id: 6, fichier: "VeilleStrategique-Tableau.xlsx", campagne: "Veille Jan-Fev 2026", date: "Fev. 2026", titre: "Mise a jour des exigences de conformite IA en sante en Europe (IA Act & dispositifs medicaux)", nature: "Analyse reglementaire / veille juridique", resume: "Renforcement des attentes en validation clinique, suivi post-commercialisation et gestion du cycle de vie des algorithmes pour les dispositifs d'IA a haut risque, incluant les systemes de telesurveillance cardiaque predictive. Exigences accrues en transparence et documentation des performances.", impact: "Patients : meilleure garantie de securite des algos. Soignants : outils plus documentes et encadres. Industriels : la preuve clinique continue et la gouvernance des modeles d'IA deviennent un differenciateur strategique majeur pour le marquage CE.", lien: "https://aihealthcarecompliance.com/monthly-news-and-updates-february-2026/", importance: "fort" },
  { id: 7, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "3 mars 2026", titre: "Nouvel arrete LATM sur la telesurveillance", nature: "reglementation", resume: "Un arrete du 3 mars 2026 inscrit une nouvelle activite de telesurveillance medicale sur la liste prevue a l'article L.162-52 du CSS, ouvrant droit a prise en charge Assurance maladie.", impact: "Pour les offreurs de telesurveillance, confirmation que le perimetre LATM continue de s'elargir avec des fenetres d'acces remboursees pour des pathologies chroniques supplementaires.", lien: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053619011", importance: "critique" },
  { id: 8, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "3 mars 2026", titre: "Forfait technique telesurveillance actualise", nature: "reglementation", resume: "Un arrete du 3 mars 2026 fixe le montant d'un forfait technique applicable a une activite de telesurveillance inscrite sur la LATM, module selon l'interet clinique et organisationnel.", impact: "Cadre economique previsible aux operateurs et industriels : modele de revenus recurrent par patient, conditionne a la demonstration de benefice clinique ou organisationnel.", lien: "https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000053619050", importance: "fort" },
  { id: 9, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2023-2024, actif en 2026", titre: "Schema de prise en charge anticipee PECAN", nature: "reglementation", resume: "Le schema PECAN permet un acces precoce au remboursement pour les dispositifs numeriques therapeutiques et solutions de telesurveillance, avec une fenetre d'environ 12 mois pour demontrer le benefice clinique.", impact: "Voie d'acces acceleree pour les solutions de suivi a domicile, compatible avec des approches IA/DMN encore en phase de preuve.", lien: "https://www.icthealth.org/news/pecan-frances-fast-track-scheme-for-digital-health-applications", importance: "fort" },
  { id: 10, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "Juil. 2025", titre: "Enjeux ethiques et juridiques du parcours de telesurveillance", nature: "reglementation / ethique", resume: "Rapport e-sante France detaillant les obligations d'authentification, d'information, de consentement, et de possibilites de deconnexion des patients dans le cadre de la telesurveillance.", impact: "Renforce les exigences de conformite (RGPD, consentement, tracabilite) pour les operateurs de suivi a domicile des patients chroniques.", lien: "https://esante.gouv.fr/sites/default/files/media_entity/documents/rapport-telesurveillance-22072025.pdf", importance: "moyen" },
  { id: 11, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2 fev. 2026", titre: "Mon espace sante et controle des donnees", nature: "reglementation / donnees", resume: "L'application Mon espace sante permet aux citoyens francais de controler l'acces a leurs donnees medicales, y compris pour la recherche et les usages numeriques, avec interoperabilite europeenne renforcee.", impact: "Le suivi a domicile devra s'integrer finement a cet ecosysteme, avec des flux de donnees respectant le controle patient et les futurs cadres europeens (EHDS).", lien: "https://horizonviesante.com/", importance: "moyen" },
  { id: 12, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "10 fev. 2026", titre: "Patients chroniques et ouverture au soin a distance", nature: "techno / usages", resume: "L'etude REACTIVE (AP-HP, Inserm) montre qu'en France, une proportion importante de patients chroniques se dit prete a recourir au soin a distance, alors que 47% n'ont aucune possibilite de suivi a distance avec leur medecin.", impact: "Confirme un gap entre appetence patients et offre reelle de teleconsultation/telesuivi, creant un espace d'innovation pour des solutions hybrides IA + suivi humain.", lien: "https://presse.inserm.fr/suivi-des-maladies-chroniques-un-patient-sur-deux-serait-ouvert-a-la-teleconsultation/72085/", importance: "fort" },
  { id: 13, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2025 (tendance)", titre: "Patchs connectes et telesurveillance continue", nature: "techno", resume: "Les patchs connectes et dispositifs portables permettent une surveillance continue des patients a domicile, avec une reduction significative des readmissions et des couts de sante (baisse de 6 a 21% des depenses selon les pathologies).", impact: "Coeur technologique du marche vers des capteurs peu intrusifs, couples a de l'IA d'alerte precoce, avec forte attente des payeurs sur la demonstration d'impact medico-economique.", lien: "https://www.caducee.net/actualite-medicale/16571/la-telesurveillance-medicale-une-revolution-portee-par-les-patchs-connectes.html", importance: "fort" },
  { id: 14, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "4 fev. 2026", titre: "Appel EP PerMed MultiPMData2026", nature: "techno / financement", resume: "L'appel RITC2026 EP PerMed finance des projets de medecine personnalisee bases sur des donnees multimodales pour la gestion de patients multimorbides, incluant diagnostic, suivi et monitoring a distance via wearables.", impact: "Opportunite pour des projets de telesurveillance IA integrant donnees capteurs, DMP et contextuelles, ciblant la multimorbidite chronique.", lien: "https://www.eppermed.eu/funding-projects/calls/ritc2026/", importance: "moyen" },
  { id: 15, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2 fev. 2026", titre: "IA et sante connectee pour le maintien a domicile des seniors", nature: "techno / usages", resume: "Les mutuelles s'appuient sur des solutions d'IA et de sante connectee (apps de suivi, rappels, detecteurs de chutes, robots compagnons) pour soutenir prevention et maintien a domicile des seniors.", impact: "Le marche se diversifie au-dela du seul binome hopital-patient, avec les complementaires comme prescripteurs et financeurs de solutions connectees.", lien: "https://mutuelle.fr/actualites/ia-et-sante-connectee-les-mutuelles-seniors-et-le-maintien-a-domicile/", importance: "moyen" },
  { id: 16, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2025 (actualise)", titre: "Telesurveillance, promesses et defis", nature: "techno / organisation", resume: "Un expert francais souligne que la telesurveillance est une brique essentielle du virage ambulatoire pour les maladies chroniques, mais pointe des freins d'investissement, d'integration organisationnelle et d'outillage.", impact: "La valeur se joue autant dans l'integration aux organisations de soins que dans la technologie elle-meme.", lien: "https://www.hospitalia.fr/Pr-Remi-Sabatier-la-telesurveillance-entre-promesses-et-defis_a4845.html", importance: "moyen" },
  { id: 17, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2025-2026", titre: "Croissance des acteurs europeens du remote patient monitoring", nature: "concurrence / acteurs", resume: "Le marche europeen de la telesurveillance connait une croissance soutenue, avec un CAGR de ~28,6% pour les financements sur 5 ans et une multiplication d'acteurs specialises dans le monitoring de patients chroniques.", impact: "Forte intensification concurrentielle, mais aussi validation de la traction marche aupres des investisseurs sur les pathologies prioritaires UE.", lien: "https://www.foundernest.com/insights/10-companies-focusing-on-the-remote-patient-monitoring-market-in-europe", importance: "fort" },
  { id: 18, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2026 (tendance)", titre: "Medecine personnalisee et multimorbidite comme priorites UE", nature: "concurrence / priorites UE", resume: "Les programmes europeens (EP PerMed, EU4Health, Horizon Europe) orientent les financements vers la prise en charge multimorbide et le passage a l'ambulatoire via telesurveillance et decisionnel avance.", impact: "Les acteurs alignant leur offre sur ces priorites beneficieront d'un meilleur acces aux subventions et partenaires institutionnels.", lien: "https://www.eppermed.eu/funding-projects/calls/ritc2026/", importance: "moyen" },
  { id: 19, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2026", titre: "Telemedecine et collectivites locales", nature: "acteurs / territoires", resume: "Les debats autour des municipales 2026 mettent en avant la telemedecine et la telesurveillance comme leviers cles pour lutter contre les deserts medicaux et assurer le suivi des maladies chroniques.", impact: "Les collectivites deviennent des interlocuteurs et co-financeurs potentiels pour deployer des solutions de suivi a domicile sur leurs territoires.", lien: "https://www.carenews.com/vyv-3/news/municipales-2026-la-sante-et-l-acces-aux-soins-au-coeur-des-preoccupations", importance: "moyen" },
  { id: 20, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2026", titre: "Mutuelles seniors et Silver Tech", nature: "acteurs / assurance", resume: "Les mutuelles se positionnent comme acteurs cles de la prevention technologique quotidienne pour les seniors, en integrant des dispositifs de sante connectee et d'IA dans leurs offres.", impact: "Modeles B2B2C ou l'assureur/mutuelle devient prescripteur et canal de distribution pour le suivi a domicile des maladies chroniques.", lien: "https://mutuelle.fr/actualites/ia-et-sante-connectee-les-mutuelles-seniors-et-le-maintien-a-domicile/", importance: "moyen" },
  { id: 21, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2023-2026", titre: "Acces au marche structure via LATM et PECAN", nature: "concurrence / acces marche", resume: "Les dispositifs de telesurveillance passent desormais par des listes structurees (LATM) et des schemas d'acces precoce (PECAN), avec un role fort de la HAS dans l'evaluation du benefice clinique ou organisationnel.", impact: "Les acteurs qui maitrisent ces parcours d'acces au marche prennent un avantage concurrentiel significatif en termes de vitesse de remboursement.", lien: "https://gnius.esante.gouv.fr/en/financing/reimbursement-profiles/remote-monitoring-reimbursement", importance: "moyen" },
  { id: 22, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "10 fev. 2026", titre: "Appetence patients pour telesuivi encore peu adressee", nature: "usages", resume: "L'etude REACTIVE montre une forte ouverture des patients chroniques a la teleconsultation et au suivi a distance, alors que pres de la moitie n'ont aucun dispositif offert par leur medecin.", impact: "Signale un marche sous-servi : des besoins patients clairs, mais manque de solutions integrees dans la pratique courante, notamment en ville.", lien: "https://presse.inserm.fr/suivi-des-maladies-chroniques-un-patient-sur-deux-serait-ouvert-a-la-teleconsultation/72085/", importance: "fort" },
  { id: 23, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2025-2026", titre: "Telesurveillance comme brique du virage ambulatoire", nature: "usages / organisation", resume: "Les analyses institutionnelles insistent sur le role de la telesurveillance pour prevenir complications et rehospitalisations, fluidifier les parcours et favoriser le maintien a domicile des patients chroniques.", impact: "Conforte l'ancrage de la telesurveillance dans les strategies nationales de passage a l'ambulatoire, en particulier pour les maladies cardio-metaboliques.", lien: "https://www.hospitalia.fr/Pr-Remi-Sabatier-la-telesurveillance-entre-promesses-et-defis_a4845.html", importance: "fort" },
  { id: 24, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2021-2025", titre: "Croissance du nombre de patients telesurveilles (ETAPES)", nature: "usages", resume: "Le programme ETAPES a vu le nombre de patients chroniques telesurveilles passer de 21 000 en 2019 a 85 000 en 2021, prefigurant l'entree dans le droit commun.", impact: "Les organisations de soins ont deja une experience significative, qui se generalise avec la LATM.", lien: "https://pro.campus.sanofi/fr/amelioration-des-systemes-de-sante/articles/telesurveillance-medicale-ou-en-est-on", importance: "moyen" },
  { id: 25, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2026", titre: "Maintien a domicile et Silver Economy", nature: "usages / social", resume: "Le maintien a domicile est un objectif majeur pour les seniors, les solutions de sante connectee et d'IA multipliant les cas d'usage (prevention, suivi medicamenteux, detection de chutes, lutte contre l'isolement).", impact: "Le suivi des maladies chroniques se combine avec des services plus larges (autonomie, lien social), ouvrant la porte a des offres integrees.", lien: "https://mutuelle.fr/actualites/ia-et-sante-connectee-les-mutuelles-seniors-et-le-maintien-a-domicile/", importance: "moyen" },
  { id: 26, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2026", titre: "Telemedecine contre les deserts medicaux", nature: "usages / territoires", resume: "Les debats politiques locaux promeuvent la telemedecine et le suivi a domicile comme outils cles pour repondre aux difficultes d'acces aux soins dans les zones sous-dotees.", impact: "Le suivi a domicile des patients chroniques devient un sujet de politique territoriale, pouvant beneficier de financements locaux.", lien: "https://www.carenews.com/vyv-3/news/municipales-2026-la-sante-et-l-acces-aux-soins-au-coeur-des-preoccupations", importance: "moyen" },
  { id: 27, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "Juil. 2025", titre: "Consentement, information et droit a la deconnexion", nature: "ethique / droit", resume: "Le rapport sur les enjeux ethiques de la telesurveillance rappelle l'obligation d'information detaillee, de consentement eclaire et de possibilite de deconnexion ou de changement de modalite de suivi.", impact: "Les dispositifs de suivi a domicile doivent etre concus avec une gouvernance explicite des risques, des droits et des modalites de sortie.", lien: "https://esante.gouv.fr/sites/default/files/media_entity/documents/rapport-telesurveillance-22072025.pdf", importance: "fort" },
  { id: 28, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2 fev. 2026", titre: "Controle citoyen sur les donnees de sante", nature: "ethique / donnees", resume: "Mon espace sante renforce le controle des citoyens sur l'utilisation et le partage de leurs donnees, y compris pour la recherche et le pilotage des politiques publiques, avec interoperabilite europeenne.", impact: "Le suivi a domicile doit articuler collecte intensive de donnees et respect d'un controle accru par le patient, notamment sur l'usage secondaire.", lien: "https://horizonviesante.com/", importance: "fort" },
  { id: 29, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2023-2026", titre: "Responsabilite des acteurs en telesurveillance a domicile", nature: "ethique / responsabilite", resume: "Les analyses juridiques precisent que l'etablissement et le medecin prescripteur sont responsables d'informer le patient sur les benefices et risques des DMN, et que la responsabilite peut etre engagee en cas de prejudice.", impact: "Les chaines de responsabilite (industriel-operateur-prescripteur) doivent etre clarifiees contractuellement et dans la documentation produit.", lien: "https://www.weka.fr/fiches-et-outils/telesurveillance-medicale-a-domicile-et-responsabilite-des-acteurs-de-soins-14126/", importance: "moyen" },
  { id: 30, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2026", titre: "Telesurveillance et equite territoriale", nature: "ethique / societe", resume: "La promotion de la telemedecine comme reponse aux deserts medicaux souleve la question de l'egalite d'acces (equipement numerique, competences, connectivite) pour les patients chroniques.", impact: "Risque de creuser les inegalites si les populations les plus fragiles ne beneficient pas des dispositifs de suivi a domicile.", lien: "https://www.carenews.com/vyv-3/news/municipales-2026-la-sante-et-l-acces-aux-soins-au-coeur-des-preoccupations", importance: "moyen" },
  { id: 31, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2026", titre: "Usage secondaire des donnees pour la recherche", nature: "ethique / gouvernance", resume: "Les cadres europeens encouragent l'usage de donnees de sante anonymisees/pseudonymisees pour la recherche et l'innovation, en garantissant des standards eleves de confidentialite.", impact: "Les projets de suivi a domicile peuvent devenir des sources majeures de donnees pour la recherche sur les maladies chroniques, sous reserve de gouvernance robuste.", lien: "https://www.eppermed.eu/funding-projects/calls/ritc2026/", importance: "moyen" },
  { id: 32, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "3 mars 2026", titre: "Forfaits de telesurveillance et modele economique", nature: "commerce / remboursement", resume: "Les forfaits de telesurveillance (operateur + forfait technique) sont fixes par arrete, avec des montants dependant de l'interet clinique/organisationnel, fournissant un cadre economique stable.", impact: "Permet d'adosser les business models a des revenus recurrents par patient, mais impose une demonstration solide de valeur.", lien: "https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000053619050", importance: "critique" },
  { id: 33, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2 fev. 2026", titre: "Mutuelles et maintien a domicile", nature: "commerce / assurance", resume: "Les mutuelles seniors integrent des solutions de sante connectee et d'IA pour la prevention et le maintien a domicile, devenant des acteurs commerciaux majeurs de la Silver Tech.", impact: "Le marche se structure en offres packagees incluant suivi a domicile, prevention et services d'accompagnement.", lien: "https://mutuelle.fr/actualites/ia-et-sante-connectee-les-mutuelles-seniors-et-le-maintien-a-domicile/", importance: "fort" },
  { id: 34, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2025-2026", titre: "Croissance des investissements RPM", nature: "commerce / investissement", resume: "Le marche du remote patient monitoring connait un fort interet des investisseurs, avec une croissance annuelle des financements de pres de 30% sur 5 ans.", impact: "Environnement favorable aux levees de fonds et a la consolidation, mais aussi selection accrue par les resultats cliniques/economiques.", lien: "https://www.foundernest.com/insights/10-companies-focusing-on-the-remote-patient-monitoring-market-in-europe", importance: "fort" },
  { id: 35, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2026", titre: "Demande territoriale en telesuivi", nature: "commerce / territoires", resume: "Les enjeux d'acces aux soins dans les territoires font de la telesurveillance un argument politique et economique pour securiser l'offre de soins locaux.", impact: "Espace pour des contrats pluriannuels avec les collectivites, combinant financement local et remboursements assurance maladie.", lien: "https://www.carenews.com/vyv-3/news/municipales-2026-la-sante-et-l-acces-aux-soins-au-coeur-des-preoccupations", importance: "moyen" },
  { id: 36, fichier: "Veille-IA-SuiviMedical.xlsx", campagne: "Veille Mars 2026", date: "2026", titre: "Valorisation des donnees de telesurveillance", nature: "commerce / data", resume: "Les donnees issues du suivi a domicile peuvent alimenter la recherche, l'innovation et les politiques publiques, dans le cadre de Mon espace sante et des partenariats europeens.", impact: "Cree un marche secondaire autour de la donnee (cohortes, etudes, analytics), sous forte contrainte de gouvernance et d'ethique.", lien: "https://www.eppermed.eu/funding-projects/calls/ritc2026/", importance: "moyen" }
];

// ============================================================
// CATEGORIES PAR DEFAUT
// ============================================================

const CATEGORIES_DEFAUT = {
  reglementaire: {
    label: "Reglementaire", emoji: "\uD83D\uDD34", color: "#C0392B",
    bgLight: "#FDECEA", bgMedium: "#F5B7B1",
    keywords: ["ai act","rgpd","mdr","medical device","regulation","directive","norme","marquage ce","conformite","dpo","cnil","has","ansm","classe iia","annexe","notification","latm","pecan","consentement","ethique","reglementation","arrete","css","droit commun","remboursement","prise en charge","juridique","responsabilite","certification","validation clinique","post-commercialisation","gouvernance","transparence","ehds","donnees de sante"]
  },
  technologique: {
    label: "Technologique", emoji: "\uD83D\uDD35", color: "#2E7DAF",
    bgLight: "#EBF5FB", bgMedium: "#AED6F1",
    keywords: ["ecg","cnn","deep learning","wearable","capteur","iot","edge computing","tinyml","remote monitoring","algorithme","classification","ptb-xl","signal","patchs connectes","biomarqueurs","fondation","open source","intelligence artificielle","machine learning","predictif","multimodal","wearables","vocal","depistage","interoperable"]
  },
  marche: {
    label: "Marche", emoji: "\uD83D\uDFE2", color: "#27AE60",
    bgLight: "#EAFAF1", bgMedium: "#A9DFBF",
    keywords: ["market size","croissance","healthtech","startup","levee de fonds","valorisation","part de marche","cagr","adoption","b2b","saas","forfait","investissement","silver economy","business model","revenus","marche","expansion","financement","economique","tarification","modele economique","virage ambulatoire","readmissions","couts","depenses"]
  },
  concurrentielle: {
    label: "Concurrentielle", emoji: "\uD83D\uDFE0", color: "#E67E22",
    bgLight: "#FDF2E9", bgMedium: "#F5CBA7",
    keywords: ["concurrent","alivecor","withings","apple watch","kardia","comparatif","benchmark","positionnement","avantage competitif","acteurs rpm","mutuelles","acteurs europeens","intensification","differenciation","concurrence","collectivites","partenariat","territoire","desert medical","silver tech","operateurs","industriels"]
  }
};

// ============================================================
// MOTEUR DE CLASSIFICATION
// ============================================================

function classifyEntry(entry, categories) {
  const cats = categories || CATEGORIES_DEFAUT;
  const text = `${entry.titre || ""} ${entry.resume || ""} ${entry.impact || ""} ${entry.nature || ""}`.toLowerCase();
  const scores = {};
  for (const [catKey, cat] of Object.entries(cats)) {
    const kws = cat.keywords || [];
    const matched = kws.filter(kw => text.includes(kw.toLowerCase()));
    const ratio = matched.length / Math.max(kws.length, 1);
    scores[catKey] = { count: matched.length, ratio, keywords: matched, confidence: Math.min(Math.round(ratio * 300), 100) };
  }
  let bestCat = Object.keys(cats)[0];
  let bestRatio = -1;
  for (const [catKey, score] of Object.entries(scores)) {
    if (score.ratio > bestRatio) { bestRatio = score.ratio; bestCat = catKey; }
  }
  return { ...entry, categorie: bestCat, scoreConfiance: scores[bestCat]?.confidence || 0, motsClesTrouves: scores[bestCat]?.keywords || [], tousScores: scores };
}

// ============================================================
// SVG COMPONENTS
// ============================================================

function TwinCareLogo({ size = 52 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38,72 C38,72 22,68 20,58 C18,50 24,44 24,44 C22,42 20,38 22,33 C24,28 29,26 33,27 C37,28 40,32 39,37 C38,41 36,43 34,44 C34,44 40,50 38,58 C37,63 38,72 38,72 Z" fill="white" opacity="0.9"/>
      <path d="M62,72 C62,72 78,68 80,58 C82,50 76,44 76,44 C78,42 80,38 78,33 C76,28 71,26 67,27 C63,28 60,32 61,37 C62,41 64,43 66,44 C66,44 60,50 62,58 C63,63 62,72 62,72 Z" fill="#5CB8E6" opacity="0.85"/>
      <circle cx="72" cy="18" r="2" fill="#5CB8E6"/>
      <circle cx="82" cy="12" r="1.5" fill="#5CB8E6"/>
      <circle cx="78" cy="22" r="1.5" fill="#5CB8E6"/>
      <circle cx="88" cy="18" r="1.5" fill="#5CB8E6"/>
      <line x1="72" y1="18" x2="82" y2="12" stroke="#5CB8E6" strokeWidth="1"/>
      <line x1="72" y1="18" x2="78" y2="22" stroke="#5CB8E6" strokeWidth="1"/>
      <line x1="82" y1="12" x2="88" y2="18" stroke="#5CB8E6" strokeWidth="1"/>
      <line x1="78" y1="22" x2="88" y2="18" stroke="#5CB8E6" strokeWidth="1"/>
      <line x1="67" y1="27" x2="72" y2="18" stroke="#5CB8E6" strokeWidth="0.8"/>
      <polyline points="20,52 26,52 28,52 29,46 30,56 31,43 32,58 33,52 38,52" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="62,52 67,52 68,52 69,46 70,56 71,43 72,58 73,52 78,52" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="46" y="44" width="8" height="16" rx="1.5" fill="white" opacity="0.95"/>
      <rect x="42" y="48" width="16" height="8" rx="1.5" fill="white" opacity="0.95"/>
    </svg>
  );
}

function EcgLine() {
  return (
    <svg viewBox="0 0 1200 60" className="w-full h-8" preserveAspectRatio="none" style={{ opacity: 0.15 }}>
      <polyline fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        points="0,30 80,30 120,30 140,30 160,28 180,30 200,30 240,30 260,30 270,30 280,8 290,52 300,4 310,56 320,30 340,30 380,30 420,30 460,30 480,28 500,30 520,30 560,30 580,30 590,30 600,8 610,52 620,4 630,56 640,30 660,30 700,30 740,30 780,30 800,28 820,30 840,30 880,30 900,30 910,30 920,8 930,52 940,4 950,56 960,30 980,30 1020,30 1060,30 1100,30 1120,28 1140,30 1160,30 1200,30"
      />
    </svg>
  );
}

// ============================================================
// MODAL FORMULAIRE (slide-in panel)
// ============================================================

function ModalFormulaire({ onClose, onAjouter, categories, campagnes }) {
  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  const defaultCampagne = campagnes.length > 0 ? campagnes[campagnes.length - 1] : "";
  const [form, setForm] = useState({ titre: "", date: today, nature: "", resume: "", impact: "", lien: "", importance: "fort", campagne: defaultCampagne, nouvelleCampagne: "" });

  const apercu = useMemo(() => {
    if (!form.titre && !form.resume) return null;
    return classifyEntry(form, categories);
  }, [form.titre, form.resume, form.impact, form.nature, categories]);

  function upd(field, val) { setForm(prev => ({ ...prev, [field]: val })); }

  function submit(e) {
    e.preventDefault();
    if (!form.titre.trim()) return;
    const campagneFinal = form.campagne === "__new" ? (form.nouvelleCampagne || "Nouvelle veille").trim() : form.campagne;
    onAjouter({ ...form, campagne: campagneFinal });
  }

  const inputStyle = { border: "1.5px solid #D5DDE5", color: "#1B3A5C", background: "#FFF", outline: "none" };
  const labelStyle = { color: "#1B3A5C", display: "block", fontSize: "11px", fontWeight: "600", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" };

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(27,58,92,0.45)", backdropFilter: "blur(3px)" }} onClick={onClose}>
      <div className="ml-auto h-full w-full max-w-lg bg-white flex flex-col" style={{ boxShadow: "-12px 0 50px rgba(0,0,0,0.18)" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: "linear-gradient(135deg, #1B3A5C 0%, #2E7DAF 100%)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div>
            <h2 className="text-white font-bold text-base">Ajouter une source</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Saisie manuelle avec classification automatique</p>
          </div>
          <button onClick={onClose} className="text-white rounded-full w-7 h-7 flex items-center justify-center text-lg leading-none" style={{ background: "rgba(255,255,255,0.15)" }}>×</button>
        </div>

        {/* Apercu */}
        {apercu && (
          <div className="mx-6 mt-4 mb-0 rounded-lg p-3 flex-shrink-0" style={{ background: (categories[apercu.categorie] || {}).bgLight || "#F0F5FA", border: `1.5px solid ${(categories[apercu.categorie] || {}).bgMedium || "#D5DDE5"}` }}>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#4A4A4F" }}>Classification automatique :</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: (categories[apercu.categorie] || {}).color || "#999" }}>
                {(categories[apercu.categorie] || {}).label || apercu.categorie}
              </span>
              <span className="text-xs" style={{ color: "#4A4A4F" }}>Confiance : <strong>{apercu.scoreConfiance}%</strong></span>
              {apercu.motsClesTrouves.slice(0, 3).map((kw, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: (categories[apercu.categorie] || {}).bgMedium || "#E0E0E0", color: (categories[apercu.categorie] || {}).color || "#333" }}>{kw}</span>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label style={labelStyle}>Titre *</label>
            <input required value={form.titre} onChange={e => upd("titre", e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg" style={inputStyle} placeholder="Titre de la source ou de l'article" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Date</label>
              <input value={form.date} onChange={e => upd("date", e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Importance</label>
              <select value={form.importance} onChange={e => upd("importance", e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg" style={inputStyle}>
                <option value="critique">Critique</option>
                <option value="fort">Fort</option>
                <option value="moyen">Moyen</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Campagne de veille</label>
            <select value={form.campagne} onChange={e => upd("campagne", e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg" style={inputStyle}>
              {campagnes.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="__new">+ Nouvelle campagne...</option>
            </select>
            {form.campagne === "__new" && (
              <input autoFocus value={form.nouvelleCampagne} onChange={e => upd("nouvelleCampagne", e.target.value)} placeholder="Ex : Veille Juin 2026" className="w-full mt-2 px-3 py-2 text-sm rounded-lg" style={{ ...inputStyle, border: "1.5px solid #5CB8E6" }} />
            )}
          </div>

          <div>
            <label style={labelStyle}>Nature / Type</label>
            <input value={form.nature} onChange={e => upd("nature", e.target.value)} placeholder="Ex : Rapport de marche, Analyse reglementaire..." className="w-full px-3 py-2 text-sm rounded-lg" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Resume</label>
            <textarea rows={4} value={form.resume} onChange={e => upd("resume", e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg resize-none" style={inputStyle} placeholder="Description de la source, principaux enseignements..." />
          </div>

          <div>
            <label style={labelStyle}>Impact strategique</label>
            <textarea rows={2} value={form.impact} onChange={e => upd("impact", e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg resize-none" style={inputStyle} placeholder="Impact pour TwinCare..." />
          </div>

          <div>
            <label style={labelStyle}>Lien source</label>
            <input type="url" value={form.lien} onChange={e => upd("lien", e.target.value)} placeholder="https://..." className="w-full px-3 py-2 text-sm rounded-lg" style={inputStyle} />
          </div>

          <div className="flex gap-3 pt-2 pb-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors" style={{ border: "1.5px solid #D5DDE5", color: "#4A4A4F" }}>Annuler</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-semibold rounded-lg text-white transition-colors" style={{ background: "#2E7DAF" }}>Ajouter la source</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// MODAL IMPORT
// ============================================================

function ModalImport({ onClose, onImporter, categories, campagnes }) {
  const [onglet, setOnglet] = useState("texte"); // "texte" | "csv"
  const [texte, setTexte] = useState("");
  const [campagneImport, setCampagneImport] = useState(campagnes.length > 0 ? campagnes[campagnes.length - 1] : "Nouvelle veille");
  const [nouvelleCampagne, setNouvelleCampagne] = useState("");
  const [apercu, setApercu] = useState(null);
  const fileRef = useRef(null);

  const formatInfo = "Format : une ligne par source. Colonnes separees par | (pipe)\nTitre | Date | Resume | Impact | Lien | Importance\n(seul le Titre est obligatoire)";

  function parser(raw) {
    return raw.split("\n").map(line => line.trim()).filter(l => l.length > 0 && !l.startsWith("#")).map((line, i) => {
      const parts = line.split("|").map(p => p.trim());
      return {
        titre: parts[0] || "",
        date: parts[1] || new Date().toLocaleDateString("fr-FR"),
        resume: parts[2] || "",
        impact: parts[3] || "",
        lien: parts[4] || "",
        importance: parts[5] || "moyen",
        nature: parts[6] || ""
      };
    }).filter(e => e.titre.length > 0);
  }

  function previsualiser() {
    const parsed = parser(texte);
    if (parsed.length === 0) return;
    const camp = campagneImport === "__new" ? (nouvelleCampagne || "Nouvelle veille").trim() : campagneImport;
    const withClass = parsed.map(e => classifyEntry({ ...e, campagne: camp }, categories));
    setApercu(withClass);
  }

  function confirmer() {
    if (!apercu) return;
    onImporter(apercu);
  }

  function lireCSV(file) {
    const reader = new FileReader();
    reader.onload = e => setTexte(e.target.result.split("\n").map(l => l.replace(/;/g, " | ")).join("\n"));
    reader.readAsText(file, "UTF-8");
  }

  const overlayStyle = { background: "rgba(27,58,92,0.45)", backdropFilter: "blur(3px)" };
  const cardStyle = { background: "#FFF", borderRadius: "16px", boxShadow: "0 24px 80px rgba(27,58,92,0.2)", width: "100%", maxWidth: "640px", maxHeight: "90vh", display: "flex", flexDirection: "column" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: "linear-gradient(135deg, #1B3A5C 0%, #2E7DAF 100%)", borderRadius: "16px 16px 0 0" }}>
          <div>
            <h2 className="text-white font-bold text-base">Import en lot</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Collez du texte ou importez un CSV</p>
          </div>
          <button onClick={onClose} className="text-white rounded-full w-7 h-7 flex items-center justify-center text-lg" style={{ background: "rgba(255,255,255,0.15)" }}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Onglets */}
          <div className="flex gap-2">
            {["texte", "csv"].map(t => (
              <button key={t} onClick={() => setOnglet(t)} className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all" style={onglet === t ? { background: "#2E7DAF", color: "#FFF" } : { background: "#F0F5FA", color: "#4A4A4F" }}>
                {t === "texte" ? "Coller du texte" : "Fichier CSV"}
              </button>
            ))}
          </div>

          {/* Campagne */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#1B3A5C" }}>Campagne de veille</label>
            <select value={campagneImport} onChange={e => setCampagneImport(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg" style={{ border: "1.5px solid #D5DDE5", color: "#1B3A5C" }}>
              {campagnes.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="__new">+ Nouvelle campagne...</option>
            </select>
            {campagneImport === "__new" && (
              <input value={nouvelleCampagne} onChange={e => setNouvelleCampagne(e.target.value)} placeholder="Ex : Veille Juin 2026" className="w-full mt-2 px-3 py-2 text-sm rounded-lg" style={{ border: "1.5px solid #5CB8E6", color: "#1B3A5C" }} />
            )}
          </div>

          {onglet === "texte" ? (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#1B3A5C" }}>Sources a importer</label>
              <pre className="text-[10px] mb-2 p-2 rounded" style={{ background: "#F0F5FA", color: "#4A4A4F", whiteSpace: "pre-wrap" }}>{formatInfo}</pre>
              <textarea rows={8} value={texte} onChange={e => setTexte(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg resize-none font-mono" style={{ border: "1.5px solid #D5DDE5", color: "#1B3A5C" }} placeholder={"Titre source 1 | Mars 2026 | Resume...\nTitre source 2 | Avr. 2026 | Resume..."} />
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#1B3A5C" }}>Fichier CSV (colonnes separees par ;)</label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors" style={{ borderColor: "#D5DDE5" }} onClick={() => fileRef.current.click()}>
                <svg className="mx-auto mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 16V4M12 4l-3 3M12 4l3 3" stroke="#2E7DAF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 16v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="#2E7DAF" strokeWidth="2" strokeLinecap="round"/></svg>
                <p className="text-sm" style={{ color: "#4A4A4F" }}>Cliquez pour selectionner un fichier CSV</p>
                <p className="text-xs mt-1" style={{ color: "#9AA5B1" }}>Colonnes : Titre ; Date ; Resume ; Impact ; Lien ; Importance</p>
                <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={e => { if (e.target.files[0]) lireCSV(e.target.files[0]); }} />
              </div>
              {texte && <p className="text-xs mt-2" style={{ color: "#27AE60" }}>Fichier charg‌e. {parser(texte).length} ligne(s) detectee(s). Cliquez "Previsualiser".</p>}
            </div>
          )}

          {/* Apercu */}
          {apercu && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "#1B3A5C" }}>{apercu.length} source(s) a importer :</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {apercu.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "#F0F5FA" }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: (categories[e.categorie] || {}).color || "#999" }} />
                    <span className="flex-1 font-medium truncate" style={{ color: "#1B3A5C" }}>{e.titre}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ background: (categories[e.categorie] || {}).color || "#999" }}>
                      {(categories[e.categorie] || {}).label || e.categorie}
                    </span>
                    <span style={{ color: "#4A4A4F" }}>{e.scoreConfiance}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid #E8EEF3" }}>
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium rounded-lg" style={{ border: "1.5px solid #D5DDE5", color: "#4A4A4F" }}>Annuler</button>
          {!apercu ? (
            <button onClick={previsualiser} disabled={!texte.trim()} className="flex-1 py-2.5 text-sm font-semibold rounded-lg text-white" style={{ background: texte.trim() ? "#2E7DAF" : "#9AA5B1" }}>Previsualiser</button>
          ) : (
            <button onClick={confirmer} className="flex-1 py-2.5 text-sm font-semibold rounded-lg text-white" style={{ background: "#27AE60" }}>Confirmer l'import ({apercu.length})</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MODAL PARAMETRES
// ============================================================

function ModalParametres({ onClose, categories, setCategories, onReclassifier }) {
  const [localCats, setLocalCats] = useState(() => JSON.parse(JSON.stringify(categories)));
  const [catActive, setCatActive] = useState(Object.keys(categories)[0]);
  const [newKw, setNewKw] = useState("");

  function addKw() {
    const kw = newKw.trim().toLowerCase();
    if (!kw) return;
    setLocalCats(prev => {
      const updated = { ...prev };
      updated[catActive] = { ...updated[catActive], keywords: [...(updated[catActive].keywords || []), kw] };
      return updated;
    });
    setNewKw("");
  }

  function removeKw(kw) {
    setLocalCats(prev => {
      const updated = { ...prev };
      updated[catActive] = { ...updated[catActive], keywords: updated[catActive].keywords.filter(k => k !== kw) };
      return updated;
    });
  }

  function sauvegarder() {
    setCategories(localCats);
    onReclassifier(localCats);
    onClose();
  }

  function reinitialiser() {
    setLocalCats(JSON.parse(JSON.stringify(CATEGORIES_DEFAUT)));
  }

  const catActive_data = localCats[catActive] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(27,58,92,0.45)", backdropFilter: "blur(3px)" }} onClick={onClose}>
      <div style={{ background: "#FFF", borderRadius: "16px", boxShadow: "0 24px 80px rgba(27,58,92,0.2)", width: "100%", maxWidth: "700px", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: "linear-gradient(135deg, #1B3A5C 0%, #2E7DAF 100%)", borderRadius: "16px 16px 0 0" }}>
          <div>
            <h2 className="text-white font-bold text-base">Parametres de classification</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Personnalisez les mots-cles par categorie</p>
          </div>
          <button onClick={onClose} className="text-white rounded-full w-7 h-7 flex items-center justify-center text-lg" style={{ background: "rgba(255,255,255,0.15)" }}>×</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar categories */}
          <div className="w-40 flex-shrink-0 p-3 space-y-1 border-r overflow-y-auto" style={{ borderColor: "#E8EEF3", background: "#F8FAFC" }}>
            {Object.entries(localCats).map(([key, cat]) => (
              <button key={key} onClick={() => setCatActive(key)} className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2" style={catActive === key ? { background: cat.bgLight, color: cat.color, border: `1px solid ${cat.bgMedium}` } : { color: "#4A4A4F" }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                {cat.label}
                <span className="ml-auto text-[10px]">{(cat.keywords || []).length}</span>
              </button>
            ))}
          </div>

          {/* Keywords panel */}
          <div className="flex-1 p-5 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full" style={{ background: catActive_data.color }} />
              <h3 className="font-bold text-sm" style={{ color: "#1B3A5C" }}>{catActive_data.label}</h3>
              <span className="text-xs ml-auto" style={{ color: "#4A4A4F" }}>{(catActive_data.keywords || []).length} mots-cles</span>
            </div>

            {/* Add keyword */}
            <div className="flex gap-2 mb-3">
              <input value={newKw} onChange={e => setNewKw(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addKw())} placeholder="Ajouter un mot-cle..." className="flex-1 px-3 py-2 text-sm rounded-lg" style={{ border: "1.5px solid #D5DDE5", color: "#1B3A5C", outline: "none" }} />
              <button onClick={addKw} className="px-4 py-2 text-sm font-semibold rounded-lg text-white" style={{ background: "#2E7DAF" }}>+</button>
            </div>

            {/* Keywords list */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-wrap gap-1.5">
                {(catActive_data.keywords || []).map(kw => (
                  <span key={kw} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: catActive_data.bgLight, color: catActive_data.color, border: `1px solid ${catActive_data.bgMedium}` }}>
                    {kw}
                    <button onClick={() => removeKw(kw)} className="leading-none opacity-60 hover:opacity-100 font-bold text-sm">×</button>
                  </span>
                ))}
              </div>
            </div>

            <p className="text-[10px] mt-3" style={{ color: "#9AA5B1" }}>
              Modifier les mots-cles et cliquer "Sauvegarder et reclassifier" pour reclassifier toutes les sources automatiquement.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid #E8EEF3" }}>
          <button onClick={reinitialiser} className="px-4 py-2.5 text-xs font-medium rounded-lg" style={{ border: "1.5px solid #D5DDE5", color: "#4A4A4F" }}>Reinitialiser par defaut</button>
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium rounded-lg" style={{ border: "1.5px solid #D5DDE5", color: "#4A4A4F" }}>Annuler</button>
          <button onClick={sauvegarder} className="px-6 py-2.5 text-sm font-semibold rounded-lg text-white" style={{ background: "#1B3A5C" }}>Sauvegarder et reclassifier</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

function ClassificateurVeille() {
  // --- State avec localStorage ---
  const [donnees, setDonnees] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.sources && saved.sources.length > 0) return saved.sources;
    } catch (e) {}
    return SOURCES_BRUTES_RAW.map(s => classifyEntry(s, CATEGORIES_DEFAUT));
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.categories) return saved.categories;
    } catch (e) {}
    return CATEGORIES_DEFAUT;
  });

  const [derniereMaj, setDerniereMaj] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.lastUpdate) return saved.lastUpdate;
    } catch (e) {}
    return new Date().toISOString();
  });

  // Persistance
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sources: donnees, categories, lastUpdate: derniereMaj }));
    } catch (e) {}
  }, [donnees, categories, derniereMaj]);

  // --- Filtres ---
  const [filtreCategorie, setFiltreCategorie] = useState("toutes");
  const [filtreCampagne, setFiltreCampagne] = useState("toutes");
  const [recherche, setRecherche] = useState("");
  const [triColonne, setTriColonne] = useState("id");
  const [triAsc, setTriAsc] = useState(true);
  const [menuOuvert, setMenuOuvert] = useState(null);

  // --- UI ---
  const [modal, setModal] = useState(null); // null | 'formulaire' | 'import' | 'parametres'
  const [showTimeline, setShowTimeline] = useState(false);
  const jsonImportRef = useRef(null);

  // --- Donnees derivees ---
  const campagnes = useMemo(() => {
    const set = new Set(donnees.map(d => d.campagne).filter(Boolean));
    return [...set].sort();
  }, [donnees]);

  const compteurs = useMemo(() => {
    const c = {};
    Object.keys(categories).forEach(k => { c[k] = 0; });
    donnees.forEach(d => { if (c[d.categorie] !== undefined) c[d.categorie]++; });
    return c;
  }, [donnees, categories]);

  const couverture = useMemo(() => {
    const alertes = [];
    Object.entries(categories).forEach(([key, cat]) => {
      if ((compteurs[key] || 0) < 3) alertes.push(`${cat.label} : ${compteurs[key] || 0} source(s)`);
    });
    const total = donnees.length;
    const nCats = Object.keys(categories).length;
    const ideal = total / nCats;
    const variance = Object.values(compteurs).reduce((acc, v) => acc + Math.abs(v - ideal), 0);
    const score = Math.max(0, Math.round(100 - (variance / Math.max(total, 1)) * 50));
    return { score, alertes };
  }, [donnees, compteurs, categories]);

  const statsCampagnes = useMemo(() => {
    return campagnes.map(camp => {
      const sources = donnees.filter(d => d.campagne === camp);
      const counts = {};
      Object.keys(categories).forEach(k => { counts[k] = 0; });
      sources.forEach(d => { if (counts[d.categorie] !== undefined) counts[d.categorie]++; });
      return { campagne: camp, total: sources.length, counts };
    });
  }, [donnees, campagnes, categories]);

  const donneesFiltrees = useMemo(() => {
    let result = donnees;
    if (filtreCategorie !== "toutes") result = result.filter(d => d.categorie === filtreCategorie);
    if (filtreCampagne !== "toutes") result = result.filter(d => d.campagne === filtreCampagne);
    if (recherche.trim()) {
      const q = recherche.toLowerCase();
      result = result.filter(d =>
        (d.titre || "").toLowerCase().includes(q) ||
        (d.resume || "").toLowerCase().includes(q) ||
        (d.fichier || "").toLowerCase().includes(q) ||
        (d.campagne || "").toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      let va = a[triColonne], vb = b[triColonne];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return triAsc ? -1 : 1;
      if (va > vb) return triAsc ? 1 : -1;
      return 0;
    });
    return result;
  }, [donnees, filtreCategorie, filtreCampagne, recherche, triColonne, triAsc]);

  // --- Actions ---
  function ajouterSource(entry) {
    const maxId = donnees.reduce((m, d) => Math.max(m, d.id || 0), 0);
    const classified = classifyEntry({ ...entry, id: maxId + 1, fichier: "Ajout manuel" }, categories);
    setDonnees(prev => [...prev, classified]);
    setDerniereMaj(new Date().toISOString());
    setModal(null);
  }

  function importerSources(entries) {
    const maxId = donnees.reduce((m, d) => Math.max(m, d.id || 0), 0);
    const classified = entries.map((e, i) => ({ ...e, id: maxId + 1 + i, fichier: e.fichier || "Import" }));
    setDonnees(prev => [...prev, ...classified]);
    setDerniereMaj(new Date().toISOString());
    setModal(null);
  }

  function changerCategorie(id, nouvelleCat) {
    setDonnees(prev => prev.map(d =>
      d.id === id ? { ...d, categorie: nouvelleCat, scoreConfiance: 100, motsClesTrouves: ["Manuel"] } : d
    ));
    setMenuOuvert(null);
  }

  function reclassifierTout(newCats) {
    setDonnees(prev => prev.map(d => d.motsClesTrouves && d.motsClesTrouves[0] === "Manuel" ? d : classifyEntry(d, newCats)));
    setDerniereMaj(new Date().toISOString());
  }

  function reinitialiser() {
    if (!window.confirm("Reinitialiser toutes les donnees ? Les sources ajoutees manuellement seront perdues.")) return;
    setDonnees(SOURCES_BRUTES_RAW.map(s => classifyEntry(s, CATEGORIES_DEFAUT)));
    setCategories(CATEGORIES_DEFAUT);
    setDerniereMaj(new Date().toISOString());
  }

  function exporterCSV() {
    const headers = ["ID", "Fichier", "Date", "Titre", "Campagne", "Categorie", "Score(%)", "Resume", "Impact", "Lien", "Importance"];
    const rows = donnees.map(d => [
      d.id, d.fichier || "", d.date || "",
      `"${(d.titre || "").replace(/"/g, '""')}"`,
      d.campagne || "",
      (categories[d.categorie] || {}).label || d.categorie,
      d.scoreConfiance,
      `"${(d.resume || "").replace(/"/g, '""')}"`,
      `"${(d.impact || "").replace(/"/g, '""')}"`,
      d.lien || "", d.importance || ""
    ]);
    const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "veille-twincare.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function exporterJSON() {
    const data = JSON.stringify({ sources: donnees, categories, lastUpdate: derniereMaj }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "veille-twincare-backup.json"; a.click();
    URL.revokeObjectURL(url);
  }

  function importerJSON(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.sources && data.sources.length > 0) setDonnees(data.sources);
        if (data.categories) setCategories(data.categories);
        if (data.lastUpdate) setDerniereMaj(data.lastUpdate);
      } catch (err) { window.alert("Fichier JSON invalide."); }
    };
    reader.readAsText(file, "UTF-8");
  }

  function trierPar(col) {
    if (triColonne === col) setTriAsc(!triAsc);
    else { setTriColonne(col); setTriAsc(true); }
  }

  const maxBarre = Math.max(...Object.values(compteurs), 1);
  const formattedDate = new Date(derniereMaj).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen" style={{ background: "#F0F5FA", fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>

      {/* Modals */}
      {modal === "formulaire" && <ModalFormulaire onClose={() => setModal(null)} onAjouter={ajouterSource} categories={categories} campagnes={campagnes} />}
      {modal === "import" && <ModalImport onClose={() => setModal(null)} onImporter={importerSources} categories={categories} campagnes={campagnes} />}
      {modal === "parametres" && <ModalParametres onClose={() => setModal(null)} categories={categories} setCategories={setCategories} onReclassifier={reclassifierTout} />}

      {/* EN-TETE */}
      <header className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1B3A5C 0%, #2E7DAF 100%)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative z-10 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <TwinCareLogo size={52} />
            <div>
              <h1 className="text-xl text-white tracking-tight leading-tight" style={{ letterSpacing: "-0.02em" }}>
                <span className="font-bold">Twin</span><span className="font-light" style={{ color: "rgba(255,255,255,0.85)" }}>Care</span>
              </h1>
              <p className="text-[11px] font-medium tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em" }}>Suivi Medical a Distance</p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>Classificateur de Veille Documentaire</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}>
              {donnees.length} sources
            </span>
            <button onClick={() => setModal("formulaire")} className="px-4 py-2 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition-all" style={{ background: "#5CB8E6" }}>
              <span className="text-base leading-none">+</span> Ajouter
            </button>
            <button onClick={() => setModal("import")} className="px-4 py-2 rounded-lg text-xs font-semibold transition-all" style={{ background: "transparent", color: "#FFF", border: "1.5px solid rgba(255,255,255,0.35)" }}>
              Importer
            </button>
            <button onClick={() => setModal("parametres")} className="px-3 py-2 rounded-lg text-xs font-semibold transition-all" style={{ background: "transparent", color: "#FFF", border: "1.5px solid rgba(255,255,255,0.35)" }} title="Parametres">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0"><EcgLine /></div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* STATS RAPIDES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Compteurs categories */}
          {Object.entries(categories).map(([key, cat]) => (
            <button key={key} onClick={() => setFiltreCategorie(filtreCategorie === key ? "toutes" : key)}
              className="bg-white rounded-xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{
                boxShadow: filtreCategorie === key ? `0 4px 20px ${cat.color}30, 0 1px 3px rgba(0,0,0,0.06)` : "0 1px 3px rgba(0,0,0,0.06)",
                borderLeft: `4px solid ${cat.color}`,
                border: filtreCategorie === key ? `1px solid ${cat.bgMedium}` : "1px solid #F0F0F0",
                borderLeft: `4px solid ${cat.color}`
              }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-3xl font-bold leading-none" style={{ color: cat.color }}>{compteurs[key] || 0}</span>
              </div>
              <p className="text-xs font-semibold" style={{ color: "#1B3A5C" }}>{cat.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#4A4A4F" }}>{filtreCategorie === key ? "Afficher toutes" : "Filtrer"}</p>
            </button>
          ))}
        </div>

        {/* BARRE INFO + ALERTES + DERNIERE MAJ */}
        <div className="flex flex-wrap gap-3">
          {/* Couverture */}
          <div className="bg-white rounded-xl px-5 py-4 flex items-center gap-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #E8EEF3", flex: "1 1 200px" }}>
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E8EEF3" strokeWidth="4"/>
                <circle cx="18" cy="18" r="14" fill="none" stroke={couverture.score >= 70 ? "#27AE60" : couverture.score >= 40 ? "#E67E22" : "#C0392B"} strokeWidth="4" strokeDasharray={`${couverture.score * 0.88} 88`} strokeLinecap="round"/>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold" style={{ color: "#1B3A5C" }}>{couverture.score}%</span>
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "#1B3A5C" }}>Score de couverture</p>
              <p className="text-[11px] mt-0.5" style={{ color: "#4A4A4F" }}>{couverture.alertes.length === 0 ? "Toutes les categories sont bien couvertes" : `${couverture.alertes.length} categorie(s) a renforcer`}</p>
            </div>
          </div>

          {/* Alertes */}
          {couverture.alertes.length > 0 && (
            <div className="bg-white rounded-xl px-5 py-4 flex-1" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #F5B7B1", flex: "1 1 200px" }}>
              <p className="text-xs font-semibold mb-1.5" style={{ color: "#C0392B" }}>Categories sous-representees</p>
              {couverture.alertes.map((a, i) => (
                <p key={i} className="text-[11px]" style={{ color: "#4A4A4F" }}>• {a}</p>
              ))}
            </div>
          )}

          {/* Derniere maj + actions donnees */}
          <div className="bg-white rounded-xl px-5 py-4 flex flex-col justify-between" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #E8EEF3", minWidth: "180px" }}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#9AA5B1" }}>Derniere mise a jour</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: "#1B3A5C" }}>{formattedDate}</p>
            </div>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              <button onClick={exporterCSV} className="px-2.5 py-1 rounded text-[10px] font-semibold transition-colors" style={{ background: "#EBF5FB", color: "#2E7DAF" }}>CSV</button>
              <button onClick={exporterJSON} className="px-2.5 py-1 rounded text-[10px] font-semibold transition-colors" style={{ background: "#EBF5FB", color: "#2E7DAF" }}>JSON</button>
              <button onClick={() => jsonImportRef.current.click()} className="px-2.5 py-1 rounded text-[10px] font-semibold transition-colors" style={{ background: "#EAFAF1", color: "#27AE60" }}>Charger</button>
              <button onClick={reinitialiser} className="px-2.5 py-1 rounded text-[10px] font-semibold transition-colors" style={{ background: "#FDECEA", color: "#C0392B" }}>Reset</button>
              <input ref={jsonImportRef} type="file" accept=".json" className="hidden" onChange={e => { if (e.target.files[0]) importerJSON(e.target.files[0]); }} />
            </div>
          </div>
        </div>

        {/* GRAPHIQUE + TIMELINE */}
        <section className="bg-white rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #E8EEF3" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: "#1B3A5C" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="12" width="4" height="9" rx="1" fill="#5CB8E6"/><rect x="10" y="6" width="4" height="15" rx="1" fill="#2E7DAF"/><rect x="17" y="9" width="4" height="12" rx="1" fill="#1B3A5C"/></svg>
              {showTimeline ? "Timeline par campagne" : "Repartition par categorie"}
            </h2>
            {campagnes.length > 1 && (
              <button onClick={() => setShowTimeline(!showTimeline)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={{ background: showTimeline ? "#1B3A5C" : "#F0F5FA", color: showTimeline ? "#FFF" : "#4A4A4F" }}>
                {showTimeline ? "Vue categories" : "Vue timeline"}
              </button>
            )}
          </div>

          {!showTimeline ? (
            <div className="space-y-3">
              {Object.entries(categories).map(([key, cat]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-28 text-xs font-medium flex items-center gap-1.5 flex-shrink-0" style={{ color: "#1B3A5C" }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ background: cat.color }} />
                    {cat.label}
                  </span>
                  <div className="flex-1 h-7 rounded-md overflow-hidden" style={{ background: "#F0F5FA" }}>
                    <div className="h-full rounded-md transition-all duration-700 flex items-center justify-end pr-2.5"
                      style={{ width: `${Math.max(((compteurs[key] || 0) / maxBarre) * 100, 6)}%`, background: cat.color }}>
                      <span className="text-[11px] font-bold text-white">{compteurs[key] || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "2px solid #E8EEF3" }}>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "#4A4A4F", width: "180px" }}>Campagne</th>
                    {Object.entries(categories).map(([key, cat]) => (
                      <th key={key} className="text-center py-2 px-2 font-semibold" style={{ color: cat.color }}>{cat.label}</th>
                    ))}
                    <th className="text-center py-2 px-2 font-semibold" style={{ color: "#1B3A5C" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {statsCampagnes.map((stat, i) => (
                    <tr key={stat.campagne} style={{ background: i % 2 === 0 ? "#FFF" : "#F8FAFC", borderBottom: "1px solid #E8EEF3" }}>
                      <td className="py-2 px-3 font-medium" style={{ color: "#1B3A5C" }}>{stat.campagne}</td>
                      {Object.entries(categories).map(([key, cat]) => (
                        <td key={key} className="text-center py-2 px-2">
                          <span className="inline-block w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: stat.counts[key] > 0 ? cat.bgLight : "transparent", color: stat.counts[key] > 0 ? cat.color : "#D5DDE5" }}>
                            {stat.counts[key] || 0}
                          </span>
                        </td>
                      ))}
                      <td className="text-center py-2 px-2 font-bold" style={{ color: "#1B3A5C" }}>{stat.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FILTRES */}
        <section className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
          <div className="flex-1 relative" style={{ minWidth: "200px" }}>
            <input type="text" placeholder="Rechercher titre, resume, campagne..." value={recherche} onChange={e => setRecherche(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none"
              style={{ border: "1.5px solid #D5DDE5", color: "#1B3A5C", background: "#FFF" }}
              onFocus={e => e.target.style.borderColor = "#5CB8E6"}
              onBlur={e => e.target.style.borderColor = "#D5DDE5"} />
            <svg className="absolute left-3 top-3" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#4A4A4F" strokeWidth="2"/>
              <path d="M16 16l4 4" stroke="#4A4A4F" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => { setFiltreCategorie("toutes"); setFiltreCampagne("toutes"); }}
              className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={filtreCategorie === "toutes" && filtreCampagne === "toutes" ? { background: "#1B3A5C", color: "#FFF" } : { background: "#FFF", color: "#4A4A4F", border: "1.5px solid #D5DDE5" }}>
              Tout ({donnees.length})
            </button>
            {Object.entries(categories).map(([key, cat]) => (
              <button key={key} onClick={() => setFiltreCategorie(filtreCategorie === key ? "toutes" : key)}
                className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={filtreCategorie === key ? { background: cat.color, color: "#FFF" } : { background: "#FFF", color: cat.color, border: `1.5px solid ${cat.bgMedium}` }}>
                {cat.emoji} {cat.label} ({compteurs[key] || 0})
              </button>
            ))}
            {campagnes.length > 1 && campagnes.map(camp => (
              <button key={camp} onClick={() => setFiltreCampagne(filtreCampagne === camp ? "toutes" : camp)}
                className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={filtreCampagne === camp ? { background: "#1B3A5C", color: "#FFF" } : { background: "#FFF", color: "#1B3A5C", border: "1.5px solid #D5DDE5" }}>
                {camp}
              </button>
            ))}
          </div>
        </section>

        {/* TABLEAU */}
        <section className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #E8EEF3" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#1B3A5C" }}>
                  {[
                    { key: "fichier", label: "Source" },
                    { key: "titre", label: "Titre / Extrait" },
                    { key: "campagne", label: "Campagne" },
                    { key: "categorie", label: "Categorie" },
                    { key: "scoreConfiance", label: "Confiance" },
                    { key: "importance", label: "Importance" }
                  ].map(col => (
                    <th key={col.key} onClick={() => trierPar(col.key)}
                      className="px-4 py-3 text-left text-xs font-semibold text-white cursor-pointer select-none"
                      style={{ letterSpacing: "0.03em" }}
                      onMouseEnter={e => e.target.style.background = "#2E7DAF"}
                      onMouseLeave={e => e.target.style.background = "transparent"}>
                      {col.label} {triColonne === col.key ? (triAsc ? "\u25B2" : "\u25BC") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {donneesFiltrees.map((d, i) => {
                  const cat = categories[d.categorie] || {};
                  return (
                    <tr key={d.id} className="transition-colors duration-150"
                      style={{ background: i % 2 === 0 ? "#FFFFFF" : "#F8FAFC", borderBottom: "1px solid #E8EEF3" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#EBF5FB"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#FFFFFF" : "#F8FAFC"}>

                      <td className="px-4 py-3">
                        <span className="text-[11px] px-2 py-1 rounded font-medium" style={{ background: "#EBF5FB", color: "#2E7DAF" }}>
                          {(d.fichier || "").replace(".xlsx", "").replace("Veille-IA-SuiviMedical", "SuiviMedical").replace("VeilleStrategique-Tableau", "Strategique")}
                        </span>
                        <div className="text-[11px] mt-1.5" style={{ color: "#4A4A4F" }}>{d.date}</div>
                      </td>

                      <td className="px-4 py-3 max-w-sm">
                        <p className="font-semibold leading-tight text-sm" style={{ color: "#1B3A5C" }}>{d.titre}</p>
                        <p className="text-xs mt-1 line-clamp-2" style={{ color: "#4A4A4F" }}>{(d.resume || "").slice(0, 140)}...</p>
                        {d.lien && (
                          <a href={d.lien} target="_blank" rel="noopener noreferrer"
                            className="text-xs mt-1 inline-flex items-center gap-1 transition-colors" style={{ color: "#2E7DAF" }}>
                            Source
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </a>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-[10px] px-2 py-1 rounded font-medium" style={{ background: "#F0F5FA", color: "#1B3A5C" }}>
                          {d.campagne || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 relative">
                        <button onClick={() => setMenuOuvert(menuOuvert === d.id ? null : d.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold hover:shadow-sm transition-all"
                          style={{ background: cat.bgLight || "#F0F5FA", color: cat.color || "#666", border: `1px solid ${cat.bgMedium || "#DDD"}` }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: cat.color || "#666" }} />
                          {cat.label || d.categorie}
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5 }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        </button>
                        {menuOuvert === d.id && (
                          <div className="absolute z-50 mt-1 bg-white rounded-lg p-1 min-w-[175px]" style={{ boxShadow: "0 10px 40px rgba(27,58,92,0.15)", border: "1px solid #E8EEF3" }}>
                            {Object.entries(categories).map(([catKey, catInfo]) => (
                              <button key={catKey} onClick={() => changerCategorie(d.id, catKey)}
                                className="w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-colors"
                                style={{ background: d.categorie === catKey ? catInfo.bgLight : "transparent", color: catInfo.color }}
                                onMouseEnter={e => e.currentTarget.style.background = catInfo.bgLight}
                                onMouseLeave={e => { if (d.categorie !== catKey) e.currentTarget.style.background = "transparent"; }}>
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catInfo.color }} />
                                {catInfo.label}
                                {d.categorie === catKey && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto" }}><path d="M5 13l4 4L19 7" stroke={catInfo.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: "#E8EEF3" }}>
                            <div className="h-full rounded-full" style={{ width: `${d.scoreConfiance}%`, background: d.scoreConfiance > 70 ? cat.color : d.scoreConfiance > 40 ? "#E67E22" : "#C0392B" }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: "#1B3A5C" }}>{d.scoreConfiance}%</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(d.motsClesTrouves || []).slice(0, 2).map((mc, j) => (
                            <span key={j} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: cat.bgLight || "#F0F5FA", color: cat.color || "#666" }}>{mc}</span>
                          ))}
                          {(d.motsClesTrouves || []).length > 2 && <span className="text-[10px]" style={{ color: "#4A4A4F" }}>+{d.motsClesTrouves.length - 2}</span>}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={
                          d.importance === "critique" ? { background: "#FDECEA", color: "#C0392B" } :
                          d.importance === "fort" ? { background: "#FDF2E9", color: "#E67E22" } :
                          { background: "#F0F5FA", color: "#4A4A4F" }
                        }>{d.importance || "—"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {donneesFiltrees.length === 0 && (
            <div className="text-center py-16" style={{ color: "#4A4A4F" }}>
              <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#D5DDE5" strokeWidth="2"/><path d="M16 16l4 4" stroke="#D5DDE5" strokeWidth="2" strokeLinecap="round"/></svg>
              <p className="text-sm">Aucune source ne correspond aux filtres actuels</p>
            </div>
          )}
          <div className="px-4 py-2 text-xs border-t" style={{ color: "#4A4A4F", borderColor: "#E8EEF3" }}>
            {donneesFiltrees.length} source(s) affichee(s) sur {donnees.length}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center py-4 flex items-center justify-center gap-2">
          <span className="text-xs font-medium" style={{ color: "#4A4A4F" }}>
            <span className="font-bold" style={{ color: "#1B3A5C" }}>Twin</span><span style={{ color: "#4A4A4F" }}>Care</span> — Veille documentaire | {donnees.length} sources | Mise a jour : {formattedDate}
          </span>
        </footer>
      </main>
    </div>
  );
}
