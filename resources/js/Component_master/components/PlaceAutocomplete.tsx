import React, { useEffect, useRef, useState } from 'react';

interface PlaceAutocompleteProps {
  onPlaceSelect: ({ lat, lng }: { lat: number; lng: number }) => void;
}

//const PlaceAutocomplete = () => {
const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({ onPlaceSelect }) => {
  const elementRef = useRef(null);
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    const handlePlaceSelect = async (event) => {
    const placePrediction = event.placePrediction; 
    if (placePrediction) {
      try {
        const place = await placePrediction.toPlace();
        await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'viewport'] }); // Request location and viewport
        const currentlocation = place.viewport.getCenter().toJSON();
      
        onPlaceSelect(currentlocation.lat, currentlocation.lng);

      } catch (error) {
        console.error('Error fetching place details from prediction:', error);
      }
    } else {
      console.warn('Place prediction was still undefined. Check the "Full Event Object" properties carefully.');
    }
  };
  const attachEvent = () => {
    el.addEventListener('gmp-select', handlePlaceSelect);
    console.log('gmp-select event listener attached.');
  };

  if (customElements.get('gmp-place-autocomplete')) {
    attachEvent();
  } else {
    const observer = new MutationObserver(() => {
      if (customElements.get('gmp-place-autocomplete')) {
        attachEvent();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }
    return () => {
      if (el) {
        el.removeEventListener('gmp-select', handlePlaceSelect);
        console.log('gmp-select event listener removed.');
      }
    };
  }, []);

  return (
    <gmp-place-autocomplete ref={elementRef}>
      <input
        placeholder="Enter a location"
        type="text"
        style={{
          width: '100%',
          padding: '8px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
    </gmp-place-autocomplete>
  );
};
export default PlaceAutocomplete;