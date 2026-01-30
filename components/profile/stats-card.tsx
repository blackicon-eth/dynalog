"use client";

import { motion } from "framer-motion";
import { Activity, Scale, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { useUser } from "@/hooks/use-user";

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  delay: number;
}

function StatItem({ icon, label, value, subtitle, delay }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-2"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/20">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-foreground truncate">{value}</p>
        <p className="text-sm text-muted-foreground truncate">
          {label}{subtitle && ` · ${subtitle}`}
        </p>
      </div>
    </motion.div>
  );
}

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function StatsCard() {
  const { user } = useUser();

  const canCalculate = user?.weight && user?.height && user?.age && user?.gender;

  // Calculate BMI: weight (kg) / height (m)²
  const bmi = canCalculate
    ? user.weight! / Math.pow(user.height! / 100, 2)
    : null;

  // Calculate BMR using Mifflin-St Jeor Equation
  const bmr = canCalculate
    ? user.gender === "male"
      ? 10 * user.weight! + 6.25 * user.height! - 5 * user.age! + 5
      : 10 * user.weight! + 6.25 * user.height! - 5 * user.age! - 161
    : null;

  // Calculate TDEE (Total Daily Energy Expenditure)
  const activityMultiplier = user?.activityLevel
    ? activityMultipliers[user.activityLevel] ?? 1.2
    : 1.2;
  const tdee = bmr ? bmr * activityMultiplier : null;

  // Calories for weight goals (±500 kcal for ~0.5kg/week)
  const kcalToGain = tdee ? Math.round(tdee + 500) : null;
  const kcalToLose = tdee ? Math.round(tdee - 500) : null;

  if (!canCalculate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Health Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Complete your profile (weight, height, age, and gender) to see your health stats.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Health Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <StatItem
              icon={<Scale className="h-4 w-4 text-secondary" />}
              label="BMI"
              value={bmi!.toFixed(1)}
              subtitle={getBmiCategory(bmi!)}
              delay={0.1}
            />
            <StatItem
              icon={<Activity className="h-4 w-4 text-secondary" />}
              label="BMR"
              value={`${Math.round(bmr!)} kcal`}
              subtitle="Calories at rest"
              delay={0.15}
            />
            <StatItem
              icon={<TrendingUp className="h-4 w-4 text-secondary" />}
              label="To Gain Weight"
              value={`${kcalToGain} kcal`}
              subtitle="+0.5 kg/week"
              delay={0.2}
            />
            <StatItem
              icon={<TrendingDown className="h-4 w-4 text-secondary" />}
              label="To Lose Weight"
              value={`${kcalToLose} kcal`}
              subtitle="-0.5 kg/week"
              delay={0.25}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
