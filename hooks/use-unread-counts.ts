import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export interface UnreadCounts {
  home: number;
  journal: number;
  insights: number;
  quests: number;
}

/**
 * Hook to fetch unread counts from the backend.
 * Returns current counts and a function to refetch.
 */
export function useUnreadCounts() {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    home: 0,
    journal: 0,
    insights: 0,
    quests: 0,
  });

  // Fetch unread journal entries
  const { data: journalData, refetch: refetchJournal } = useQuery({
    queryKey: ["unread-journals"],
    queryFn: async () => {
      try {
        // Replace with your actual backend endpoint
        const response = await fetch("/api/journals/unread-count");
        if (!response.ok) throw new Error("Failed to fetch unread journals");
        const data = await response.json();
        return data.count || 0;
      } catch (error) {
        console.error("Error fetching unread journals:", error);
        return 0;
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 1,
  });

  // Fetch unread quests
  const { data: questsData, refetch: refetchQuests } = useQuery({
    queryKey: ["unread-quests"],
    queryFn: async () => {
      try {
        // Replace with your actual backend endpoint
        const response = await fetch("/api/quests/unread-count");
        if (!response.ok) throw new Error("Failed to fetch unread quests");
        const data = await response.json();
        return data.count || 0;
      } catch (error) {
        console.error("Error fetching unread quests:", error);
        return 0;
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 1,
  });

  // Fetch unread insights
  const { data: insightsData, refetch: refetchInsights } = useQuery({
    queryKey: ["unread-insights"],
    queryFn: async () => {
      try {
        // Replace with your actual backend endpoint
        const response = await fetch("/api/insights/unread-count");
        if (!response.ok) throw new Error("Failed to fetch unread insights");
        const data = await response.json();
        return data.count || 0;
      } catch (error) {
        console.error("Error fetching unread insights:", error);
        return 0;
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 1,
  });

  // Update state when data changes
  useEffect(() => {
    setUnreadCounts((prev) => ({
      ...prev,
      journal: journalData || 0,
      quests: questsData || 0,
      insights: insightsData || 0,
    }));
  }, [journalData, questsData, insightsData]);

  return {
    unreadCounts,
    refetch: () => {
      refetchJournal();
      refetchQuests();
      refetchInsights();
    },
  };
}
