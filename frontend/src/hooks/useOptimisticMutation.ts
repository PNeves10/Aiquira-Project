import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate: (variables: TVariables) => Promise<TData | undefined>;
  onError: (error: Error, variables: TVariables, context: TData | undefined) => Promise<void>;
  onSuccess?: (data: TData, variables: TVariables) => Promise<void>;
  onSettled?: () => Promise<void>;
}

export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  onMutate,
  onError,
  onSuccess,
  onSettled,
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const [isRollback, setIsRollback] = useState(false);

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries();

      // Snapshot the previous value
      const previousData = await onMutate(variables);

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: async (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData && !isRollback) {
        setIsRollback(true);
        await onError(error, variables, context.previousData);
        setIsRollback(false);
      }
      toast.error('An error occurred. Please try again.');
    },
    onSuccess: async (data, variables) => {
      if (onSuccess) {
        await onSuccess(data, variables);
      }
      toast.success('Operation completed successfully');
    },
    onSettled: async () => {
      // Always refetch after error or success to ensure data consistency
      if (onSettled) {
        await onSettled();
      }
    },
  });
} 