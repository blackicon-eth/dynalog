"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Label } from "@/components/shadcn-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { useUser, useUpdateUser } from "@/hooks/use-user";
import type { User } from "@/lib/api/users";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const fitnessGoalOptions = [
  { value: "lose_weight", label: "Lose Weight" },
  { value: "build_muscle", label: "Build Muscle" },
  { value: "maintain", label: "Maintain" },
  { value: "improve_endurance", label: "Improve Endurance" },
  { value: "flexibility", label: "Flexibility" },
];

const activityLevelOptions = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "lightly_active", label: "Lightly Active (1-3 days/week)" },
  { value: "moderately_active", label: "Moderately Active (3-5 days/week)" },
  { value: "very_active", label: "Very Active (6-7 days/week)" },
  { value: "extremely_active", label: "Extremely Active (twice a day)" },
];


function ProfileFormInner({ user }: { user: User }) {
  const updateUser = useUpdateUser();

  const [name, setName] = useState(user.name);
  const [gender, setGender] = useState<string>(user.gender ?? "");
  const [age, setAge] = useState(user.age?.toString() ?? "");
  const [height, setHeight] = useState(user.height?.toString() ?? "");
  const [weight, setWeight] = useState(user.weight?.toString() ?? "");
  const [fitnessGoal, setFitnessGoal] = useState<string>(user.fitnessGoal ?? "");
  const [activityLevel, setActivityLevel] = useState<string>(user.activityLevel ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await updateUser.mutateAsync({
        name: name.trim(),
        gender: (gender as "male" | "female" | "other") || null,
        age: age ? parseInt(age) : null,
        height: height ? parseInt(height) : null,
        weight: weight ? parseFloat(weight) : null,
        fitnessGoal: (fitnessGoal as "lose_weight" | "build_muscle" | "maintain" | "improve_endurance" | "flexibility") || null,
        activityLevel: (activityLevel as "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active") || null,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Name & Gender */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-2"
      >
        <div className="flex flex-col gap-1">
          <Label htmlFor="name" className="text-xs">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={updateUser.isPending}
            className="h-9"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gender" className="text-xs">Gender</Label>
          <Select
            value={gender}
            onValueChange={setGender}
            disabled={updateUser.isPending}
          >
            <SelectTrigger id="gender" className="h-9">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Age, Height, Weight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-2"
      >
        <div className="flex flex-col gap-1">
          <Label htmlFor="age" className="text-xs">Age</Label>
          <Input
            id="age"
            type="number"
            min="1"
            max="150"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            disabled={updateUser.isPending}
            className="h-9"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="height" className="text-xs">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            min="1"
            max="300"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            disabled={updateUser.isPending}
            className="h-9"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="weight" className="text-xs">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            min="1"
            max="500"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            disabled={updateUser.isPending}
            className="h-9"
          />
        </div>
      </motion.div>

      {/* Fitness Goal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-1"
      >
        <Label htmlFor="fitnessGoal" className="text-xs">Fitness Goal</Label>
        <Select
          value={fitnessGoal}
          onValueChange={setFitnessGoal}
          disabled={updateUser.isPending}
        >
          <SelectTrigger id="fitnessGoal" className="h-9">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {fitnessGoalOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Activity Level */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col gap-1"
      >
        <Label htmlFor="activityLevel" className="text-xs">Activity Level</Label>
        <Select
          value={activityLevel}
          onValueChange={setActivityLevel}
          disabled={updateUser.isPending}
        >
          <SelectTrigger id="activityLevel" className="h-9">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {activityLevelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            size="sm"
            className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            disabled={updateUser.isPending}
          >
            {updateUser.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </form>
  );
}

export function ProfileForm() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileFormInner key={user.id} user={user} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
