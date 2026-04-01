
// Mock data for projects with coordinates
export const mockProjects = [
  { 
    id: 1, 
    name: "Main Building Construction",
    coordinates: { 
      geofenceData: JSON.stringify([
        { lat: 25.276987, lng: 55.296249 },
        { lat: 25.277987, lng: 55.297249 },
        { lat: 25.278987, lng: 55.296249 },
        { lat: 25.277987, lng: 55.295249 }
      ])
    }
  },
  { 
    id: 2, 
    name: "Bridge Expansion Project",
    coordinates: { 
      geofenceData: JSON.stringify([
        { lat: 25.266987, lng: 55.286249 },
        { lat: 25.267987, lng: 55.287249 },
        { lat: 25.268987, lng: 55.286249 },
        { lat: 25.267987, lng: 55.285249 }
      ])
    }
  },
  { 
    id: 3, 
    name: "Highway Renovation",
    coordinates: { 
      geofenceData: JSON.stringify([
        { lat: 25.256987, lng: 55.276249 },
        { lat: 25.257987, lng: 55.277249 },
        { lat: 25.258987, lng: 55.276249 },
        { lat: 25.257987, lng: 55.275249 }
      ])
    }
  },
  { 
    id: 4, 
    name: "Warehouse Project",
    coordinates: { 
      geofenceData: JSON.stringify([
        { lat: 25.246987, lng: 55.266249 },
        { lat: 25.247987, lng: 55.267249 },
        { lat: 25.248987, lng: 55.266249 },
        { lat: 25.247987, lng: 55.265249 }
      ])
    }
  },
  { 
    id: 5, 
    name: "Hospital Wing" 
    // No coordinates, won't show up in location-based projects
  }
];
