import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDFXzz7nGa1bbMky3aZVfvfwikdGhrRRTQ';

interface AddressResult {
  address: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (result: AddressResult) => void;
  placeholder?: string;
  error?: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export function AddressAutocomplete({ value, onChange, placeholder, error }: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps?.places) {
      setIsGoogleLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize services when Google is loaded
  useEffect(() => {
    if (isGoogleLoaded && window.google?.maps?.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      // Create a hidden div for PlacesService
      const div = document.createElement('div');
      placesService.current = new window.google.maps.places.PlacesService(div);
    }
  }, [isGoogleLoaded]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (!val || val.length < 3 || !autocompleteService.current) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    autocompleteService.current.getPlacePredictions(
      {
        input: val,
        componentRestrictions: { country: 'us' },
        types: ['address'],
      },
      (results: any[], status: string) => {
        setIsLoading(false);
        if (status === 'OK' && results) {
          setPredictions(results);
          setShowDropdown(true);
        } else {
          setPredictions([]);
        }
      }
    );
  };

  const handleSelect = (prediction: any) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      { placeId: prediction.place_id, fields: ['formatted_address', 'geometry'] },
      (place: any, status: string) => {
        if (status === 'OK' && place) {
          const result: AddressResult = {
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setInputValue(result.address);
          onChange(result);
          setShowDropdown(false);
          setPredictions([]);
        }
      }
    );
  };

  // Geocode manually typed address (fallback when user doesn't select from dropdown)
  const geocodeAddress = () => {
    if (!inputValue || inputValue.length < 10 || !isGoogleLoaded) return;
    if (!window.google?.maps?.Geocoder) return;

    setIsLoading(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: inputValue }, (results: any[], status: string) => {
      setIsLoading(false);
      if (status === 'OK' && results && results[0]) {
        const result: AddressResult = {
          address: results[0].formatted_address,
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        setInputValue(result.address);
        onChange(result);
        setShowDropdown(false);
        setPredictions([]);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (predictions.length > 0) {
        handleSelect(predictions[0]);
      } else {
        geocodeAddress();
      }
    }
  };

  const handleBlur = () => {
    // Small delay to allow dropdown clicks to register
    setTimeout(() => {
      if (inputValue && !showDropdown) {
        geocodeAddress();
      }
    }, 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder || "Enter your address"}
          className={`pl-10 ${error ? 'border-destructive' : ''}`}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelect(prediction)}
              className="w-full px-4 py-3 text-left hover:bg-accent text-sm transition-colors border-b border-border last:border-b-0"
            >
              <span className="font-medium">{prediction.structured_formatting?.main_text}</span>
              <span className="text-muted-foreground ml-1">
                {prediction.structured_formatting?.secondary_text}
              </span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
