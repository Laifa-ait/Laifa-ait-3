/**
 * Cartographie officielle des 69 Wilayas Algériennes par zone logistique
 * Utilisé par Yalidine Express, ZR Express et Maystro Delivery
 */

export const WILAYA_ZONE_MAPPING: Record<string, number> = {
  // Zone 1 : Centre Urbain Principal
  "16": 1, // Alger
  "09": 1, // Blida
  "35": 1, // Boumerdès
  "42": 1, // Tipaza

  // Zone 2 : Nord & Grandes Métropoles
  "15": 2, // Tizi Ouzou
  "10": 2, // Bouira
  "26": 2, // Médéa
  "02": 2, // Chlef
  "44": 2, // Aïn Defla
  "31": 2, // Oran
  "25": 2, // Constantine
  "19": 2, // Sétif
  "23": 2, // Annaba
  "06": 2, // Béjaïa

  // Zone 3 : Nord Est / Ouest élargi & Littoral
  "13": 3, // Tlemcen
  "27": 3, // Mostaganem
  "29": 3, // Mascara
  "22": 3, // Sidi Bel Abbès
  "21": 3, // Skikda
  "24": 3, // Guelma
  "18": 3, // Jijel
  "34": 3, // Bordj Bou Arréridj
  "05": 3, // Batna
  "04": 3, // Oum El Bouaghi
  "36": 3, // El Tarf
  "41": 3, // Souk Ahras
  "43": 3, // Mila
  "48": 3, // Relizane
  "38": 3, // Tissemsilt
  "14": 3, // Tiaret
  "20": 3, // Saïda
  "40": 3, // Khenchela
  "46": 3, // Aïn Témouchent

  // Zone 4 : Hauts Plateaux & Portes du Sahara
  "17": 4, // Djelfa
  "07": 4, // Biskra
  "28": 4, // M'Sila
  "12": 4, // Tébessa
  "39": 4, // El Oued
  "03": 4, // Laghouat
  "32": 4, // El Bayadh
  "45": 4, // Naâma
  "51": 4, // Ouled Djellal
  "52": 4, // Béni Abbès

  // Zone 5 : Sud Moyen & Bassin Oasien
  "47": 5, // Ghardaïa
  "30": 5, // Ouargla
  "08": 5, // Béchar
  "53": 5, // In Salah
  "55": 5, // Touggourt
  "57": 5, // El M'Ghair
  "58": 5, // El Meniaa

  // Zone 6 : Grand Sud & Frontières
  "01": 6, // Adrar
  "11": 6, // Tamanrasset
  "37": 6, // Tindouf
  "33": 6, // Illizi
  "49": 6, // Timimoun
  "50": 6, // Bordj Badji Mokhtar
  "54": 6, // In Guezzam
  "56": 6, // Djanet

  // Wilayas déléguées et promues
  "59": 4, // Aflou
  "60": 4, // Barika
  "61": 4, // Ksar Chellala
  "62": 3, // Messaad
  "63": 4, // Ain Oussara
  "64": 3, // Boussaada
  "65": 4, // Touggourt ext
  "66": 4, // El Eulma
  "67": 4, // Ksar El Boukhari
  "68": 4, // Akbou
  "69": 3  // Maghnia
};
