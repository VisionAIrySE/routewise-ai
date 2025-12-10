import { Clock, Car, MapPin, Fuel } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RouteSummaryProps {
  day: string;
  date: string;
  stops: number;
  totalHours: number;
  driveHours: number;
  inspectionHours: number;
  totalMiles: number;
  estimatedFuel: number;
  zones: string[];
}

export function RouteSummaryCard({
  day,
  date,
  stops,
  totalHours,
  driveHours,
  inspectionHours,
  totalMiles,
  estimatedFuel,
  zones
}: RouteSummaryProps) {
  return (
    <Card className="bg-card border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{day}</span>
          <span className="text-sm font-normal text-muted-foreground">{date}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stops}</p>
              <p className="text-xs text-muted-foreground">Stops</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{totalHours}</p>
              <p className="text-xs text-muted-foreground">Total Hours</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{totalMiles}</p>
              <p className="text-xs text-muted-foreground">Miles</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Fuel className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">${estimatedFuel}</p>
              <p className="text-xs text-muted-foreground">Est. Fuel</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Drive: {driveHours} hrs</span>
            <span className="text-muted-foreground">Inspections: {inspectionHours} hrs</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {zones.map(zone => (
              <span
                key={zone}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded dark:bg-blue-900/20 dark:text-blue-300"
              >
                {zone}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
