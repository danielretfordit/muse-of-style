import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type PlanType = "free" | "pro" | "premium";

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  status: "active" | "canceled" | "past_due" | "trialing";
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanLimits {
  id: string;
  plan: PlanType;
  wardrobe_limit: number;
  looks_limit: number;
  ai_stylist_enabled: boolean;
  priority_support: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!user?.id,
  });

  const { data: planLimits, isLoading: isLoadingLimits } = useQuery({
    queryKey: ["planLimits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plan_limits")
        .select("*");

      if (error) throw error;
      return data as PlanLimits[];
    },
  });

  const currentPlan = subscription?.plan || "free";

  const currentLimits = planLimits?.find((l) => l.plan === currentPlan) || {
    wardrobe_limit: 30,
    looks_limit: 5,
    ai_stylist_enabled: false,
    priority_support: false,
  };

  const changePlanMutation = useMutation({
    mutationFn: async (newPlan: PlanType) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Check if subscription exists
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update existing subscription
        const { error } = await supabase
          .from("subscriptions")
          .update({
            plan: newPlan,
            status: "active",
            current_period_start: new Date().toISOString(),
            canceled_at: null,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Create new subscription
        const { error } = await supabase.from("subscriptions").insert({
          user_id: user.id,
          plan: newPlan,
          status: "active",
          current_period_start: new Date().toISOString(),
        });

        if (error) throw error;
      }

      return newPlan;
    },
    onSuccess: (newPlan) => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success(`Тариф изменён на ${getPlanName(newPlan)}`);
    },
    onError: (error) => {
      console.error("Failed to change plan:", error);
      toast.error("Не удалось изменить тариф");
    },
  });

  return {
    subscription,
    currentPlan,
    currentLimits,
    planLimits,
    isLoading: isLoadingSubscription || isLoadingLimits,
    changePlan: changePlanMutation.mutate,
    isChangingPlan: changePlanMutation.isPending,
  };
}

function getPlanName(plan: PlanType): string {
  const names: Record<PlanType, string> = {
    free: "Free",
    pro: "Pro",
    premium: "Premium",
  };
  return names[plan];
}
