'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Vote } from '@/types';
import { 
  Save, 
  Plus, 
  Minus, 
  Users, 
  Info, 
  Eye, 
  Copy,
  Calendar,
  Loader2
} from 'lucide-react';

interface VoteFormData {
  title: string;
  description?: string;
  type: 'SINGLE_CHOICE' | 'YES_NO';
  options: string[];
  startAt: string;
  endAt: string;
  anonymous: boolean;
}

export default function NewVotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibleMembersCount, setEligibleMembersCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
    trigger
  } = useForm<VoteFormData>({
    defaultValues: {
      title: '',
      description: '',
      type: 'SINGLE_CHOICE',
      options: ['Option 1', 'Option 2'],
      startAt: '',
      endAt: '',
      anonymous: false
    },
    mode: 'onChange'
  });

  const voteType = watch('type');
  const options = watch('options');
  const anonymous = watch('anonymous');

  // Set client-side flag and load eligible members count
  useEffect(() => {
    setIsClient(true);
    
    const checkApiHealth = async () => {
      try {
        console.log('Checking API health...');
        const healthResponse = await fetch('http://localhost:3001/health');
        const healthData = await healthResponse.json();
        console.log('API health check:', healthData);
      } catch (error) {
        console.error('API health check failed:', error);
      }
    };
    
    const loadEligibleMembers = async () => {
      try {
        // Add a small delay to ensure the component is fully mounted
        await new Promise(resolve => setTimeout(resolve, 100));
        const response = await apiClient.getMembers({ eligibility: 'ELIGIBLE', limit: 1 });
        
        // Check if response has the expected structure
        if (response && response.pagination && typeof response.pagination.total === 'number') {
          setEligibleMembersCount(response.pagination.total);
        } else if (response && Array.isArray(response.members)) {
          // Fallback: count the members array if pagination is not available
          setEligibleMembersCount(response.members.length);
        } else {
          console.warn('Unexpected API response structure:', response);
          setEligibleMembersCount(0);
        }
      } catch (error) {
        console.error('Failed to load eligible members count:', error);
        // Set a default count if API is not available
        setEligibleMembersCount(0);
      }
    };
    
    checkApiHealth();
    loadEligibleMembers();
  }, []);

  const addOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`];
    setValue('options', newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setValue('options', newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setValue('options', newOptions, { shouldValidate: true });
  };

  // Custom validation for options
  const validateOptions = (options: string[]) => {
    if (!options || options.length < 2) {
      return 'At least 2 options are required';
    }
    if (options.some(option => !option.trim())) {
      return 'All options must be filled in';
    }
    return true;
  };

  const onSubmit = async (data: VoteFormData) => {
    console.log('=== FORM SUBMIT HANDLER CALLED ===');
    console.log('Form submitted with data:', data);
    setIsSubmitting(true);
    try {
      // Convert datetime-local to ISO string
      const startDate = new Date(data.startAt);
      const endDate = new Date(data.endAt);
      const startAt = startDate.toISOString();
      const endAt = endDate.toISOString();

      console.log('Original dates:', { startAt: data.startAt, endAt: data.endAt });
      console.log('Converted dates:', { startAt, endAt });
      console.log('Date objects:', { startDate, endDate });

      // Validate dates
      if (startDate >= endDate) {
        console.log('Date validation failed: start >= end');
        toast({
          title: "Invalid dates",
          description: "End date must be after start date",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (startDate <= new Date()) {
        console.log('Date validation failed: start not in future');
        console.log('Current date:', new Date());
        console.log('Start date:', startDate);
        toast({
          title: "Invalid start date",
          description: "Start date must be in the future",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Date validation passed');

      // Validate options
      const optionsValidation = validateOptions(data.options);
      if (optionsValidation !== true) {
        toast({
          title: "Invalid options",
          description: optionsValidation,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const voteData = {
        ...data,
        startAt,
        endAt,
      };

      console.log('Vote data to send:', voteData);
      console.log('About to call API...');

      const createdVote = await apiClient.createVote(voteData);
      
      console.log('API call successful, created vote:', createdVote);
      
      toast({
        title: "Vote created successfully",
        description: `"${createdVote.title}" has been created and is ready to be scheduled.`,
      });

      router.push('/voting');
    } catch (error: any) {
      console.error('Failed to create vote:', error);
      
      let errorMessage = "An error occurred while creating the vote";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Failed to create vote",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    toast({
      title: "Preview coming soon",
      description: "Preview functionality will be implemented soon",
    });
  };

  const handleGenerateSMS = () => {
    // TODO: Implement SMS link generation
    toast({
      title: "SMS generation coming soon",
      description: "SMS link generation will be implemented soon",
    });
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <AppShell>
        <div className="space-y-6 max-w-4xl">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Vote</h1>
            <p className="text-gray-600">Set up a new vote or election for your community</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Vote</h1>
          <p className="text-gray-600">Set up a new vote or election for your community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log('Form validation errors:', errors);
          toast({
            title: "Validation Error",
            description: "Please check the form for errors",
            variant: "destructive",
          });
        })}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="xl:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Vote Details</CardTitle>
                  <CardDescription>
                    Basic information about the vote
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Board Member Election 2024"
                      {...register('title', { required: 'Title is required' })}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide context and instructions for voters..."
                      rows={3}
                      {...register('description')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startAt">Start Date & Time *</Label>
                      <Input
                        id="startAt"
                        type="datetime-local"
                        {...register('startAt', { 
                          required: 'Start date is required',
                          validate: (value) => {
                            const startDate = new Date(value);
                            const now = new Date();
                            if (startDate <= now) {
                              return 'Start date must be in the future';
                            }
                            return true;
                          }
                        })}
                      />
                      {errors.startAt && (
                        <p className="text-sm text-red-600 mt-1">{errors.startAt.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="endAt">End Date & Time *</Label>
                      <Input
                        id="endAt"
                        type="datetime-local"
                        {...register('endAt', { 
                          required: 'End date is required',
                          validate: (value) => {
                            const endDate = new Date(value);
                            const startDate = new Date(watch('startAt'));
                            if (endDate <= startDate) {
                              return 'End date must be after start date';
                            }
                            return true;
                          }
                        })}
                      />
                      {errors.endAt && (
                        <p className="text-sm text-red-600 mt-1">{errors.endAt.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vote Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Vote Configuration</CardTitle>
                  <CardDescription>
                    Configure how the vote will work
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="type">Vote Type *</Label>
                    <Select 
                      value={voteType} 
                      onValueChange={(value: 'SINGLE_CHOICE' | 'YES_NO') => {
                        setValue('type', value);
                        if (value === 'YES_NO') {
                          setValue('options', ['Yes', 'No']);
                        } else if (options.length === 2 && options[0] === 'Yes' && options[1] === 'No') {
                          setValue('options', ['Option 1', 'Option 2']);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE_CHOICE">Single Choice (Election)</SelectItem>
                        <SelectItem value="YES_NO">Yes/No (Approval)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {voteType === 'SINGLE_CHOICE' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label>Options *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                            />
                            {options.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(index)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {errors.options && (
                          <p className="text-sm text-red-600">{errors.options.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="anonymous"
                      checked={anonymous}
                      onCheckedChange={(checked) => setValue('anonymous', checked)}
                    />
                    <Label htmlFor="anonymous">Anonymous voting</Label>
                  </div>
                </CardContent>
              </Card>
          </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Eligibility Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Eligibility</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-600">
                        Only members who are not delinquent for more than 90 days can vote.
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Eligible Members</span>
                      <Badge variant="outline">
                        {isClient ? `${eligibleMembersCount} members` : 'Loading...'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handlePreview}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Ballot
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleGenerateSMS}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Generate SMS Link
                  </Button>

                  <div className="pt-2 space-y-2">
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        console.log('Current form values:', watch());
                        console.log('Form errors:', errors);
                        console.log('Is form valid:', Object.keys(errors).length === 0);
                      }}
                    >
                      Debug Form
                    </Button>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                      onClick={() => {
                        console.log('=== SUBMIT BUTTON CLICKED ===');
                        console.log('Form errors:', errors);
                        console.log('Form values:', watch());
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Vote
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}