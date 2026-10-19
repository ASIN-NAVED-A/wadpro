import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building, Save, Loader2, Globe, Mail, Phone, MapPin } from 'lucide-react';
import profileService from '../../api/services/profileService';
import { useToast } from '../../components/common/Toast';
import FormField from '../../components/forms/FormField';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';

const companySchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z.string().min(10, 'Please write a brief company description'),
  website: z.string().url('Must be a valid URL (e.g. https://example.com)').or(z.literal('')),
  contactEmail: z.string().email('Please enter a valid business email'),
  phone: z.string().optional(),
  location: z.string().min(2, 'Company location is required'),
});

export default function EmployerProfilePage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(companySchema),
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      description: '',
      website: '',
      contactEmail: '',
      phone: '',
      location: '',
    },
  });

  useEffect(() => {
    async function loadCompany() {
      setIsLoading(true);
      try {
        const data = await profileService.getCompanyProfile();
        reset({
          companyName: data.companyName || '',
          description: data.description || '',
          website: data.website || '',
          contactEmail: data.contactEmail || '',
          phone: data.phone || '',
          location: data.location || '',
        });
      } catch (err) {
        toast.error('Failed to load company details');
      } finally {
        setIsLoading(false);
      }
    }
    loadCompany();
  }, [reset, toast]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await profileService.updateCompanyProfile(data);
      toast.success('Company profile updated successfully!');
      reset(data);
    } catch (err) {
      toast.error('Failed to update company profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container page-wrapper" style={{ display: 'flex', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader message="Loading company profile settings..." />
      </div>
    );
  }

  return (
    <div className="container page-wrapper" style={{ maxWidth: '780px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Company Profile</h1>
          <p className="page-subtitle">
            Manage your public employer brand and contact details displayed on job postings.
          </p>
        </div>
        <StatusBadge isDemo={true} />
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <FormField id="comp-name" label="Company Name" error={errors.companyName} required>
              <input type="text" className="form-input" {...register('companyName')} />
            </FormField>

            <FormField id="comp-location" label="Headquarters Location" error={errors.location} required>
              <input type="text" className="form-input" placeholder="e.g. Bangalore, Karnataka" {...register('location')} />
            </FormField>
          </div>

          <FormField id="comp-desc" label="Company Description & Mission" error={errors.description} required>
            <textarea rows={4} className="form-textarea" placeholder="Describe your organization, mission, and products..." {...register('description')} />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <FormField id="comp-website" label="Website URL" error={errors.website}>
              <input type="url" className="form-input" placeholder="https://example.com" {...register('website')} />
            </FormField>

            <FormField id="comp-email" label="Contact Email" error={errors.contactEmail} required>
              <input type="email" className="form-input" placeholder="careers@example.com" {...register('contactEmail')} />
            </FormField>

            <FormField id="comp-phone" label="Contact Phone (Optional)" error={errors.phone}>
              <input type="text" className="form-input" placeholder="+91 80 1234 5678" {...register('phone')} />
            </FormField>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty || !isValid}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Company Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
