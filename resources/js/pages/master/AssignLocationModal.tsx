import { useState, useEffect, useRef } from "react";
import { MapPin, Hexagon, Square } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Use a valid Google Maps API key
//const GOOGLE_MAPS_API_KEY = "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg"; // Google Maps public test API key

interface AssignLocationProps {
  project: any;
  open: boolean;
  GOOGLE_MAPS_API_KEY:string,
  onOpenChange: (open: boolean) => void;
  onSave: (projectId: string, geofenceData: string, locationName: string) => void;
}

export default function AssignLocationModal({
  project,
  open,
  GOOGLE_MAPS_API_KEY,
  onOpenChange,
  onSave
}: AssignLocationProps) {
  const [polygonCoordinates, setPolygonCoordinates] = useState<Array<{lat: number, lng: number}>>([]);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const [locationName, setLocationName] = useState(project?.location || "");
  const { toast } = useToast();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const mapLoaderRef = useRef<Loader | null>(null);
  
  // Default center (Abu Dhabi)
  const defaultCenter = { lat: 24.4539, lng: 54.3773 };
  
  // Function to generate default polygon coordinates
  const generateDefaultCoordinates = () => {
    // Default to Abu Dhabi coordinates
    const center = defaultCenter;
    const points = 6; // Hexagon
    const radius = 0.01; // Small radius for the polygon
    
    const coordinates = [];
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      coordinates.push({
        lat: center.lat + Math.sin(angle) * radius,
        lng: center.lng + Math.cos(angle) * radius
      });
    }
    
    return coordinates;
  };
  
  // Calculate center of polygon for map focus
  const calculateCenter = (coordinates: Array<{lat: number, lng: number}>) => {
    if (coordinates.length === 0) {
      return defaultCenter; // Default to Abu Dhabi
    }
    
    const sumLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0);
    const sumLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0);
    
    return {
      lat: sumLat / coordinates.length,
      lng: sumLng / coordinates.length
    };
  };
  
  // Initialize Google Maps loader
  useEffect(() => {
    if (!mapLoaderRef.current) {
      mapLoaderRef.current = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["drawing", "places"]
      });
    }
  }, []);

  // Load and initialize the map when the modal opens
  useEffect(() => {
    if (!open || !mapRef.current) return;
    
    setIsMapLoading(true);
    setMapLoadFailed(false);
    setLocationName(project?.location || "");
    
    let coordinates: Array<{lat: number, lng: number}> = [];
    
    // Check if project already has coordinates
    if (project?.coordinates?.geofenceData) {
      try {
        coordinates = JSON.parse(project.coordinates.geofenceData);
        setPolygonCoordinates(coordinates);
      } catch (e) {
        console.error("Error parsing geofence data", e);
        // Generate default coordinates on error
        coordinates = generateDefaultCoordinates();
        setPolygonCoordinates(coordinates);
      }
    } else {
      // Generate default coordinates if none exist
      coordinates = generateDefaultCoordinates();
      setPolygonCoordinates(coordinates);
    }

    // Load the map
    if (mapLoaderRef.current) {
      mapLoaderRef.current.load()
        .then((google) => {
          // Create a map instance
          const mapCenter = coordinates.length > 0 ? calculateCenter(coordinates) : defaultCenter;
          const mapOptions: google.maps.MapOptions = {
            center: mapCenter,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
          };
          
          // Initialize the map
          const map = new google.maps.Map(mapRef.current!, mapOptions);
          googleMapRef.current = map;
          
          // Fix for map rendering in modal - Ensuring map renders correctly after modal is visible
          setTimeout(() => {
            google.maps.event.trigger(map, 'resize');
            // Recenter map after resize
            map.setCenter(mapCenter);
          }, 100);
          
          // Add polygon to the map if coordinates exist
          if (coordinates.length > 0) {
            drawPolygon(map, coordinates, google);
          }
          
          // Initialize Drawing Manager
          initDrawingManager(map, google);
          
          // Map is now loaded
          setIsMapLoading(false);
        })
        .catch(err => {
          console.error("Error loading Google Maps:", err);
          setIsMapLoading(false);
          setMapLoadFailed(true);
          toast({
            title: "Map Loading Issue",
            description: "Unable to load map. Please check API key or network connection.",
            variant: "destructive"
          });
        });
    }
    
    return () => {
      // Clean up polygon and drawing manager when modal closes
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
      
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setMap(null);
        drawingManagerRef.current = null;
      }
      
      setIsDrawingEnabled(false);
    };
  }, [open, project, toast]);
  
  // Initialize drawing manager - focused on polygon drawing only
  const initDrawingManager = (map: google.maps.Map, googleMaps: typeof google) => {
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setMap(null);
    }
    
    // Create drawing manager with polygon drawing only
    const drawingManager = new googleMaps.maps.drawing.DrawingManager({
      drawingMode: null, // Start with drawing disabled
      drawingControl: true,
      drawingControlOptions: {
        position: googleMaps.maps.ControlPosition.TOP_CENTER,
        drawingModes: [googleMaps.maps.drawing.OverlayType.POLYGON] // Only allow polygon drawing
      },
      polygonOptions: {
        strokeColor: "#1976d2",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#42a5f5",
        fillOpacity: 0.35,
        editable: true
      }
    });
    
    drawingManager.setMap(map);
    drawingManagerRef.current = drawingManager;
    
    // Add event listener for when drawing is complete
    googleMaps.maps.event.addListener(drawingManager, 'overlaycomplete', (event: any) => {
      // Remove any existing polygon
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
      }
      
      // Add the polygon to the map
      const polygon = event.overlay;
      polygonRef.current = polygon;
      
      // Turn off drawing mode after shape is created
      drawingManager.setDrawingMode(null);
      setIsDrawingEnabled(false);
      
      // Store polygon coordinates
      updatePolygonCoordinates(polygon);
      
      // Add event listeners to the polygon for editing
      const path = polygon.getPath();
      googleMaps.maps.event.addListener(path, 'set_at', () => {
        updatePolygonCoordinates(polygon);
      });
      
      googleMaps.maps.event.addListener(path, 'insert_at', () => {
        updatePolygonCoordinates(polygon);
      });
    });
  };

  // Update polygon coordinates from polygon object
  const updatePolygonCoordinates = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath();
    const newCoordinates: Array<{lat: number, lng: number}> = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      newCoordinates.push({ lat: point.lat(), lng: point.lng() });
    }
    
    setPolygonCoordinates(newCoordinates);
  };
  
  // Toggle drawing mode
  const toggleDrawingMode = () => {
    if (!drawingManagerRef.current || !googleMapRef.current) return;
    
    if (!isDrawingEnabled) {
      // Clear existing polygon when starting to draw a new one
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
        polygonRef.current = null;
        setPolygonCoordinates([]);
      }
      
      // Enable polygon drawing mode
      drawingManagerRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      setIsDrawingEnabled(true);
      
      toast({
        title: "Drawing Mode Active",
        description: "Click on the map to start drawing a polygon.",
      });
    } else {
      // Disable drawing mode
      drawingManagerRef.current.setDrawingMode(null);
      setIsDrawingEnabled(false);
    }
  };
  
  // Draw polygon on the map
  const drawPolygon = (
    map: google.maps.Map, 
    coordinates: Array<{lat: number, lng: number}>,
    googleMaps: typeof google
  ) => {
    // Clean up existing polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }
    
    // Create polygon
    const polygon = new googleMaps.maps.Polygon({
      paths: coordinates,
      strokeColor: "#1976d2",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#42a5f5",
      fillOpacity: 0.35,
      editable: true,
      map: map
    });
    
    polygonRef.current = polygon;
    
    // Listen for polygon changes
    googleMaps.maps.event.addListener(polygon.getPath(), "set_at", () => {
      const path = polygon.getPath();
      const newCoordinates: Array<{lat: number, lng: number}> = [];
      
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        newCoordinates.push({ lat: point.lat(), lng: point.lng() });
      }
      
      setPolygonCoordinates(newCoordinates);
    });
    
    googleMaps.maps.event.addListener(polygon.getPath(), "insert_at", () => {
      const path = polygon.getPath();
      const newCoordinates: Array<{lat: number, lng: number}> = [];
      
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        newCoordinates.push({ lat: point.lat(), lng: point.lng() });
      }
      
      setPolygonCoordinates(newCoordinates);
    });
    
    // Create bounds for the polygon and fit map to those bounds
    const bounds = new googleMaps.maps.LatLngBounds();
    coordinates.forEach(coord => {
      bounds.extend(new googleMaps.maps.LatLng(coord.lat, coord.lng));
    });
    map.fitBounds(bounds);
  };

  const handleSave = () => {
    if (!mapLoadFailed && polygonCoordinates.length < 3) {
      toast({
        title: "Error",
        description: "Please draw a valid polygon with at least 3 points.",
        variant: "destructive"
      });
      return;
    }
    
    if (!locationName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for this location.",
        variant: "destructive"
      });
      return;
    }
    
    // Prepare polygon data - either real coordinates or dummy data
    const geofenceData = mapLoadFailed ? 
      JSON.stringify([
        {lat: 24.4539, lng: 54.3773},
        {lat: 24.4639, lng: 54.3873},
        {lat: 24.4739, lng: 54.3773},
        {lat: 24.4639, lng: 54.3673}
      ]) : 
      JSON.stringify(polygonCoordinates);
      
    onSave(project.id, geofenceData, locationName);
    
    // Show success toast
    toast({
      title: "Success",
      description: mapLoadFailed ? "Dummy location perimeter saved successfully." : "Project perimeter assigned successfully.",
    });
    
    // Close the dialog
    onOpenChange(false);
  };
  
  // Render the dummy static map component
  const renderDummyMap = () => {
    return (
      <div className="space-y-4">
        <div className="text-sm font-medium mb-2">
          Project Location Preview (Simulated Map)
        </div>
        
        <div className="relative h-[400px] w-full rounded-md border border-gray-200 overflow-hidden bg-gray-100">
          {/* Map background with grid pattern */}
          <div className="absolute inset-0 bg-white" style={{
            backgroundImage: "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}></div>
          
          {/* Center polygon */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-[200px] h-[200px] bg-proscape/30 border-2 border-proscape transform rotate-45"></div>
          </div>
          
          {/* Map label */}
          <div className="absolute bottom-4 left-4 right-4 p-2 bg-white/80 rounded text-sm text-gray-600">
            Polygon represents the boundary for this project location.
          </div>
        </div>
        
        {/* Helper text */}
        <div className="text-sm">
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <div className="flex items-center font-medium text-blue-800 mb-1">
              <Square className="h-4 w-4 mr-1" /> 
              Location Information
            </div>
            <p className="text-xs text-blue-600">
              This is a simulated map view for the project location. 
              In a live environment, a real map with drawing tools would be available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hexagon className="h-5 w-5 text-proscape" />
            Assign Location Perimeter
          </DialogTitle>
          <DialogDescription>
            Define the geographical boundary for this project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="text-sm font-medium mb-2">
            Project: <span className="text-gray-700">{project?.name}</span>
          </div>
          
          {/* Location Name Input */}
          <div className="space-y-2">
            <Label htmlFor="location-name">Location Name</Label>
            <Input
              id="location-name"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Enter a name for this location"
              className="w-full"
            />
          </div>
          
          {/* Map Container - Show Google Maps or Dummy Map */}
          {!mapLoadFailed ? (
            <div 
              className="relative h-[400px] w-full rounded-md border border-gray-200 overflow-hidden"
              style={{ minHeight: "400px" }}
            >
              {isMapLoading && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-proscape mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading map...</p>
                  </div>
                </div>
              )}
              
              <div 
                ref={mapRef} 
                className="absolute inset-0 z-10"
                style={{ width: "100%", height: "100%" }}
              ></div>
            </div>
          ) : (
            // Render dummy static map when Google Maps fails to load
            renderDummyMap()
          )}

          {/* Drawing controls - only show if using real maps */}
          {!mapLoadFailed && (
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant={isDrawingEnabled ? "default" : "outline"}
                onClick={toggleDrawingMode}
                className={isDrawingEnabled ? "bg-blue-500 hover:bg-blue-600" : ""}
              >
                {isDrawingEnabled ? "Cancel Drawing" : "Draw New Polygon"}
              </Button>
              
              <div className="text-sm text-gray-500">
                {polygonCoordinates.length > 0 ? `Polygon with ${polygonCoordinates.length} points created` : "No polygon drawn yet"}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <div>
            {/* Additional options could be added here */}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-proscape hover:bg-proscape-dark text-white"
              onClick={handleSave}
              disabled={(!mapLoadFailed && polygonCoordinates.length < 3) || !locationName.trim()}
            >
              {mapLoadFailed ? "Confirm Location" : "Save Location"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
