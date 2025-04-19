import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";

// Emoji reactions available in the system
export const emojiReactions = [
  { emoji: "👍", label: "Agree", color: "bg-green-100 border-green-300" },
  { emoji: "👎", label: "Disagree", color: "bg-red-100 border-red-300" },
  { emoji: "😢", label: "Sad", color: "bg-blue-100 border-blue-300" },
  { emoji: "😡", label: "Angry", color: "bg-orange-100 border-orange-300" },
  { emoji: "🤔", label: "Thinking", color: "bg-purple-100 border-purple-300" },
  { emoji: "🙏", label: "Praying", color: "bg-yellow-100 border-yellow-300" },
  { emoji: "❤️", label: "Care", color: "bg-pink-100 border-pink-300" },
  { emoji: "🚨", label: "Alert", color: "bg-red-100 border-red-300" },
];

interface Reaction {
  emoji: string;
  count: number;
  users: number[]; // User IDs who reacted
}

interface EmojiReactionSystemProps {
  incidentId: number;
  className?: string;
  userId?: number; // Current user ID
  initialReactions?: Reaction[];
  onReactionUpdate?: (reactions: Reaction[]) => void;
  size?: 'sm' | 'md' | 'lg';
  displayCount?: boolean;
  displayLabel?: boolean;
  limit?: number; // Limit number of emoji reactions shown
  disabled?: boolean;
}

const EmojiReactionSystem: React.FC<EmojiReactionSystemProps> = ({
  incidentId,
  className,
  userId = 1, // Default to admin user if not provided
  initialReactions,
  onReactionUpdate,
  size = 'md',
  displayCount = true,
  displayLabel = true,
  limit,
  disabled = false,
}) => {
  // State for reactions
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions || []);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  // Size classes based on prop
  const sizeClasses = {
    sm: "text-sm p-1",
    md: "text-base p-1.5",
    lg: "text-lg p-2",
  };

  // Fetch initial reactions if not provided
  useEffect(() => {
    if (!initialReactions) {
      fetchReactions();
    }
  }, [incidentId, initialReactions]);

  // Fetch reactions from API
  const fetchReactions = async () => {
    try {
      const response = await apiRequest('GET', `/api/incidents/${incidentId}/reactions`);
      
      if (response.ok) {
        const data = await response.json();
        setReactions(data);
        if (onReactionUpdate) {
          onReactionUpdate(data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch reactions:", error);
      // Use sample data for demo if API fails
      const sampleData: Reaction[] = [
        { emoji: "👍", count: 12, users: [2, 3, 5] },
        { emoji: "😢", count: 8, users: [1, 4] },
        { emoji: "🙏", count: 5, users: [] },
      ];
      setReactions(sampleData);
    }
  };

  // Handle emoji click
  const handleReaction = async (emoji: string) => {
    if (disabled || isSubmitting || !userId) return;
    
    setIsSubmitting(true);
    
    try {
      // Find if this reaction already exists
      const existingReaction = reactions.find(r => r.emoji === emoji);
      let hasUserReacted = false;
      
      // Check if user already reacted with this emoji
      if (existingReaction) {
        hasUserReacted = existingReaction.users.includes(userId);
      }

      // Prepare optimistic update
      let updatedReactions: Reaction[];
      
      if (existingReaction) {
        if (hasUserReacted) {
          // Remove user's reaction
          updatedReactions = reactions.map(r => 
            r.emoji === emoji 
              ? { 
                  ...r, 
                  count: Math.max(0, r.count - 1),
                  users: r.users.filter(id => id !== userId)
                } 
              : r
          );
        } else {
          // Add user's reaction
          updatedReactions = reactions.map(r => 
            r.emoji === emoji 
              ? { 
                  ...r, 
                  count: r.count + 1,
                  users: [...r.users, userId]
                } 
              : r
          );
        }
      } else {
        // Create new reaction
        updatedReactions = [
          ...reactions,
          { emoji, count: 1, users: [userId] }
        ];
      }

      // Apply optimistic update
      setReactions(updatedReactions);
      
      // Send to API
      const response = await apiRequest(
        'POST', 
        `/api/incidents/${incidentId}/reactions`,
        { emoji, userId }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update reaction');
      }
      
      // Update parent if callback provided
      if (onReactionUpdate) {
        onReactionUpdate(updatedReactions);
      }
      
    } catch (error) {
      console.error("Failed to update reaction:", error);
      toast({
        title: "Could not update reaction",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      // Revert optimistic update on error
      fetchReactions();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get emojis to display (apply limit if provided)
  const displayableEmojis = limit ? emojiReactions.slice(0, limit) : emojiReactions;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {displayableEmojis.map((emojiData) => {
        // Find if this reaction already exists
        const existingReaction = reactions.find(r => r.emoji === emojiData.emoji);
        const reactionCount = existingReaction?.count || 0;
        const hasUserReacted = existingReaction?.users.includes(userId) || false;
        
        return (
          <TooltipProvider key={emojiData.emoji}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    sizeClasses[size],
                    hasUserReacted ? emojiData.color : "bg-background",
                    "transition-all border font-normal",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleReaction(emojiData.emoji)}
                  disabled={disabled || isSubmitting}
                >
                  <span className="mr-1">{emojiData.emoji}</span>
                  {displayLabel && <span className="hidden sm:inline mr-1">{emojiData.label}</span>}
                  {displayCount && reactionCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "ml-1 text-xs",
                        hasUserReacted ? "bg-white/20" : "bg-secondary"
                      )}
                    >
                      {reactionCount}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{emojiData.label}</p>
                {reactionCount > 0 && <p className="text-xs">{reactionCount} reactions</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

export default EmojiReactionSystem;