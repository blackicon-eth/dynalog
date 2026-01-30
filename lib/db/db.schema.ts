import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";

/**
 * Users table
 */
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  gender: text("gender"),
  age: integer("age"),
  height: integer("height"), // in cm
  weight: real("weight"), // in kg
  fitnessGoal: text("fitness_goal"),
  activityLevel: text("activity_level"),
  avatar: text("avatar"), // 0-6 for avatar images
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UpdatedUser = Partial<NewUser>;

/**
 * Routines table
 */
export const routines = sqliteTable(
  "routines",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_routines_user_id").on(t.userId)]
);

export type Routine = typeof routines.$inferSelect;
export type NewRoutine = typeof routines.$inferInsert;
export type UpdatedRoutine = Partial<NewRoutine>;

/**
 * Exercises table
 */
export const exercises = sqliteTable(
  "exercises",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    routineId: text("routine_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    weight: real("weight").notNull().default(0), // in kg
    series: integer("series").notNull().default(3),
    reps: integer("reps").notNull().default(10),
    restTime: integer("rest_time").notNull().default(60), // in seconds
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_exercises_routine_id").on(t.routineId)]
);

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type UpdatedExercise = Partial<NewExercise>;

/**
 * Workout Sessions table
 */
export const workoutSessions = sqliteTable(
  "workout_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    routineId: text("routine_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    startedAt: text("started_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    completedAt: text("completed_at"),
    notes: text("notes"),
  },
  (t) => [index("idx_workout_sessions_user_id").on(t.userId), index("idx_workout_sessions_routine_id").on(t.routineId)]
);

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type NewWorkoutSession = typeof workoutSessions.$inferInsert;
export type UpdatedWorkoutSession = Partial<NewWorkoutSession>;

/**
 * Exercise Logs table
 */
export const exerciseLogs = sqliteTable(
  "exercise_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    sessionId: text("session_id")
      .notNull()
      .references(() => workoutSessions.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    weight: real("weight").notNull(),
    reps: integer("reps").notNull(),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_exercise_logs_session_id").on(t.sessionId), index("idx_exercise_logs_exercise_id").on(t.exerciseId)]
);

export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type NewExerciseLog = typeof exerciseLogs.$inferInsert;
export type UpdatedExerciseLog = Partial<NewExerciseLog>;

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  routines: many(routines),
  workoutSessions: many(workoutSessions),
}));

export const routinesRelations = relations(routines, ({ one, many }) => ({
  user: one(users, {
    fields: [routines.userId],
    references: [users.id],
  }),
  exercises: many(exercises),
  workoutSessions: many(workoutSessions),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  routine: one(routines, {
    fields: [exercises.routineId],
    references: [routines.id],
  }),
  exerciseLogs: many(exerciseLogs),
}));

export const workoutSessionsRelations = relations(workoutSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [workoutSessions.userId],
    references: [users.id],
  }),
  routine: one(routines, {
    fields: [workoutSessions.routineId],
    references: [routines.id],
  }),
  exerciseLogs: many(exerciseLogs),
}));

export const exerciseLogsRelations = relations(exerciseLogs, ({ one }) => ({
  session: one(workoutSessions, {
    fields: [exerciseLogs.sessionId],
    references: [workoutSessions.id],
  }),
  exercise: one(exercises, {
    fields: [exerciseLogs.exerciseId],
    references: [exercises.id],
  }),
}));
