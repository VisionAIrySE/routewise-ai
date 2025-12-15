import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import type { UserProfileSettings } from '@/hooks/useSettings';

interface Props {
  profile: UserProfileSettings | null | undefined;
  onSave: (data: Partial<UserProfileSettings>) => Promise<unknown>;
  isSaving: boolean;
}

export function WorkPreferencesSection({ profile, onSave, isSaving }: Props) {
  const [hours, setHours] = useState(8.0);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [maxDrive, setMaxDrive] = useState(90);
  const [buffer, setBuffer] = useState(0);

  useEffect(() => {
    if (profile) {
      setHours(profile.default_available_hours || 8.0);
      setStartTime(profile.preferred_start_time || '08:00');
      setEndTime(profile.preferred_end_time || '17:00');
      setMaxDrive(profile.max_drive_minutes || 90);
      setBuffer((profile.drive_time_buffer || 0) * 100);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await onSave({
        default_available_hours: hours,
        preferred_start_time: startTime,
        preferred_end_time: endTime,
        max_drive_minutes: maxDrive,
        drive_time_buffer: buffer / 100,
      });
      toast.success('Work preferences saved!');
    } catch (error) {
      toast.error('Failed to save work preferences');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Work Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="hours">Default Work Hours per Day</Label>
          <Input
            id="hours"
            type="number"
            step="0.5"
            min="1"
            max="16"
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value) || 8)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-time">Preferred Start Time</Label>
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end-time">Preferred End Time</Label>
            <Input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="max-drive">Max One-Way Drive (minutes)</Label>
          <Input
            id="max-drive"
            type="number"
            min="15"
            max="240"
            value={maxDrive}
            onChange={(e) => setMaxDrive(parseInt(e.target.value) || 90)}
          />
        </div>
        <div>
          <Label>Weather/Road Buffer (%)</Label>
          <div className="flex items-center gap-4 mt-2">
            <Slider
              value={[buffer]}
              onValueChange={([v]) => setBuffer(v)}
              min={0}
              max={30}
              step={5}
              className="flex-1"
            />
            <span className="w-12 text-right text-sm font-medium">{buffer}%</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Add 10-20% for rain, snow, or construction
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Work Preferences'}
        </Button>
      </CardFooter>
    </Card>
  );
}
