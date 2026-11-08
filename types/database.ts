export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: { full_name?: string };
        Relationships: [];
      };
      user_roles: {
        Row: { user_id: string; role: UserRole; created_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      onboarding_responses: {
        Row: {
          user_id: string;
          college_name: string | null;
          degree: string | null;
          branch: string | null;
          current_year: number | null;
          graduation_year: number | null;
          programming_experience: ProgrammingExperience | null;
          placement_goal: PlacementGoal | null;
          daily_study_target: StudyTarget | null;
          programming_interests: string[];
          current_step: number;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: {
          college_name?: string | null;
          degree?: string | null;
          branch?: string | null;
          current_year?: number | null;
          graduation_year?: number | null;
          programming_experience?: ProgrammingExperience | null;
          placement_goal?: PlacementGoal | null;
          daily_study_target?: StudyTarget | null;
          programming_interests?: string[];
        };
        Relationships: [];
      };
      learning_areas: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string;
          sort_order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          learning_area_id: string;
          topic_id: string;
          slug: string;
          title: string;
          summary: string;
          lesson_format: LessonFormat;
          difficulty: "beginner" | "intermediate" | "advanced";
          access_tier: "free" | "premium";
          estimated_minutes: number;
          learning_objectives: string[];
          content: Json;
          version: number;
          author_id: string | null;
          reviewer_id: string | null;
          publication_status: PublicationStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      roadmap_nodes: {
        Row: {
          id: string;
          learning_area_id: string;
          unit_id: string;
          topic_id: string | null;
          lesson_id: string | null;
          node_type: RoadmapNodeType;
          title: string;
          summary: string;
          sequence_order: number;
          estimated_minutes: number | null;
          access_tier: "free" | "premium";
          publication_status: PublicationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      practice_sessions: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: "active" | "completed" | "abandoned";
          question_count: number;
          correct_answers: number;
          started_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      advance_student_onboarding_step: {
        Args: { expected_step: number };
        Returns: number;
      };
      complete_student_onboarding: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      current_user_has_role: {
        Args: { required_role: string };
        Returns: boolean;
      };
      get_learning_roadmap: {
        Args: { area_slug: string };
        Returns: {
          node_id: string;
          lesson_id: string | null;
          lesson_slug: string | null;
          node_type: string;
          title: string;
          summary: string;
          subject_title: string;
          unit_title: string;
          topic_title: string | null;
          sequence_order: number;
          estimated_minutes: number | null;
          access_tier: "free" | "premium";
          prerequisites: string[];
          node_state: "needs_revision" | "completed" | "locked" | "current" | "available";
          locked_reason: "premium" | "prerequisite" | null;
          mastery_score: number | null;
        }[];
      };
      open_roadmap_node: {
        Args: { target_node_id: string };
        Returns: string;
      };
      start_practice_session: {
        Args: { target_lesson_id: string };
        Returns: string;
      };
      get_practice_session_questions: {
        Args: { target_session_id: string };
        Returns: {
          question_id: string;
          question_type: "single_choice" | "multiple_choice" | "output_prediction" | "find_error" | "numerical";
          prompt: string;
          code_snippet: string | null;
          input_config: Json;
          sort_order: number;
          options: Json;
          submitted_answer: Json | null;
          is_correct: boolean | null;
          submitted_at: string | null;
        }[];
      };
      submit_practice_answer: {
        Args: { target_session_id: string; target_question_id: string; submitted: Json };
        Returns: {
          is_correct: boolean;
          correct_answer: Json;
          explanation: string;
          session_completed: boolean;
          correct_answers: number;
          answered_count: number;
        }[];
      };
      complete_lesson_from_practice: {
        Args: { target_session_id: string };
        Returns: string;
      };
      get_my_gamification: {
        Args: Record<PropertyKey, never>;
        Returns: {
          total_xp: number;
          level_name: string;
          next_level_xp: number | null;
          current_streak: number;
          longest_streak: number;
          xp_today: number;
        }[];
      };
      rewind_student_onboarding_step: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      update_student_profile: {
        Args: {
          p_full_name: string;
          p_college_name: string;
          p_degree: string;
          p_branch: string;
          p_current_year: number;
          p_graduation_year: number;
          p_programming_experience: ProgrammingExperience;
          p_placement_goal: PlacementGoal;
          p_daily_study_target: StudyTarget;
          p_programming_interests: string[];
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type UserRole = "student" | "super_admin" | "content_admin" | "support_admin";
export type ProgrammingExperience = "beginner" | "intermediate" | "advanced";
export type PlacementGoal = "service" | "product" | "both" | "undecided";
export type StudyTarget = 15 | 30 | 45 | 60 | 90;
export type LessonFormat = "concept_lesson" | "code_walkthrough" | "worked_calculation" | "schema_explainer" | "problem_solving";
export type RoadmapNodeType = "lesson" | "practice" | "checkpoint" | "unit_test" | "revision" | "milestone";
export type PublicationStatus = "draft" | "editorial_review" | "technical_review" | "approved" | "published" | "archived";
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
