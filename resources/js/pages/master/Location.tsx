import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Edit, Eye, MapPin, Plus, Search, Trash, X } from "lucide-react";

// Mock data
const initialLocations = [
  { 
    id: 1, 
    name: "Main Construction Site", 
    address: "123 Construction Ave, New York, NY 10001", 
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA",
    latitude: 40.7128,
    longitude: -74.0060,
    createdAt: "01/01/2023",
    status: "Active"
  },
  { 
    id: 2, 
    name: "Bridge Expansion Location", 
    address: "456 Bridge Rd, San Francisco, CA 94016", 
    city: "San Francisco",
    state: "CA",
    zipCode: "94016",
    country: "USA",
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: "05/15/2023",
    status: "Active"
  },
  { 
    id: 3, 
    name: "Highway Renovation Site", 
    address: "789 Highway Blvd, Chicago, IL 60601", 
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    country: "USA",
    latitude: 41.8781,
    longitude: -87.6298,
    createdAt: "08/22/2023",
    status: "Active"
  },
  { 
    id: 4, 
    name: "South Tower Project", 
    address: "101 Tower St, Miami, FL 33101", 
    city: "Miami",
    state: "FL",
    zipCode: "33101",
    country: "USA",
    latitude: 25.7617,
    longitude: -80.1918,
    createdAt: "11/10/2023",
    status: "Inactive"
  },
];

const Location = () => {
  const [locations, setLocations] = useState(initialLocations);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    latitude: "",
    longitude: ""
  });

  // Filter locations based on search term
  const filteredLocations = locations.filter((location) => 
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateLocation = () => {
    // Generate a new ID that's one higher than the current max ID
    const maxId = Math.max(...locations.map(l => l.id));
    const newId = maxId + 1;
    
    const locationToAdd = {
      id: newId,
      name: newLocation.name,
      address: newLocation.address,
      city: newLocation.city,
      state: newLocation.state,
      zipCode: newLocation.zipCode,
      country: newLocation.country,
      latitude: parseFloat(newLocation.latitude) || 0,
      longitude: parseFloat(newLocation.longitude) || 0,
      createdAt: new Date().toLocaleDateString("en-US"),
      status: "Active"
    };
    
    setLocations([...locations, locationToAdd]);
    setIsCreateModalOpen(false);
    
    // Reset form
    setNewLocation({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
      latitude: "",
      longitude: ""
    });
  };

  const handleLocationView = (location) => {
    setSelectedLocation(location);
    setIsViewModalOpen(true);
  };

  const handleLocationEdit = (location) => {
    setEditingLocation({
      ...location,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString()
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateLocation = () => {
    const updatedLocations = locations.map(loc => 
      loc.id === editingLocation.id 
        ? {
            ...editingLocation,
            latitude: parseFloat(editingLocation.latitude) || 0,
            longitude: parseFloat(editingLocation.longitude) || 0
          } 
        : loc
    );
    
    setLocations(updatedLocations);
    setIsEditModalOpen(false);
    setEditingLocation(null);
  };

  const toggleLocationStatus = (locationId) => {
    const updatedLocations = locations.map(loc => 
      loc.id === locationId 
        ? {...loc, status: loc.status === "Active" ? "Inactive" : "Active"} 
        : loc
    );
    
    setLocations(updatedLocations);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Locations</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center bg-proscape hover:bg-proscape-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
              placeholder="Search by name, address, or city"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Address</th>
                <th scope="col" className="px-4 py-3">City</th>
                <th scope="col" className="px-4 py-3">State</th>
                <th scope="col" className="px-4 py-3">Created Date</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.length > 0 ? (
                filteredLocations.map(location => (
                  <tr key={location.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{location.name}</td>
                    <td className="px-4 py-3">{location.address}</td>
                    <td className="px-4 py-3">{location.city}</td>
                    <td className="px-4 py-3">{location.state}</td>
                    <td className="px-4 py-3">{location.createdAt}</td>
                    <td className="px-4 py-3">
                      <span 
                        className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                          location.status === "Active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {location.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleLocationView(location)}
                          className="text-blue-500 hover:text-blue-700"
                          title="View Location"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleLocationEdit(location)}
                          className="text-gray-500 hover:text-gray-700"
                          title="Edit Location"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => toggleLocationStatus(location.id)}
                          className={
                            location.status === "Active" 
                              ? "text-red-500 hover:text-red-700" 
                              : "text-green-500 hover:text-green-700"
                          }
                          title={location.status === "Active" ? "Deactivate Location" : "Activate Location"}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    No locations found matching the search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredLocations.length}</span> of{" "}
            <span className="font-medium">{locations.length}</span> locations
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Create Location Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Location</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                  placeholder="Enter location name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                  placeholder="Enter complete address"
                  rows={3}
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    placeholder="Enter city"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation({...newLocation, city: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    placeholder="Enter state or province"
                    value={newLocation.state}
                    onChange={(e) => setNewLocation({...newLocation, state: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip/Postal Code *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    placeholder="Enter zip or postal code"
                    value={newLocation.zipCode}
                    onChange={(e) => setNewLocation({...newLocation, zipCode: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    placeholder="Enter country"
                    value={newLocation.country}
                    onChange={(e) => setNewLocation({...newLocation, country: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    placeholder="Enter latitude (e.g., 40.7128)"
                    value={newLocation.latitude}
                    onChange={(e) => setNewLocation({...newLocation, latitude: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    placeholder="Enter longitude (e.g., -74.0060)"
                    value={newLocation.longitude}
                    onChange={(e) => setNewLocation({...newLocation, longitude: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <MapPin className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-700">
                      Tip: You can get the exact coordinates by searching for the location on Google Maps, right-clicking on the map, and selecting "What's here?".
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLocation}
                className="px-4 py-2 bg-proscape hover:bg-proscape-dark text-white rounded-md text-sm font-medium transition-colors"
                disabled={!newLocation.name || !newLocation.address || !newLocation.city || !newLocation.state || !newLocation.zipCode}
              >
                Add Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Location Modal */}
      {isViewModalOpen && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Location Details</h2>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedLocation.name}</h3>
                  <p className="text-gray-500">
                    Created on {selectedLocation.createdAt}
                  </p>
                </div>
                <span 
                  className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                    selectedLocation.status === "Active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedLocation.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Address</h4>
                  <p className="text-gray-900">{selectedLocation.address}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Location</h4>
                  <p className="text-gray-900">
                    {selectedLocation.city}, {selectedLocation.state} {selectedLocation.zipCode}
                  </p>
                  <p className="text-gray-900">{selectedLocation.country}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Coordinates</h4>
                  <p className="text-gray-900">
                    Lat: {selectedLocation.latitude}, Long: {selectedLocation.longitude}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Associated Projects</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-900">Main Building Construction</p>
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-900">Office Tower Phase 2</p>
                    <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                      Planned
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-proscape hover:bg-proscape-dark text-white rounded-md text-sm font-medium transition-colors"
              >
                Edit Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {isEditModalOpen && editingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Location</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                  placeholder="Enter location name"
                  value={editingLocation.name}
                  onChange={(e) => setEditingLocation({...editingLocation, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                  placeholder="Enter complete address"
                  rows={3}
                  value={editingLocation.address}
                  onChange={(e) => setEditingLocation({...editingLocation, address: e.target.value})}
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    placeholder="Enter city"
                    value={editingLocation.city}
                    onChange={(e) => setEditingLocation({...editingLocation, city: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    placeholder="Enter state or province"
                    value={editingLocation.state}
                    onChange={(e) => setEditingLocation({...editingLocation, state: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip/Postal Code *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    placeholder="Enter zip or postal code"
                    value={editingLocation.zipCode}
                    onChange={(e) => setEditingLocation({...editingLocation, zipCode: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    placeholder="Enter country"
                    value={editingLocation.country}
                    onChange={(e) => setEditingLocation({...editingLocation, country: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    placeholder="Enter latitude (e.g., 40.7128)"
                    value={editingLocation.latitude}
                    onChange={(e) => setEditingLocation({...editingLocation, latitude: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-proscape"
                    placeholder="Enter longitude (e.g., -74.0060)"
                    value={editingLocation.longitude}
                    onChange={(e) => setEditingLocation({...editingLocation, longitude: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <MapPin className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-700">
                      Tip: You can get the exact coordinates by searching for the location on Google Maps, right-clicking on the map, and selecting "What's here?".
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLocation}
                className="px-4 py-2 bg-proscape hover:bg-proscape-dark text-white rounded-md text-sm font-medium transition-colors"
                disabled={!editingLocation.name || !editingLocation.address || !editingLocation.city || !editingLocation.state || !editingLocation.zipCode}
              >
                Update Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Location;
