import { AttributeGroup } from "./types";

export function getTechAttributeGroups(
  _category: string,
  subcategory: string,
  subSubCategory: string,
  productName: string
): AttributeGroup[] {
  const sub = subcategory.toLowerCase();
  const subSub = subSubCategory.toLowerCase();
  const name = productName.toLowerCase();
  const groups: AttributeGroup[] = [];

  // 1. Smartphones, Téléphones & Tablettes
  const isPhoneOrTablet =
    sub.includes("téléphon") ||
    sub.includes("tablette") ||
    subSub.includes("smartphone") ||
    subSub.includes("ipad") ||
    subSub.includes("tablette") ||
    name.includes("smartphone") ||
    name.includes("iphone") ||
    name.includes("galaxy") ||
    name.includes("xiaomi") ||
    name.includes("redmi") ||
    name.includes("oppo");

  if (isPhoneOrTablet) {
    groups.push({
      id: "phone_specs",
      title: "Caractéristiques Techniques : Smartphone & Tablette",
      iconName: "Smartphone",
      description: "Stockage, RAM, processeur, écran et autonomie",
      attributes: [
        {
          id: "tech_storage",
          label: "Capacité de Stockage",
          type: "select",
          options: ["32 Go", "64 Go", "128 Go", "256 Go", "512 Go", "1 To"],
        },
        {
          id: "tech_ram",
          label: "Mémoire RAM",
          type: "select",
          options: ["2 Go", "3 Go", "4 Go", "6 Go", "8 Go", "12 Go", "16 Go"],
        },
        {
          id: "tech_os",
          label: "Système d'exploitation",
          type: "select",
          options: ["Android (Google)", "iOS (Apple)", "iPadOS", "HarmonyOS"],
        },
        {
          id: "tech_screen_size",
          label: "Taille d'écran (pouces)",
          type: "text",
          placeholder: "Ex: 6.1\", 6.67\", 6.78\", 11\"",
        },
        {
          id: "tech_screen_tech",
          label: "Technologie d'écran",
          type: "select",
          options: ["AMOLED / Super AMOLED", "OLED 120Hz", "IPS LCD", "Liquid Retina", "TFT standard"],
        },
        {
          id: "tech_battery",
          label: "Batterie (Capacité en mAh)",
          type: "text",
          placeholder: "Ex: 5000 mAh, 6000 mAh",
        },
        {
          id: "tech_camera",
          label: "Appareil photo principal (Mpx)",
          type: "text",
          placeholder: "Ex: 50 MP + OIS, 108 MP, 200 MP",
        },
        {
          id: "tech_network",
          label: "Connectivité Réseau",
          type: "multiselect",
          options: ["5G Ultra Rapide", "4G LTE", "Double SIM (Nano + Nano)", "Compatible eSIM", "NFC", "Charge rapide sans fil"],
        },
      ],
    });
    return groups;
  }

  // 2. Ordinateurs, PC Portables & PC Fixes
  const isComputer =
    sub.includes("ordinateur") ||
    sub.includes("pc") ||
    subSub.includes("pc portable") ||
    subSub.includes("pc de bureau") ||
    subSub.includes("macbook") ||
    subSub.includes("gamer") ||
    name.includes("laptop") ||
    name.includes("pc portable") ||
    name.includes("macbook");

  if (isComputer) {
    groups.push({
      id: "pc_specs",
      title: "Caractéristiques Techniques : Ordinateurs & PC",
      iconName: "Laptop",
      description: "Processeur, RAM, disque SSD, carte graphique et écran",
      attributes: [
        {
          id: "pc_cpu",
          label: "Processeur (CPU)",
          type: "select",
          options: ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "Apple M1 / M2 / M3 / M4"],
        },
        {
          id: "pc_ram",
          label: "Mémoire RAM",
          type: "select",
          options: ["8 Go", "16 Go", "32 Go", "64 Go"],
        },
        {
          id: "pc_storage",
          label: "Type & Capacité de Stockage",
          type: "select",
          options: ["SSD 256 Go NVMe", "SSD 512 Go NVMe", "SSD 1 To NVMe", "SSD 2 To NVMe", "Disque HDD 1 To"],
        },
        {
          id: "pc_gpu",
          label: "Carte Graphique (GPU)",
          type: "select",
          options: ["Puce intégrée (Intel Iris Xe / AMD Radeon)", "NVIDIA GeForce RTX 3050", "NVIDIA GeForce RTX 4050 / 4060", "NVIDIA GeForce RTX 4070 / 4080 / 4090", "Apple Silicon GPU"],
        },
        {
          id: "pc_screen",
          label: "Taille & Résolution Écran",
          type: "select",
          options: ["13.3\" - 14\" (Compact nomade)", "15.6\" Full HD (Standard polyvalent)", "16\" / 17.3\" 2K/4K 144Hz-240Hz (Gamer / Pro)"],
        },
        {
          id: "pc_os",
          label: "Système préinstallé",
          type: "select",
          options: ["Windows 11 Professionnel", "Windows 11 Famille", "macOS", "FreeDOS / Sans OS", "Linux Ubuntu"],
        },
      ],
    });
    return groups;
  }

  // 3. Audio, Casques, Écouteurs & Enceintes
  const isAudio =
    sub.includes("audio") ||
    subSub.includes("écouteur") ||
    subSub.includes("casque") ||
    subSub.includes("enceinte") ||
    name.includes("casque") ||
    name.includes("écouteur") ||
    name.includes("airpods") ||
    name.includes("enceinte");

  if (isAudio) {
    groups.push({
      id: "audio_specs",
      title: "Caractéristiques Spécifiques : Audio & Son",
      iconName: "Headphones",
      description: "Connexion, réduction de bruit et autonomie",
      attributes: [
        {
          id: "audio_type",
          label: "Type d'appareil Audio",
          type: "select",
          options: ["Écouteurs sans fil True Wireless", "Casque Bluetooth à arceau (Over-ear)", "Casque Gamer avec micro", "Enceinte Bluetooth nomade étanche", "Barre de son salon"],
        },
        {
          id: "audio_anc",
          label: "Réduction Active de Bruit (ANC)",
          type: "radio",
          options: ["Oui avec mode transparence", "Réduction passive de bruit", "Sans réduction de bruit"],
        },
        {
          id: "audio_battery",
          label: "Autonomie de batterie (heures)",
          type: "text",
          placeholder: "Ex: 6h écouteurs / 30h avec boîtier",
        },
        {
          id: "audio_connection",
          label: "Connectivité",
          type: "select",
          options: ["Bluetooth 5.3 sans fil", "Filaire Jack 3.5mm", "Double connexion Bluetooth + Jack", "Câble optique / HDMI ARC"],
        },
      ],
    });
    return groups;
  }

  // 4. TV, Vidéo & Projecteurs
  const isTv =
    sub.includes("tv") ||
    sub.includes("home cinéma") ||
    subSub.includes("télévis") ||
    subSub.includes("tv") ||
    name.includes("tv") ||
    name.includes("téléviseur");

  if (isTv) {
    groups.push({
      id: "tv_specs",
      title: "Caractéristiques Spécifiques : Téléviseurs & TV",
      iconName: "Tv",
      description: "Taille diagonale, dalle d'affichage et Smart TV",
      attributes: [
        {
          id: "tv_size",
          label: "Diagonale d'Écran (pouces) *",
          type: "select",
          options: ["32\" (80 cm)", "43\" (108 cm)", "50\" (127 cm)", "55\" (139 cm)", "65\" (164 cm)", "75\" (190 cm)", "85\" (215 cm)"],
        },
        {
          id: "tv_tech",
          label: "Technologie de la dalle",
          type: "select",
          options: ["OLED (Noirs parfaits & contraste infini)", "QLED / Mini-LED (Ultra lumineux)", "LED 4K Ultra HD", "Full HD 1080p"],
        },
        {
          id: "tv_smart",
          label: "Système Smart TV connecté",
          type: "select",
          options: ["Google TV / Android TV avec Play Store", "Samsung Tizen OS", "LG webOS", "Vidaa OS", "Non connecté (TV basique)"],
        },
        {
          id: "tv_ports",
          label: "Connectique",
          type: "multiselect",
          options: ["3 ou 4 ports HDMI 2.1", "Ports USB multimédia", "Sortie Audio Optique", "Wi-Fi intégré", "Bluetooth audio"],
        },
      ],
    });
    return groups;
  }

  return groups;
}
