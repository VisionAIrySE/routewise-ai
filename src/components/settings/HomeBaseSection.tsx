import { useState, useEffect } from 'react';
import { Home, MapPin, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { UserProfileSettings } from '@/hooks/useSettings';

interface Props {
  profile: UserProfileSettings | null | undefined;
  onSave: (data: Partial<UserProfileSettings>) => Promise<unknown>;
  isSaving: boolean;
}

const US_STATES = [
  { value: 'OR', label: 'Oregon' },
  { value: 'WA', label: 'Washington' },
  { value: 'CA', label: 'California' },
  { value: 'ID', label: 'Idaho' },
  { value: 'NV', label: 'Nevada' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'TX', label: 'Texas' },
  { value: 'FL', label: 'Florida' },
];

export function HomeBaseSection({ profile, onSave, isSaving }: Props) {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('OR');
  const [zip, setZip] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (profile) {
      setAddress(profile.home_address || '');
      setCity(profile.home_city || '');
      setState(profile.home_state || 'OR');
      setZip(profile.home_zip || '');
      if (profile.home_lat && profile.home_lng) {
        setCoords({ lat: profile.home_lat, lng: profile.home_lng });
      }
    }
  }, [profile]);

  const handleGeocode = async () => {
    if (!address || !city || !zip) {
      toast.error('Please fill in address, city, and ZIP code');
      return;
    }

    setIsGeocoding(true);
    try {
      const fullAddress = `${address}, ${city}, ${state} ${zip}`;
      
      // Use Google Maps Geocoding API
      const geocoder = new google.maps.Geocoder();
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address: fullAddress }, (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });

      if (result.length > 0) {
        const location = result[0].geometry.location;
        setCoords({ lat: location.lat(), lng: location.lng() });
        toast.success('Location found!');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Could not find location. Please check the address.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSave = async () => {
    if (!coords) {
      toast.error('Please find coordinates first');
      return;
    }

    try {
      await onSave({
        home_address: address,
        home_city: city,
        home_state: state,
        home_zip: zip,
        home_lat: coords.lat,
        home_lng: coords.lng,
      });
      toast.success('Home base saved!');
    } catch (error) {
      toast.error('Failed to save home base');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Home Base
          <Badge variant="destructive" className="ml-2">Required</Badge>
        </CardTitle>
        <CardDescription>
          Your starting location for all routes. Must be set before route optimization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Portland"
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger id="state">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="zip">ZIP</Label>
            <Input
              id="zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="97201"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={handleGeocode} disabled={isGeocoding} variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            {isGeocoding ? 'Finding...' : 'Find Coordinates'}
          </Button>
          {coords && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-4 w-4" />
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={!coords || isSaving}>
          {isSaving ? 'Saving...' : 'Save Home Base'}
        </Button>
      </CardFooter>
    </Card>
  );
}
