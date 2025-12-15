import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile, useAddUserCompany, useUserCompanies } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AddressAutocomplete } from '@/components/onboarding/AddressAutocomplete';
import { CompanySelector } from '@/components/onboarding/CompanySelector';
import { CSVUploadModal } from '@/components/CSVUploadModal';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  MapPin,
  User,
  Building2,
  Settings,
  Sparkles
} from 'lucide-react';

interface SelectedCompany {
  company_id: string;
  code: string;
  name: string;
  avg_inspection_minutes: number;
}

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: userCompanies = [] } = useUserCompanies();
  const updateProfile = useUpdateProfile();
  const addUserCompany = useAddUserCompany();

  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [homeLat, setHomeLat] = useState<number | null>(null);
  const [homeLng, setHomeLng] = useState<number | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<SelectedCompany[]>([]);
  const [vehicleMpg, setVehicleMpg] = useState(25);
  const [fuelCost, setFuelCost] = useState('3.50');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if onboarding completed
  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate('/app', { replace: true });
    }
  }, [profile?.onboarding_completed, navigate]);

  // Prefill form from profile
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setHomeAddress(profile.home_address || '');
      setHomeLat(profile.home_lat);
      setHomeLng(profile.home_lng);
      setVehicleMpg(profile.vehicle_mpg || 25);
      setFuelCost(profile.fuel_cost_per_gallon?.toString() || '3.50');
      if (profile.typical_start_time) {
        setStartTime(profile.typical_start_time.substring(0, 5));
      }
      if (profile.typical_end_time) {
        setEndTime(profile.typical_end_time.substring(0, 5));
      }
    }
  }, [profile]);

  // Prefill selected companies from userCompanies
  useEffect(() => {
    if (userCompanies.length > 0 && selectedCompanies.length === 0) {
      setSelectedCompanies(
        userCompanies.map((uc) => ({
          company_id: uc.company_id || '',
          code: uc.company_name,
          name: uc.company_name,
          avg_inspection_minutes: uc.avg_inspection_minutes,
        }))
      );
    }
  }, [userCompanies]);

  // Determine starting step based on completed fields
  useEffect(() => {
    if (profile && !profile.onboarding_completed) {
      if (!profile.name) {
        setStep(2);
      } else if (!profile.home_address) {
        setStep(3);
      } else if (userCompanies.length === 0) {
        setStep(4);
      } else {
        setStep(5);
      }
    }
  }, [profile, userCompanies]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 10);
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 2) {
      if (!name.trim()) {
        newErrors.name = 'Name is required';
      }
    } else if (currentStep === 3) {
      if (!homeAddress.trim() || !homeLat || !homeLng) {
        newErrors.address = 'Please select an address from the dropdown';
      }
    } else if (currentStep === 4) {
      if (selectedCompanies.length === 0) {
        newErrors.companies = 'Please select at least one company';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveCurrentStep = async () => {
    setIsSaving(true);
    try {
      if (step === 2) {
        await updateProfile.mutateAsync({ name, phone: phone || null });
      } else if (step === 3) {
        await updateProfile.mutateAsync({
          home_address: homeAddress,
          home_lat: homeLat,
          home_lng: homeLng,
        });
      } else if (step === 4) {
        // Save companies
        for (const company of selectedCompanies) {
          const exists = userCompanies.some((uc) => uc.company_id === company.company_id);
          if (!exists) {
            await addUserCompany.mutateAsync({
              company_id: company.company_id,
              company_name: company.code,
              avg_inspection_minutes: company.avg_inspection_minutes,
            });
          }
        }
      } else if (step === 5) {
        await updateProfile.mutateAsync({
          vehicle_mpg: vehicleMpg,
          fuel_cost_per_gallon: parseFloat(fuelCost) || 3.5,
          typical_start_time: startTime + ':00',
          typical_end_time: endTime + ':00',
        });
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;

    await saveCurrentStep();
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSkipPreferences = async () => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({ onboarding_completed: true });
      navigate('/app', { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await saveCurrentStep();
      await updateProfile.mutateAsync({ onboarding_completed: true });
      setStep(6);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/app', { replace: true });
  };

  const handleUploadFirst = () => {
    setShowUploadModal(true);
  };

  const handleUploadComplete = () => {
    setShowUploadModal(false);
    navigate('/app', { replace: true });
  };

  const progressValue = ((step - 1) / TOTAL_STEPS) * 100;

  const timeOptions = [];
  for (let h = 6; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const min = m.toString().padStart(2, '0');
      const time = `${hour}:${min}`;
      const label = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
      timeOptions.push({ value: time, label });
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Bar (not shown on step 1 or 6) */}
        {step > 1 && step <= TOTAL_STEPS && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span>{Math.round(progressValue)}% complete</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        )}

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <img src="/favicon.png" alt="Inspector Route AI" className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Welcome to Inspector Route AI!</h1>
                <p className="text-muted-foreground mt-3 text-lg">
                  Let's get you set up in about 2 minutes. We'll optimize your inspection routes so you can earn more with less driving.
                </p>
              </div>
              <Button onClick={() => setStep(2)} size="lg" className="w-full text-lg py-6">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Tell us about yourself</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll text you the app install link
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!name.trim() || isSaving}
                  className="flex-1"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
                  {!isSaving && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Home Base */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Where do your routes start?</h2>
              </div>

              <div>
                <Label>Home Address *</Label>
                <AddressAutocomplete
                  value={homeAddress}
                  onChange={(result) => {
                    setHomeAddress(result.address);
                    setHomeLat(result.lat);
                    setHomeLng(result.lng);
                    setErrors((e) => ({ ...e, address: '' }));
                  }}
                  placeholder="Enter your home address"
                  error={errors.address}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  This is where your routes will start and end each day
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!homeAddress || !homeLat || isSaving}
                  className="flex-1"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
                  {!isSaving && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Companies */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Which companies do you work with?</h2>
              </div>

              <CompanySelector
                selectedCompanies={selectedCompanies}
                onAdd={(company) => setSelectedCompanies((prev) => [...prev, company])}
                onRemove={(id) => setSelectedCompanies((prev) => prev.filter((c) => c.company_id !== id))}
                onUpdateMinutes={(id, mins) =>
                  setSelectedCompanies((prev) =>
                    prev.map((c) => (c.company_id === id ? { ...c, avg_inspection_minutes: mins } : c))
                  )
                }
                error={errors.companies}
              />

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={selectedCompanies.length === 0 || isSaving}
                  className="flex-1"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue'}
                  {!isSaving && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Preferences */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">A few more details</h2>
                </div>
                <Button variant="link" onClick={handleSkipPreferences} disabled={isSaving}>
                  Skip, use defaults
                </Button>
              </div>

              <p className="text-muted-foreground text-sm">(optional)</p>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mpg">Vehicle MPG</Label>
                    <Input
                      id="mpg"
                      type="number"
                      min={10}
                      max={60}
                      value={vehicleMpg}
                      onChange={(e) => setVehicleMpg(parseInt(e.target.value) || 25)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fuel">Fuel Cost ($/gal)</Label>
                    <Input
                      id="fuel"
                      type="number"
                      step="0.01"
                      min={1}
                      max={10}
                      value={fuelCost}
                      onChange={(e) => setFuelCost(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Typical Working Hours</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start" className="text-xs text-muted-foreground">Start</Label>
                      <select
                        id="start"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        {timeOptions.filter(t => t.value >= '06:00' && t.value <= '12:00').map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="end" className="text-xs text-muted-foreground">End</Label>
                      <select
                        id="end"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        {timeOptions.filter(t => t.value >= '12:00' && t.value <= '20:00').map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={isSaving} className="flex-1">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Complete Setup'}
                  {!isSaving && <CheckCircle2 className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Complete */}
          {step === 6 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">You're all set!</h1>
                <p className="text-muted-foreground mt-3 text-lg">
                  Welcome to Inspector Route AI! Upload your first inspection CSV to see it in action.
                </p>
              </div>
              <div className="space-y-3">
                <Button onClick={handleUploadFirst} size="lg" className="w-full text-lg py-6">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Upload First CSV
                </Button>
                <Button variant="link" onClick={handleGoToDashboard} className="text-muted-foreground">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CSVUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
