import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { IncidentReaction } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2 } from 'lucide-react';

// Common emoji reactions
const EMOJIS = [
  { emoji: '👍', label: 'Agree' },
  { emoji: '👎', label: 'Disagree' },
  { emoji: '❤️', label: 'Support' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '🙏', label: 'Praying' },
  { emoji: '🔍', label: 'Investigating' },
  { emoji: '⚠️', label: 'Warning' }
];

interface EmojiCount {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface EmojiReactionSystemProps {
  incidentId: number;
  userId?: number;
  displayLabel?: boolean;
  displayCount?: boolean;
  className?: string;
}

const EmojiReactionSystem: React.FC<EmojiReactionSystemProps> = ({
  incidentId,
  userId,
  displayLabel = false,
  displayCount = true,
  className = '',
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reactionsCount, setReactionsCount] = useState<EmojiCount[]>([]);
  
  // Fetch existing reactions for this incident
  const { data: reactions, isLoading, error } = useQuery<IncidentReaction[]>({
    queryKey: [`/api/incidents/${incidentId}/reactions`],
    enabled: !!incidentId, // Only run query if incidentId is provided
  });
  
  // Process reactions into counts
  useEffect(() => {
    if (reactions) {
      // Group reactions by emoji
      const emojiGroups: Record<string, { count: number; userIds: number[] }> = {};
      
      reactions.forEach((reaction) => {
        if (!emojiGroups[reaction.emoji]) {
          emojiGroups[reaction.emoji] = { count: 0, userIds: [] };
        }
        emojiGroups[reaction.emoji].count += 1;
        emojiGroups[reaction.emoji].userIds.push(reaction.userId);
      });
      
      // Create array of emoji counts with user reaction status
      const counts = Object.entries(emojiGroups).map(([emoji, { count, userIds }]) => ({
        emoji,
        count,
        userReacted: userId ? userIds.includes(userId) : false
      }));
      
      // Include all default emojis even if no reactions yet
      const allCounts = [...EMOJIS.map(({ emoji }) => {
        const existingCount = counts.find(c => c.emoji === emoji);
        return existingCount || {
          emoji,
          count: 0,
          userReacted: false
        };
      }), ...counts.filter(c => !EMOJIS.some(e => e.emoji === c.emoji))];
      
      setReactionsCount(allCounts);
    }
  }, [reactions, userId]);
  
  // Toggle reaction mutation
  const toggleReactionMutation = useMutation({
    mutationFn: async ({ emoji }: { emoji: string }) => {
      if (!userId) {
        throw new Error('Login required to react');
      }
      
      // Find if user already reacted with this emoji
      const existingReaction = reactions?.find(
        r => r.emoji === emoji && r.userId === userId
      );
      
      if (existingReaction) {
        // If already reacted, delete the reaction (toggle off)
        await apiRequest('DELETE', `/api/incident-reactions/${existingReaction.id}`);
        return { action: 'removed', emoji };
      } else {
        // Otherwise, add new reaction
        const response = await apiRequest('POST', '/api/incident-reactions', {
          incidentId,
          userId,
          emoji,
        });
        return { action: 'added', emoji, data: await response.json() };
      }
    },
    onSuccess: () => {
      // Invalidate the reactions query to refetch data
      queryClient.invalidateQueries({ queryKey: [`/api/incidents/${incidentId}/reactions`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error reacting to incident',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleEmojiClick = (emoji: string) => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to react to incidents',
        variant: 'default',
      });
      return;
    }
    
    toggleReactionMutation.mutate({ emoji });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="ml-2 text-xs">Loading reactions...</span>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className={`text-xs text-red-500 py-2 ${className}`}>
        Failed to load reactions: {(error as Error).message}
      </div>
    );
  }
  
  // Find emoji label
  const getEmojiLabel = (emoji: string) => {
    const emojiConfig = EMOJIS.find(e => e.emoji === emoji);
    return emojiConfig?.label || 'React';
  };
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {reactionsCount.map(({ emoji, count, userReacted }) => (
        <TooltipProvider key={emoji}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={userReacted ? 'default' : 'outline'}
                size="sm"
                className={`px-2 py-0 h-8 ${userReacted ? 'bg-primary/10 hover:bg-primary/20' : ''}`}
                onClick={() => handleEmojiClick(emoji)}
                disabled={toggleReactionMutation.isPending}
              >
                <span className="mr-1 text-lg">{emoji}</span>
                {displayLabel && <span className="text-xs mr-1">{getEmojiLabel(emoji)}</span>}
                {displayCount && count > 0 && <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">{count}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {userReacted ? 'Remove your reaction' : `React with ${getEmojiLabel(emoji)}`}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default EmojiReactionSystem;