import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { TeamMemberId } from "../types";
import { TEAM_MEMBERS } from "../data";

interface TeamMemberStepProps {
  selected: TeamMemberId | null;
  recommendedId: TeamMemberId;
  onSelect: (id: TeamMemberId) => void;
}

export function TeamMemberStep({ selected, recommendedId, onSelect }: TeamMemberStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Choose your specialist</h2>
        <p className="text-sm text-zinc-500 mt-1">We&apos;ve highlighted the best match for your service.</p>
      </div>
      <div className="grid gap-3">
        {TEAM_MEMBERS.map((member, i) => {
          const isSelected = selected === member.id;
          const isRecommended = member.id === recommendedId;
          return (
            <motion.button
              key={member.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              onClick={() => onSelect(member.id)}
              className={cn(
                "w-full text-left rounded-2xl border-2 p-4 flex items-center gap-4 transition-all",
                isSelected ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100" : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
              )}
            >
              <Avatar className="w-11 h-11 shrink-0">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className={cn("bg-linear-to-br text-white text-sm font-bold", member.avatarColor)}>
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-zinc-900">{member.name}</span>
                  {isRecommended && (
                    <Badge className="text-[10px] bg-amber-100 text-amber-700 border-0 px-2 py-0">Recommended</Badge>
                  )}
                </div>
                <p className="text-sm text-zinc-500 mt-0.5">{member.role}</p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                isSelected ? "border-indigo-500 bg-indigo-500" : "border-zinc-300"
              )}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
