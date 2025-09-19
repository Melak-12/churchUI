'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  ArrowLeft,
  Loader2,
  GripVertical,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

interface VoteFormData {
  title: string;
  description?: string;
  type: 'SINGLE_CHOICE' | 'YES_NO';
  options: string[];
  startAt: string;
  endAt: string;
  anonymous: boolean;
}

export default function EditVotePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eligibleMembersCount, setEligibleMembersCount] = useState(0);
  const [voteId, setVoteId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
    trigger,
    getValues
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

  // Track form changes for floating save button
  const watchedFields = watch();
  
  // Function to compare current form data with original data
  const hasFormChanged = () => {
    if (!originalData) return false;
    
    const currentData = getValues();
    
    // Compare key fields
    return (
      currentData.title !== originalData.title ||
      currentData.description !== originalData.description ||
      currentData.type !== originalData.type ||
      JSON.stringify(currentData.options) !== JSON.stringify(originalData.options) ||
      currentData.startAt !== originalData.startAt ||
      currentData.endAt !== originalData.endAt ||
      currentData.anonymous !== originalData.anonymous
    );
  };

  useEffect(() => {
    setHasUnsavedChanges(hasFormChanged());
  }, [watchedFields, originalData]);
  const anonymous = watch('anonymous');

  // Load vote data and eligible members count
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        console.log('Edit page - params.id:', params.id);
        console.log('Edit page - params:', params);
        
        const currentVoteId = params.id as string;
        if (!currentVoteId) {
          setError('Vote ID is missing from the URL.');
          return;
        }
        
        setVoteId(currentVoteId);
        
        // Load vote data
        const voteData = await apiClient.getVote(currentVoteId);
        console.log('Edit page - loaded vote data:', voteData);
        
        // Check if vote can be edited
        if (voteData.status !== 'SCHEDULED') {
          setError('This vote cannot be edited because it has already started or closed.');
          return;
        }

        // Populate form with vote data
        const startDate = new Date(voteData.startAt);
        const endDate = new Date(voteData.endAt);
        
        reset({
          title: voteData.title,
          description: voteData.description || '',
          type: voteData.type,
          options: voteData.options,
          startAt: startDate.toISOString().slice(0, 16), // Format for datetime-local input
          endAt: endDate.toISOString().slice(0, 16),
          anonymous: voteData.anonymous
        });

        // Store original data for change comparison
        setOriginalData({
          title: voteData.title,
          description: voteData.description || '',
          type: voteData.type,
          options: voteData.options,
          startAt: startDate.toISOString().slice(0, 16),
          endAt: endDate.toISOString().slice(0, 16),
          anonymous: voteData.anonymous
        });

        // Load eligible members count
        const membersResponse = await apiClient.getMembers({ eligibility: 'ELIGIBLE', limit: 1 });
        if (membersResponse && membersResponse.pagination && typeof membersResponse.pagination.total === 'number') {
          setEligibleMembersCount(membersResponse.pagination.total);
        } else if (membersResponse && Array.isArray(membersResponse.members)) {
          setEligibleMembersCount(membersResponse.members.length);
        } else {
          setEligibleMembersCount(0);
        }
        
      } catch (err: any) {
        console.error('Failed to load vote data:', err);
        setError(err.message || 'Failed to load vote data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadData();
    }
  }, [params.id, reset]);

  const addOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`];
    setValue('options', newOptions);
  };

  const duplicateOption = (index: number) => {
    const newOptions = [...options];
    const duplicatedOption = `${options[index]} (Copy)`;
    newOptions.splice(index + 1, 0, duplicatedOption);
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
    
    // Real-time validation feedback
    const validation = validateOptions(newOptions);
    if (validation !== true) {
      console.log('Option validation:', validation);
    }
  };

  // Custom validation for options
  const validateOptions = (options: string[]) => {
    if (!options || options.length < 2) {
      return 'At least 2 options are required';
    }
    if (options.length > 10) {
      return 'Maximum 10 options allowed';
    }
    if (options.some(option => !option.trim())) {
      return 'All options must be filled in';
    }
    
    // Check for duplicate options (case-insensitive)
    const trimmedOptions = options.map(opt => opt.trim().toLowerCase());
    const uniqueOptions = new Set(trimmedOptions);
    if (uniqueOptions.size !== trimmedOptions.length) {
      return 'All options must be unique';
    }
    
    // Check for options that are too long
    if (options.some(option => option.trim().length > 100)) {
      return 'Options cannot exceed 100 characters';
    }
    
    return true;
  };

  const handleFloatingSave = async () => {
    const result = await trigger();
    if (result) {
      const formData = getValues();
      await onSubmit(formData);
    }
  };

  const onSubmit = async (data: VoteFormData) => {
    setIsSubmitting(true);
    try {
      // Convert datetime-local to ISO string
      const startDate = new Date(data.startAt);
      const endDate = new Date(data.endAt);
      const startAt = startDate.toISOString();
      const endAt = endDate.toISOString();

      // Validate dates
      if (startDate >= endDate) {
        toast({
          title: "Invalid dates",
          description: "End date must be after start date",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (startDate <= new Date()) {
        toast({
          title: "Invalid start date",
          description: "Start date must be in the future",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

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

      // Use the stored voteId
      if (!voteId) {
        toast({
          title: "Error",
          description: "Vote ID is not available",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      await apiClient.updateVote(voteId, voteData);
      
      toast({
        title: "Vote updated successfully",
        description: `"${voteData.title}" has been updated.`,
      });

      setHasUnsavedChanges(false);
      router.push(`/voting/${voteId}`);
    } catch (error: any) {
      console.error('Failed to update vote:', error);
      
      let errorMessage = "An error occurred while updating the vote";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Failed to update vote",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={voteId ? `/voting/${voteId}` : '/voting'}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vote
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={voteId ? `/voting/${voteId}` : '/voting'}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vote
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="text-center py-12">
              <Info className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-gray-500">{error}</p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4 max-w-4xl">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
            <Link href={voteId ? `/voting/${voteId}` : '/voting'}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Edit Vote</h1>
          <p className="text-gray-600">Update vote details and configuration</p>
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
                        <div className="flex items-center space-x-2">
                          <Label>Options *</Label>
                          <Badge variant="outline" className="text-xs">
                            {options.length} option{options.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                          disabled={options.length >= 10}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      
                      {options.length >= 10 && (
                        <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <p className="text-sm text-yellow-800">
                            Maximum of 10 options allowed
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        {options.map((option, index) => {
                          // Check if this option is a duplicate
                          const isDuplicate = options.filter(opt => 
                            opt.trim().toLowerCase() === option.trim().toLowerCase()
                          ).length > 1;
                          
                          return (
                            <div key={index} className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${
                              isDuplicate 
                                ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}>
                              <div className="flex items-center text-gray-400 cursor-grab">
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(index, e.target.value)}
                                  placeholder={`Option ${index + 1}`}
                                  className={`bg-white ${isDuplicate ? 'border-red-300 focus:border-red-500' : ''}`}
                                />
                                {isDuplicate && (
                                  <p className="text-xs text-red-600 mt-1 flex items-center space-x-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Duplicate option</span>
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="text-xs">
                                  {index + 1}
                                </Badge>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => duplicateOption(index)}
                                  disabled={options.length >= 10}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Duplicate this option"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                {options.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeOption(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Remove this option"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {errors.options && (
                          <p className="text-sm text-red-600 flex items-center space-x-1">
                            <AlertTriangle className="h-4 w-4" />
                            <span>{errors.options.message}</span>
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-3 flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = [...options, 'New Option 1', 'New Option 2'];
                              setValue('options', newOptions);
                            }}
                            disabled={options.length >= 9}
                            className="text-xs"
                          >
                            Add Multiple
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = options.map((opt, index) => `Option ${index + 1}`);
                              setValue('options', newOptions);
                            }}
                            className="text-xs"
                          >
                            Reset Names
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500">
                          <p>• Drag the grip icon to reorder options (coming soon)</p>
                          <p>• Each option must be unique and not empty</p>
                          <p>• Minimum 2 options, maximum 10 options</p>
                          <p>• Use the + button to duplicate an option</p>
                        </div>
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
                        {eligibleMembersCount} members
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vote Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Vote Preview</CardTitle>
                  <CardDescription>
                    How this vote will appear to voters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-lg mb-2">
                      {watch('title') || 'Vote Title'}
                    </h3>
                    {watch('description') && (
                      <p className="text-sm text-gray-600 mb-4">
                        {watch('description')}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      {watch('type') === 'YES_NO' ? (
                        <>
                          <div className="flex items-center space-x-2 p-2 border rounded bg-white">
                            <div className="w-4 h-4 border border-gray-300 rounded"></div>
                            <span>Yes</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 border rounded bg-white">
                            <div className="w-4 h-4 border border-gray-300 rounded"></div>
                            <span>No</span>
                          </div>
                        </>
                      ) : (
                        watch('options')?.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 border rounded bg-white">
                            <div className="w-4 h-4 border border-gray-300 rounded"></div>
                            <span>{option || `Option ${index + 1}`}</span>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-500">
                      <p>Vote Type: {watch('type') === 'SINGLE_CHOICE' ? 'Single Choice' : 'Yes/No'}</p>
                      <p>Anonymous: {watch('anonymous') ? 'Yes' : 'No'}</p>
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
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Vote
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href={voteId ? `/voting/${voteId}` : '/voting'}>
                      Cancel
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* Mobile Floating Save Button */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-lg md:hidden z-50 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex space-x-3 max-w-sm mx-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
                size="sm"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleFloatingSave}
                disabled={isSubmitting || !hasUnsavedChanges}
                className="flex-1"
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
