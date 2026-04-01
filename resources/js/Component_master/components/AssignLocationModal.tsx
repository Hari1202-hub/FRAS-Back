import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PlaceAutocomplete from './PlaceAutocomplete';

interface AssignLocationModalProps {
  project: any;
  isOpen: boolean;
  GOOGLE_MAPS_API_KEY:string
  onClose: () => void;
  onSave: (projectId: number, location: string) => void;
}

export default function AssignLocationModal({
  project,
  isOpen,
  GOOGLE_MAPS_API_KEY,
  onClose,
  onSave,
}: AssignLocationModalProps) {
  console.log(GOOGLE_MAPS_API_KEY);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const drawingManager = useRef(null);
  const currentPolygon = useRef(null);
  const existingPolygon = useRef(null);
 

  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();
    onSave(project.guid, latitude, longitude,address);
    onClose();
  };

  const loadGoogleMapsAPI = (callback: Function) => {
  if (window.google && customElements.get('gmp-place-autocomplete')) {
    callback();
    return;
  }
  if (document.getElementById('google-maps-script')) {
    callback(); // If the script is already in the DOM but not loaded yet
    return;
  }

  const googleMapsScript = document.createElement("script");
  googleMapsScript.src =
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyA3Dn22K37fJqtA5oU5wmRepaGzoOaDnk8&libraries=places,drawing&v=weekly";
  googleMapsScript.async = true;
  googleMapsScript.defer = true;

  googleMapsScript.onload = () => {
    if (!document.getElementById('google-maps-web-components')) {
      const componentScript = document.createElement("script");
      componentScript.id = "google-maps-web-components";
      componentScript.type = "module";
      componentScript.src =
        "https://unpkg.com/@googlemaps/extended-component-library/dist/index.min.js";
      componentScript.onload = () => {
        console.log("Google Maps Web Components loaded.");
        callback();
      };
      document.head.appendChild(componentScript);
    } else {
      callback();
    }
  };

  document.head.appendChild(googleMapsScript);
};

  const initializeMap = (cur_lat = 13.090280396661807, cur_lng = 80.27594586748616) => {
    googleMap.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: cur_lat, lng: cur_lng },
      zoom: 12,
      mapTypeControl: true,  // Disable satellite and terrain control
      fullscreenControl: true,  // Enable fullscreen control
    });

    

    // Enable clicking on the map to set a location
    googleMap.current.addListener("click", (event) => {
      const clickedLocation = event.latLng;

      // Add a marker on the map
      new window.google.maps.Marker({
        position: clickedLocation,
        map: googleMap.current,
      });

      setLatitude(clickedLocation.lat());
      setLongitude(clickedLocation.lng());
    });

    // Set up DrawingManager for Polygon only
    drawingManager.current = new window.google.maps.drawing.DrawingManager({
      drawingMode: window.google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ["polygon"],
      },
      polygonOptions: {
        fillColor: "#ff0000",
        fillOpacity: 0.3,
        strokeWeight: 2,
        clickable: true,
        editable: true,
        zIndex: 1,
      },
      map: googleMap.current,
    });

    // Event: when polygon is completed
    window.google.maps.event.addListener(drawingManager.current, "polygoncomplete", (polygon) => {
      if (currentPolygon.current) {
        currentPolygon.current.setMap(null);
      }
      if (existingPolygon.current) {
        existingPolygon.current.setMap(null);
      }
      currentPolygon.current = polygon;
      const path = polygon.getPath();
      const geocoder = new window.google.maps.Geocoder();

      let lat_coordinates = "";
      let lng_coordinates = "";
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        console.log(point);
        lat_coordinates = lat_coordinates + point.lat() + ",";
        lng_coordinates = lng_coordinates + point.lng() + ",";
         geocoder.geocode({ location: point }, (results, status) => {
          if (status === "OK" && results[0]) {
            setAddress(results[0].formatted_address);
            console.log(`Address for point ${i}:`, results[0].formatted_address);
          } else {
            console.error(`Geocoder failed for point ${i}:`, status);
          }
        });
      }
      setLatitude(lat_coordinates);
      setLongitude(lng_coordinates);
      //console.log("Polygon coordinates:", lat_coordinates, lng_coordinates);
    });

    // Check if the project has a predefined polygon (optional)
    if (project && project.project_lat_lng && project.project_lat_lng.length > 0) {
      const polygonCoords = project.project_lat_lng.map((coord: any) => ({
        lat: parseFloat(coord.latitude),
        lng: parseFloat(coord.longitude),
      }));
      if (existingPolygon.current) {
        existingPolygon.current.setMap(null);
      }

      // Draw the existing polygon on the map
      existingPolygon.current = new window.google.maps.Polygon({
        paths: polygonCoords,
        map: googleMap.current,
        fillColor: "#ff0000",
        fillOpacity: 0.3,
        strokeWeight: 2,
        clickable: true,
        editable: true,
        zIndex: 1,
      });

      // Use LatLngBounds to fit the map view to the polygon
      const bounds = new window.google.maps.LatLngBounds();
      polygonCoords.forEach((coord) => {
        bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
      });

      googleMap.current.fitBounds(bounds);
    }
  };

  useEffect(() => {
    if (isOpen && project) {
      const latLng = project.project_lat_lng && project.project_lat_lng[0];
      const lat = latLng?.latitude ? parseFloat(latLng.latitude) : 13.090280396661807;
      const lng = latLng?.longitude ? parseFloat(latLng.longitude) : 80.27594586748616;
      if (latLng) {
        var lat_coordinates = "";
        var lng_coordinates = "";
        const latLngs = project.project_lat_lng || [];
        latLngs.map((proj: any) => {
          lat_coordinates = lat_coordinates + proj.project_lat_lng + ",";
          lng_coordinates = lng_coordinates + proj.project_lat_lng + ",";
        });
        setLatitude(lat_coordinates || "");
        setLongitude(lng_coordinates || "");

        loadGoogleMapsAPI(() => {
          setTimeout(() => {
            if (mapRef.current) {
              initializeMap(lat, lng);
            }
          }, 100);
        });
      } else {
        loadGoogleMapsAPI(() => {
          setTimeout(() => {
            if (mapRef.current) {
              initializeMap();
            }
          }, 100);
        });
      }
    }
  }, [isOpen, project]);


  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent 
    className="sm:max-w-[425px]" 
    aria-labelledby="dialog-title" 
    aria-describedby="dialog-description"
  >
    <div className="space-y-2">
      <Label>Search Location</Label>
      <PlaceAutocomplete onPlaceSelect={(lat,lng)=>{
          if (googleMap.current) {
            googleMap.current.setCenter({ lat, lng });
            googleMap.current.setZoom(17);
        
          }
      }}/>
    </div>
    <DialogHeader>
      <DialogTitle id="dialog-title">Assign Location</DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-4">
      <div ref={mapRef} style={{ height: "400px", width: "100%", position: "relative" }} />
      <div>
        <Label>Project</Label>
        <p className="text-sm text-gray-600">
          {project.projectname} ({project.projectid})
        </p>
      </div>
      <div>
        <Input
          type="hidden"
          id="latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="Enter project Latitude"
          required
        />
      </div>
      <div>
        <Input
          type="hidden"
          id="longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="Enter project Longitude"
          required
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Assign Location</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

  );
}