import { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { UserProfileSettings } from '@/hooks/useSettings';

interface Props {
  profile: UserProfileSettings | null | undefined;
  onSave: (data: Partial<UserProfileSettings>) => Promise<unknown>;
  isSaving: boolean;
}

export function VehicleSection({ profile, onSave, isSaving }: Props) {
  const [mpg, setMpg] = useState(25.0);
  const [fuelCost, setFuelCost] = useState(3.50);

  useEffect(() => {
    if (profile) {
      setMpg(profile.vehicle_mpg || 25.0);
      setFuelCost(profile.fuel_cost_per_gallon || 3.50);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await onSave({
        vehicle_mpg: mpg,
        fuel_cost_per_gallon: fuelCost,
      });
      toast.success('Vehicle settings saved!');
    } catch (error) {
      toast.error('Failed to save vehicle settings');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Vehicle Settings
        </CardTitle>
        <CardDescription>Used to calculate fuel costs on routes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mpg">Vehicle MPG</Label>
            <Input
              id="mpg"
              type="number"
              step="0.1"
              min="5"
              max="100"
              value={mpg}
              onChange={(e) => setMpg(parseFloat(e.target.value) || 25)}
            />
          </div>
          <div>
            <Label htmlFor="fuel-cost">Fuel Cost ($/gallon)</Label>
            <Input
              id="fuel-cost"
              type="number"
              step="0.01"
              min="1"
              max="10"
              value={fuelCost}
              onChange={(e) => setFuelCost(parseFloat(e.target.value) || 3.50)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Vehicle Settings'}
        </Button>
      </CardFooter>
    </Card>
  );
}
