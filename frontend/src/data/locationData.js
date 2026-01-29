// Location data structure for Hydro Hub
// States > Districts > Villages hierarchy

export const locationData = {
    "Tamil Nadu": {
        icon: "temple",
        districts: {
            "Chennai": {
                villages: ["Kasimedu", "Nochikuppam", "Srinivasapuram", "Pattinapakkam"]
            },
            "Kanyakumari": {
                villages: ["Colachel", "Muttom", "Pallam", "Thoothoor"]
            },
            "Nagapattinam": {
                villages: ["Velankanni", "Poompuhar", "Vedaranyam", "Karaikal"]
            },
            "Cuddalore": {
                villages: ["Parangipettai", "Silver Beach", "Devanampattinam", "Pichavaram"]
            }
        }
    },
    "Kerala": {
        icon: "palm-tree",
        districts: {
            "Thiruvananthapuram": {
                villages: ["Kovalam", "Varkala", "Shanghumukham", "Vizhinjam"]
            },
            "Kollam": {
                villages: ["Thirumullavaram", "Chavara", "Neendakara", "Paravur"]
            },
            "Alappuzha": {
                villages: ["Mararikulam", "Arthunkal", "Andhakaranazhi", "Purakkad"]
            },
            "Thrissur": {
                villages: ["Nattika", "Chavakkad", "Chettuva", "Methala"]
            }
        }
    },
    "Telangana": {
        icon: "monument",
        districts: {
            "Hyderabad": {
                villages: ["Hussain Sagar", "Durgam Cheruvu", "Osman Sagar", "Himayat Sagar"]
            },
            "Warangal": {
                villages: ["Pakhal Lake", "Ramappa Lake", "Laknavaram Lake", "Ghanpur"]
            },
            "Nizamabad": {
                villages: ["Pocharam", "Sri Ram Sagar", "Kaddam", "Manjira"]
            },
            "Khammam": {
                villages: ["Kinnerasani", "Wyra", "Paloncha", "Taliperu"]
            }
        }
    },
    "Odisha": {
        icon: "beach",
        districts: {
            "Puri": {
                villages: ["Konark", "Satapada", "Astaranga", "Baliharchandi"]
            },
            "Ganjam": {
                villages: ["Gopalpur", "Rushikulya", "Chhatrapur", "Bahuda"]
            },
            "Balasore": {
                villages: ["Chandipur", "Talasari", "Dagara", "Udaypur"]
            },
            "Kendrapara": {
                villages: ["Hukitola", "Paradip", "Bhitarkanika", "Kharinasi"]
            }
        }
    }
};

// Helper function to get districts by state
export const getDistrictsByState = (state) => {
    if (!state || !locationData[state]) return [];
    return Object.keys(locationData[state].districts);
};

// Helper function to get villages by district
export const getVillagesByDistrict = (state, district) => {
    if (!state || !district || !locationData[state] || !locationData[state].districts[district]) {
        return [];
    }
    return locationData[state].districts[district].villages;
};

// Helper function to get state icon
export const getStateIcon = (state) => {
    if (!state || !locationData[state]) return "map-pin";
    return locationData[state].icon;
};
