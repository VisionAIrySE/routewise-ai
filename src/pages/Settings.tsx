import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfileSettings, useUpdateUserProfileSettings, useCompanyProfiles, useUserCompanySettings, useUpdateUserCompanySettings } from '@/hooks/useSettings';
import { HomeBaseSection } from '@/components/settings/HomeBaseSection';
import { VehicleSection } from '@/components/settings/VehicleSection';
import { WorkPreferencesSection } from '@/components/settings/WorkPreferencesSection';
import { DurationsSection } from '@/components/settings/DurationsSection';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfileSettings();
  const { data: companies, isLoading: companiesLoading } = useCompanyProfiles();
  const { data: userCompanySettings, isLoading: settingsLoading } = useUserCompanySettings();
  const updateProfile = useUpdateUserProfileSettings();
  const updateCompanySettings = useUpdateUserCompanySettings();

  const isLoading = profileLoading || companiesLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <HomeBaseSection 
        profile={profile} 
        onSave={updateProfile.mutateAsync} 
        isSaving={updateProfile.isPending}
      />
      
      <VehicleSection 
        profile={profile} 
        onSave={updateProfile.mutateAsync}
        isSaving={updateProfile.isPending}
      />
      
      <WorkPreferencesSection 
        profile={profile} 
        onSave={updateProfile.mutateAsync}
        isSaving={updateProfile.isPending}
      />
      
      <DurationsSection
        companies={companies || []}
        userSettings={userCompanySettings || []}
        onSave={updateCompanySettings.mutateAsync}
        isSaving={updateCompanySettings.isPending}
      />
    </div>
  );
}
