# STUDYBENCH
## Product Requirements Document (PRD) & Engineering Implementation Specification

**Product:** StudyBench  
**Category:** Placement Preparation & Learning Platform  
**Document type:** Full Product and Technical Specification  
**Version:** 1.0  
**Status:** Ready for implementation  
**Target:** Web application, desktop and mobile responsive  
**Primary market:** Indian college students preparing for campus placements

---

# 1. Product Vision

## 1.1 What is StudyBench?

StudyBench is a structured placement preparation platform that helps college students prepare for campus recruitment through a single, organized learning experience.

Students should not need to jump between multiple websites for aptitude, computer science fundamentals, programming languages, DSA and company-specific assessments.

StudyBench brings these learning activities together into one guided preparation journey.

The platform should help students:

- Understand concepts from fundamentals.
- Practice questions immediately after learning.
- Identify weak areas.
- Follow a structured preparation roadmap.
- Prepare for company-specific recruitment assessments.
- Monitor their learning progress.
- Build consistent study habits.

## 1.2 Product philosophy

The product must follow five principles:

1. **Learning before gamification:** Gamification supports learning, not the other way around.
2. **Structure before quantity:** Students should understand what to learn next.
3. **Explanations before scores:** Every practice question should provide meaningful feedback.
4. **Simple interfaces:** Avoid overwhelming students with unnecessary information.
5. **Accessible education:** Provide meaningful free access and affordable Premium plans.

---

# 2. Target Users and Personas

### Persona 1 – Beginner student

- Has little or no programming experience.
- Does not understand placement assessment patterns.
- Needs a clear learning roadmap.
- Requires explanations and foundational lessons.

### Persona 2 – Intermediate student

- Knows basic programming.
- Wants to improve aptitude, DSA and CS fundamentals.
- Needs topic-wise practice.
- Wants to track weaknesses.

### Persona 3 – Placement-ready student

- Already knows programming fundamentals.
- Wants company-specific preparation.
- Needs timed mock assessments.
- Wants to improve accuracy and speed.

### Persona 4 – Administrator

- Manages users and subscriptions.
- Manages learning content.
- Monitors referrals and commissions.
- Reviews payout eligibility.
- Monitors platform performance.

---

# 3. Technology Stack

Use the existing project stack. Do not replace technologies without a documented technical reason.

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 App Router |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Components | Existing shadcn/ui components |
| Icons | Lucide React |
| Animation | Existing Framer Motion / CSS animations |
| Backend | Supabase |
| Authentication | Supabase Auth |
| Database | PostgreSQL |
| Authorization | Supabase RLS |
| Validation | Zod |
| Charts | Recharts |
| Payments | Razorpay |
| Hosting | Vercel |
| Version control | GitHub |

### Engineering requirements

- Use Server Components by default.
- Use Client Components only when interactivity requires them.
- Use server-side authentication for protected routes.
- Keep database access logic separate from UI components.
- Use TypeScript types throughout the application.
- Validate all user input on the server.
- Use database migrations for schema changes.
- Avoid duplicated business logic.
- Avoid unnecessary dependencies.

---

# 4. Existing Work – Preserve It

The following work has already been implemented in the project.

### Landing page

- StudyBench header.
- Hero section.
- Interactive aptitude question.
- Problem and solution section.
- How-it-works section.
- Pricing section.
- FAQ section.
- Footer.
- Terms of Service.
- Landing-page animations.
- Scroll reveal animations.
- Sticky header and reading progress indicator.
- Highlight marker animation.
- Responsive layout work.

### Existing project characteristics

- Next.js App Router.
- Root-level `app/` directory.
- Root-level `components/` directory.
- `lib/supabase/` directory already exists.
- `supabase/` directory already exists.
- Existing shared components and UI components.
- Existing Tailwind configuration.

**Critical instruction:** Audit the existing implementation before modifying files. Preserve working code. Do not replace the landing page or rebuild existing components unnecessarily.

---

# 5. Product Navigation and Application Structure

The authenticated application should have a consistent navigation system.

### Student navigation

1. Dashboard
2. Learning Paths
3. Practice
4. Company Mock Tests
5. My Progress
6. Profile and Settings

### Learning navigation

- Aptitude
- CS Core
- Programming Languages
- Data Structures and Algorithms
- Company Mock Tests

Use a sidebar on desktop and a suitable responsive navigation pattern on mobile.

The interface should feel consistent throughout the application.

---

# 6. Authentication System

## 6.1 Signup

Implement a complete student registration experience.

Required fields:

- Full name.
- Email address.
- Password.
- Confirm password.
- Acceptance of Terms of Service and Privacy Policy.

Requirements:

- Email validation.
- Strong password validation.
- Password visibility toggle.
- Duplicate account handling.
- Loading states.
- Clear error messages.
- Email verification.
- Prevent unauthenticated access to protected pages.

## 6.2 Login

Support:

- Email and password.
- Google OAuth.
- Remembered authenticated sessions through secure Supabase cookies.
- Forgot password link.
- Proper error handling.

## 6.3 Password reset

Implement:

1. Forgot password page.
2. Email reset request.
3. Secure reset callback.
4. New password form.
5. Password confirmation.
6. Successful reset confirmation.

## 6.4 Authentication architecture

Use:

- Supabase browser client.
- Supabase server client.
- Next.js 16 proxy convention for session refresh and route protection.
- OAuth callback route.
- Secure cookie handling.

Do not trust frontend session state as the only authorization mechanism.

## 6.5 Protected routes

Unauthenticated users must not access student dashboard pages.

Authenticated users should not be redirected unnecessarily between login and dashboard.

Administrators must have separate role-based access.

---

# 7. Student Onboarding

After successful registration and email verification, the student enters onboarding.

The onboarding experience should use one question per screen.

### Question 1 – Full name

Collect or confirm the student's name.

### Question 2 – College

- College name.
- Optional institution information.

### Question 3 – Academic details

- Degree.
- Branch.
- Current year of study.
- Graduation year.

### Question 4 – Programming experience

Options:

- Beginner.
- Intermediate.
- Advanced.

### Question 5 – Placement goal

- Service-based companies.
- Product-based companies.
- Both.
- Not decided.

### Question 6 – Daily study target

Options:

- 15 minutes.
- 30 minutes.
- 45 minutes.
- 60 minutes.
- 90 minutes.

### Question 7 – Programming interests

Allow students to select relevant languages and areas.

### Onboarding UX

- Progress indicator.
- Back and continue controls.
- One question per screen.
- Save progress.
- Resume incomplete onboarding.
- Skip genuinely optional questions.
- Mobile-responsive layout.

After completion, redirect to the student dashboard.

---

# 8. Student Dashboard

The dashboard is the central learning destination.

It should immediately answer:

1. What have I completed?
2. How much progress have I made?
3. What should I study next?
4. How consistent am I?
5. Which subjects need improvement?

## 8.1 Dashboard components

### Welcome section

Display:

- Student's first name.
- Current learning level.
- Daily study goal.

### Continue learning

Display the recommended next lesson.

Information:

- Track.
- Topic.
- Lesson title.
- Estimated duration.
- Completion status.
- Continue button.

### Learning progress

Display separate progress indicators for:

- Aptitude.
- CS Core.
- Programming Languages.
- DSA.

### Daily activity

Display:

- XP earned today.
- Daily study goal.
- Streak.
- Completed lessons.

### Recent activity

Display:

- Recently completed lessons.
- Practice sessions.
- Mock test attempts.

### Weak areas

Use actual assessment data to identify topics where the student needs improvement.

Do not show fabricated statistics or meaningless progress charts.

---

# 9. Learning Management System

This is the most important part of StudyBench.

Build a structured learning experience rather than a collection of disconnected question pages.

## 9.1 Learning structure

Use this hierarchy:

**Learning Area → Subject → Topic → Lesson → Practice → Assessment**

Each learning area should have:

- Overview.
- Learning roadmap.
- Topic progression.
- Lesson content.
- Practice questions.
- Completion status.

## 9.2 Learning Area A – Aptitude

Divide aptitude into three major subjects.

### Quantitative Aptitude

Include:

- Number System.
- Percentages.
- Profit and Loss.
- Simple and Compound Interest.
- Ratio and Proportion.
- Time and Work.
- Time, Speed and Distance.
- Averages.
- Mixtures and Allegations.
- Probability.
- Permutations and Combinations.
- Data Interpretation.
- Geometry and Mensuration.

### Logical Reasoning

Include:

- Number Series.
- Alphabet Series.
- Coding and Decoding.
- Blood Relations.
- Direction Sense.
- Seating Arrangement.
- Puzzles.
- Syllogisms.
- Statements and Conclusions.
- Data Sufficiency.
- Analogy.
- Classification.

### Verbal Ability

Include:

- Reading Comprehension.
- Grammar.
- Sentence Correction.
- Error Detection.
- Synonyms and Antonyms.
- Para Jumbles.
- Fill in the Blanks.
- Vocabulary.
- Sentence Completion.

Free users can access the first two lessons of each relevant learning path. Premium users receive full access.

## 9.3 Learning Area B – Computer Science Core

Include foundational computer science topics.

### Subjects

**DBMS**
- Database fundamentals.
- Keys.
- Normalization.
- SQL fundamentals.
- Joins.
- Transactions.
- ACID properties.

**Operating Systems**
- Process management.
- Threads.
- Scheduling.
- Deadlocks.
- Memory management.
- Virtual memory.

**Computer Networks**
- OSI model.
- TCP/IP.
- HTTP and HTTPS.
- DNS.
- Routing.
- TCP and UDP.

**Object-Oriented Programming**
- Classes and objects.
- Encapsulation.
- Inheritance.
- Polymorphism.
- Abstraction.
- Interfaces.

**Software Engineering**
- SDLC.
- Agile.
- Testing fundamentals.
- Version control.
- Development methodologies.

Each subject should have structured lessons and practice questions.

## 9.4 Learning Area C – Programming Languages

Provide seven major programming language learning paths.

The language tracks should cover:

1. C
2. C++
3. Java
4. Python
5. JavaScript
6. SQL
7. C#

Each language should have:

- Introduction.
- Syntax.
- Variables and data types.
- Operators.
- Conditional statements.
- Loops.
- Functions.
- Arrays or collections.
- Strings.
- Object-oriented concepts where applicable.
- Language-specific concepts.
- Output prediction questions.
- Find-the-error questions.
- Conceptual MCQs.

### Important product decision

StudyBench will NOT include an online coding judge, compiler or execution environment.

Do not integrate Judge0, online compilers or code execution APIs.

Instead, teach programming through:

- Concept explanations.
- Syntax examples.
- Code walkthroughs.
- Output prediction.
- Find-the-error exercises.
- Multiple-choice questions.
- Practice quizzes.

## 9.5 Learning Area D – Data Structures and Algorithms

Include:

- Time and Space Complexity.
- Arrays.
- Strings.
- Linked Lists.
- Stacks.
- Queues.
- Hashing.
- Searching.
- Sorting.
- Recursion.
- Trees.
- Binary Search Trees.
- Heaps.
- Graphs.
- Greedy Algorithms.
- Dynamic Programming.

Organize the topics from beginner to advanced.

Do not force beginners to start with advanced DSA.

---

# 10. Lesson Experience

Every lesson must have a consistent structure.

### Lesson screen

1. Lesson title.
2. Short introduction.
3. Learning objectives.
4. Detailed explanation.
5. Examples.
6. Important formulas or syntax where relevant.
7. Key takeaways.
8. Practice questions.
9. Completion status.

### Lesson UX

- Clean reading layout.
- Clear typography.
- Good line spacing.
- Code blocks with syntax formatting.
- Tables where helpful.
- Mobile-friendly content.
- Previous and next lesson navigation.
- Save progress.

### Lesson completion

A lesson should be marked completed only after the defined completion requirements are met.

Store:

- User ID.
- Lesson ID.
- Completion status.
- Completion timestamp.
- XP awarded.
- Last accessed timestamp.

Prevent users from repeatedly completing the same lesson to farm XP.

---

# 11. Practice Engine

Build a reusable question engine for all learning areas.

## Supported question types

- Single-choice MCQs.
- Multiple-choice questions where explicitly configured.
- Output prediction.
- Find the error.
- Numerical aptitude questions.

## Practice workflow

1. Display question.
2. Display answer choices or appropriate input.
3. Allow answer submission.
4. Validate the response.
5. Show correct or incorrect feedback.
6. Explain the correct answer.
7. Move to the next question.

### Practice summary

Display:

- Total questions.
- Correct answers.
- Incorrect answers.
- Accuracy.
- XP earned.
- Topics requiring revision.

### Important

Question evaluation must happen using trusted server-side data.

Do not send correct answers to the client before submission when they could be extracted from the application payload.

---

# 12. Company Mock Tests

Build a dedicated company mock-test section.

There will initially be five company mock tests.

The exact five companies and test structures should be maintained as editable admin-managed content rather than hardcoded throughout the application.

## Mock-test functionality

- Company information.
- Test instructions.
- Number of questions.
- Duration.
- Section breakdown.
- Start test.
- Timer.
- Answer navigation.
- Question marking for review.
- Previous and next.
- Submit test.
- Automatic submission on expiry.
- Result page.

## Result page

Display:

- Total score.
- Correct answers.
- Incorrect answers.
- Unanswered questions.
- Accuracy.
- Time taken.
- Section-wise performance.
- Topic-wise recommendations.

These tests are original practice assessments inspired by recruitment assessment formats. Do not present them as official company examinations.

## Free access

- One of the five company mock tests is accessible to Free users.
- The remaining mock tests require Premium.

## Premium access

- All five initial mock tests.
- Future mock tests according to the applicable Premium entitlement.

---

# 13. Subscription and Premium System

## 13.1 Pricing

Implement the following plans.

| Plan | Price | Duration |
|---|---:|---|
| Free | ₹0 | Ongoing |
| Premium – 3 months | ₹199 | 3 months |
| Premium – 1 year | ₹599 | 1 year |

There is no automatic renewal.

All payments are final, subject to the exceptions and legal requirements described in the Terms of Service.

## 13.2 Free plan

Free users can access:

- First two lessons in every applicable subject, language and learning path.
- Practice questions associated with accessible lessons.
- One of five company mock tests.
- XP system.
- Streaks.
- Progress dashboard.
- Completed lesson history.

## 13.3 Premium plan

Premium users receive:

- All lessons across all learning areas.
- All seven programming language tracks.
- Complete aptitude content.
- Complete CS Core content.
- Complete DSA content.
- Full practice question banks.
- All five company mock tests.
- Future content according to the Premium plan.
- Full progress and review features.

## 13.4 Access control

Implement a centralized entitlement system.

Do not scatter checks such as `if (isPremium)` throughout unrelated components.

Create reusable authorization functions that determine:

- Current subscription status.
- Plan type.
- Subscription start date.
- Subscription end date.
- Whether access is currently active.
- Whether a particular lesson is accessible.
- Whether a mock test is accessible.

All premium access decisions must be enforced server-side.

## 13.5 Razorpay integration

Implement:

1. Create order on the server.
2. Return order details to the client.
3. Open Razorpay Checkout.
4. Receive payment response.
5. Verify payment signature on the server.
6. Confirm payment with trusted server-side verification.
7. Activate subscription.
8. Record payment.
9. Handle webhook events.
10. Handle duplicate webhook delivery safely.

Never activate Premium based solely on a frontend success callback.

Use idempotency to prevent duplicate subscription activation.

## 13.6 Subscription expiry

When Premium expires:

- Return the user to Free access.
- Preserve completed lessons.
- Preserve XP.
- Preserve streak history.
- Preserve practice history.
- Preserve mock-test results.

Do not delete user learning data when subscriptions expire.

---

# 14. Gamification System

Gamification should encourage consistent learning.

Do not make it visually distracting.

## 14.1 XP

Award XP for meaningful learning actions.

Suggested starting values:

| Activity | XP |
|---|---:|
| Complete a lesson | 20 |
| Complete a practice set | 10 |
| Complete a unit challenge | 30 |
| Complete a mock test | 50 |

These values should be configurable.

### XP rules

- Award XP through server-side logic.
- Each qualifying activity should have a unique reward reference.
- Prevent duplicate XP awards.
- Maintain a transaction history.
- Do not award XP merely for opening a page.
- Do not allow users to manipulate client-side XP values.

## 14.2 Levels

Create a level progression system.

Suggested levels:

1. Beginner.
2. Explorer.
3. Learner.
4. Problem Solver.
5. Skilled.
6. Advanced.
7. Placement Ready.

Use cumulative XP thresholds that can be adjusted through configuration.

## 14.3 Streaks

Track consecutive study days.

Requirements:

- Use a consistent date and timezone strategy.
- Record genuine qualifying learning activity.
- Prevent duplicate daily activity records.
- Display current streak.
- Display longest streak.
- Display recent activity history.

## 14.4 Badges

Suggested badges:

- First Lesson.
- First Practice.
- Five Lessons Completed.
- Seven-Day Streak.
- Aptitude Explorer.
- Coding Fundamentals.
- DSA Starter.
- Mock Test Champion.

Badges must be earned through defined criteria.

## 14.5 Leaderboard

Do not implement a leaderboard.

It has intentionally been excluded from the product scope.

---

# 15. Referral and Affiliate System

Implement a separate referral system for students and administrators.

The system should support tracking, commission calculation, eligibility and manual payout management.

## 15.1 Student referral functionality

Every eligible user receives a unique referral code and referral link.

Example:

`studybench.in/signup?ref=UNIQUECODE`

Display:

- Referral code.
- Referral link.
- Copy link action.
- Number of referred users.
- Successful referrals.
- Pending commission.
- Eligible commission.
- Total paid commission.
- Referral history.

## 15.2 Referral attribution

When a new user signs up through a referral link:

- Capture the referral code.
- Validate it on the server.
- Associate the new account with the referring user.
- Prevent self-referrals.
- Prevent duplicate attribution.
- Preserve attribution after signup.
- Prevent changing referral ownership after registration.

Do not trust a client-supplied referral owner ID.

## 15.3 Commission

Initial commission rate: 10%.

Commission should be calculated on qualifying successful Premium purchases.

Define commission eligibility rules clearly.

Suggested status lifecycle:

- Pending.
- Eligible.
- Paid.
- Reversed.

Only verified and eligible transactions can generate payable commissions.

Refunds, chargebacks and duplicate payments must not generate valid commission.

## 15.4 Payout rules

Use manual UPI payouts initially.

Payout methods:

- GPay.
- PhonePe.
- Paytm.
- Other supported UPI IDs.

Minimum payout threshold: ₹500.

Suggested operating process:

1. Admin opens referral payout management after the 20th.
2. System displays eligible users.
3. Admin reviews the eligible balance.
4. Admin verifies the payout information.
5. Admin sends the payout manually.
6. Admin records the payout reference.
7. System marks the commission as paid.
8. User sees updated payout history.

Do not automatically mark payouts as successful.

## 15.5 Referral security

- Unique referral codes.
- No self-referrals.
- Duplicate account detection.
- Server-side attribution.
- Audit logs.
- Commission ledger.
- Payout history.
- Admin approval.

IP information, if collected for fraud prevention, must have a documented privacy purpose, appropriate retention and access restrictions.

---

# 16. Admin Dashboard

Create a completely separate admin interface.

Example route:

`/admin`

Only authorized administrators can access it.

Do not make a user an administrator simply because their frontend profile contains an editable role value.

## 16.1 Admin overview

Display:

- Total registered students.
- Active users.
- New registrations.
- Premium subscribers.
- Expired subscriptions.
- Total revenue.
- Mock-test participation.
- Referral statistics.

## 16.2 User management

Admin can:

- View students.
- Search users.
- Filter by registration date.
- View account status.
- View subscription status.
- View onboarding information.
- View learning progress.
- Suspend accounts where justified.

Do not expose password hashes or authentication secrets.

## 16.3 Content management

Admin can manage:

- Learning areas.
- Subjects.
- Topics.
- Lessons.
- Questions.
- Answers.
- Explanations.
- Mock tests.
- Test sections.

Provide publishing and draft states.

Avoid hardcoding all learning content into frontend components.

## 16.4 Subscription management

Display:

- Student.
- Plan.
- Payment amount.
- Payment reference.
- Start date.
- End date.
- Subscription status.

Allow authorized support actions with audit records.

## 16.5 Referral administration

This is a critical admin feature.

Display:

- Referrer.
- Referral code.
- Referred user.
- Registration date.
- Qualifying purchase.
- Commission amount.
- Commission status.
- Eligible payout balance.
- UPI details where required.

Admin actions:

- View referral details.
- Review commissions.
- Approve eligible commissions.
- Record payouts.
- Review payout history.
- Identify suspicious referral activity.

## 16.6 Admin roles

Start with:

- Super Admin.
- Content Admin.
- Support Admin.

Use server-enforced permissions for each role.

---

# 17. Database Architecture

Design a normalized PostgreSQL database.

The following are proposed logical entities. Audit existing tables and reuse or migrate them instead of blindly creating duplicates.

## 17.1 User and profile tables

- profiles
- user_roles
- onboarding_responses

## 17.2 Learning content

- learning_areas
- subjects
- topics
- lessons
- lesson_content
- lesson_prerequisites

## 17.3 Practice

- questions
- question_options
- question_explanations
- practice_sessions
- practice_answers

## 17.4 Mock tests

- mock_tests
- mock_test_sections
- mock_test_questions
- mock_test_attempts
- mock_test_answers

## 17.5 Progress

- user_lesson_progress
- user_topic_progress
- learning_activity
- xp_transactions
- user_streaks
- badges
- user_badges

## 17.6 Payments

- subscription_plans
- user_subscriptions
- payments
- payment_webhook_events

## 17.7 Referrals

- affiliate_settings
- referral_codes
- referrals
- referral_commissions
- referral_payouts

## 17.8 Administration

- admin_audit_logs
- content_audit_logs
- platform_settings

### Database requirements

- Proper primary keys.
- Foreign keys.
- Unique constraints.
- Indexes.
- Appropriate timestamp columns.
- Referential integrity.
- Transaction-safe operations.
- Database migrations.
- Consistent naming conventions.

Use UUID identifiers where appropriate.

---

# 18. Security Requirements

Security must be implemented from the beginning.

## Supabase RLS

Enable Row Level Security on all user-accessible tables.

Policies must ensure:

- Users can view their own profile.
- Users can update permitted profile fields.
- Users cannot modify their own role.
- Users cannot access another student's private learning history.
- Users cannot modify payment verification status.
- Users cannot manually increase their XP.
- Users cannot manipulate referral commissions.
- Users cannot approve their own payouts.
- Only authorized administrators can manage platform content.

## Backend security

- Never expose Supabase service-role keys.
- Never trust client-supplied subscription status.
- Verify payment signatures.
- Verify OAuth callback parameters.
- Validate input with Zod.
- Rate-limit sensitive operations.
- Use safe error responses.
- Prevent unauthorized privilege escalation.
- Protect against duplicate requests and replay attacks.

## Data protection

- Collect only necessary personal information.
- Provide a privacy policy.
- Provide account deletion procedures.
- Avoid unnecessary tracking.
- Keep audit logs for sensitive administrative operations.
- Never log passwords or secrets.

---

# 19. UI/UX Design System

## 19.1 Overall design direction

StudyBench should retain the same visual language as its existing landing page.

The application should feel like a carefully designed educational product, not a generic AI-generated SaaS template.

### Design principles

- Minimal.
- Light theme.
- Professional.
- Student-friendly.
- Clear information hierarchy.
- Consistent spacing.
- Readable typography.
- Subtle interaction.
- Strong accessibility.

## 19.2 Visual identity

Preserve existing design tokens and CSS variables.

Use the current palette:

- Background: warm or neutral light background.
- Cards: clean white or existing card surface.
- Primary: existing dark primary color.
- Highlighter: existing yellow accent.
- Text: strong neutral foreground.
- Secondary text: muted neutral.
- Success: restrained green.
- Error: restrained red.
- Borders: subtle neutral borders.

Do not introduce a second unrelated color system.

## 19.3 Typography

Use the existing font system.

Typography must have a clear hierarchy:

- Page headings.
- Section headings.
- Lesson titles.
- Body text.
- Supporting information.
- Metadata.

Prioritize readability over decorative typography.

## 19.4 Icons

Use Lucide React exclusively for interface icons.

Examples:

- Home.
- BookOpen.
- GraduationCap.
- Code.
- Brain.
- Target.
- ChartNoAxesCombined.
- Trophy.
- Flame.
- Clock.
- Settings.
- UserRound.
- Lock.
- Check.
- CircleHelp.

Use consistent icon sizes and stroke widths.

Do not use emoji as replacements for navigation icons.

## 19.5 Illustrations and imagery

Avoid AI-generated images and generic stock illustrations.

Prefer:

- Typography.
- Real interface elements.
- Simple diagrams.
- CSS-based visual explanations.
- Lucide icons.
- Small custom SVGs when they genuinely communicate information.

Do not create decorative imagery simply to fill empty space.

## 19.6 Animations

Reuse the existing animation style.

Allowed:

- Subtle entrance transitions.
- Scroll reveal where appropriate.
- Button feedback.
- Progress transitions.
- Small success animations.
- Accordion interactions.
- Loading skeletons.

Avoid:

- Infinite floating objects.
- Excessive parallax.
- Fake count-up statistics.
- Unnecessary card lifting.
- Excessive animation.
- Animations that delay learning.

Respect reduced-motion preferences.

## 19.7 Responsive design

Every major screen must work on:

- Desktop.
- Laptop.
- Tablet.
- Mobile.

No horizontal overflow.

Use accessible touch targets and appropriate mobile navigation.

---

# 20. Accessibility and Usability

Follow WCAG 2.2 AA principles where practical.

Requirements:

- Keyboard navigation.
- Visible focus states.
- Proper labels.
- Accessible forms.
- Semantic HTML.
- Screen-reader-friendly controls.
- Sufficient contrast.
- Error messages associated with fields.
- Reduced-motion support.
- Accessible dialogs and menus.

The application should be usable by students with different levels of technical experience.

---

# 21. Performance Requirements

- Optimize Server Components.
- Avoid unnecessary client-side JavaScript.
- Use pagination for large question banks.
- Use database indexes.
- Avoid N+1 queries.
- Lazy-load appropriate non-critical content.
- Optimize font loading.
- Avoid unnecessary chart rendering.
- Use efficient Supabase queries.
- Keep dashboards responsive.
- Avoid fetching entire question banks unnecessarily.

Do not sacrifice correctness or security for performance.

---

# 22. Analytics and Product Measurement

Build meaningful internal analytics.

Track:

- Registrations.
- Onboarding completion.
- Daily active users.
- Lessons started.
- Lessons completed.
- Practice completion.
- Mock-test attempts.
- Free-to-Premium conversion.
- Subscription expiry.
- Referral conversions.
- Commission payouts.

Do not expose private student information in public analytics.

Use aggregate metrics for administrator reporting wherever possible.

---

# 23. Implementation Roadmap

Codex must implement the application in the following phases.

## Phase 0 – Existing codebase audit

- Inspect existing project structure.
- Review package dependencies.
- Inspect Supabase files.
- Inspect existing database migrations.
- Review environment variables by name only.
- Review existing UI components.
- Identify incomplete and duplicate implementations.
- Run the existing build.
- Record the baseline errors.

Deliverable: Engineering audit report.

## Phase 1 – Authentication

- Supabase browser client.
- Supabase server client.
- Next.js 16 proxy/session handling.
- Signup.
- Login.
- Google OAuth.
- Email verification.
- Password reset.
- Protected routes.
- Logout.

Deliverable: Fully working authentication.

## Phase 2 – Database foundation and onboarding

- Profile schema.
- Role schema.
- Onboarding schema.
- RLS policies.
- Student onboarding.
- Profile editing.

Deliverable: Authenticated student accounts with persistent profiles.

## Phase 3 – Student dashboard

- Dashboard layout.
- Sidebar.
- Welcome section.
- Learning progress.
- Recommended lesson.
- Activity summary.
- XP and streak display.

Deliverable: Functional student dashboard.

## Phase 4 – Learning management system

- Learning area management.
- Subject management.
- Topic management.
- Lesson rendering.
- Lesson navigation.
- Progress tracking.
- Free and Premium access restrictions.

Deliverable: Functional learning experience.

## Phase 5 – Practice engine

- Question database.
- Question rendering.
- Answer evaluation.
- Explanations.
- Practice sessions.
- Results.
- Progress tracking.

Deliverable: Reusable practice system.

## Phase 6 – Company mock tests

- Five initial test configurations.
- Timed assessment.
- Answer navigation.
- Test submission.
- Results.
- Performance analysis.
- Free and Premium restrictions.

Deliverable: Complete mock-test experience.

## Phase 7 – Premium and payment integration

- Subscription configuration.
- Razorpay order creation.
- Payment verification.
- Webhooks.
- Premium activation.
- Expiration handling.
- Payment history.

Deliverable: Production-ready subscription system.

## Phase 8 – Gamification

- XP ledger.
- Level calculation.
- Streaks.
- Badges.
- Reward history.
- Anti-abuse protection.

Deliverable: Fully functional gamification system.

## Phase 9 – Referral system

- Referral codes.
- Attribution.
- Commission calculation.
- Commission ledger.
- Minimum payout threshold.
- Manual payout workflow.
- Referral dashboard.

Deliverable: Complete affiliate system.

## Phase 10 – Admin dashboard

- Admin authentication and permissions.
- Analytics.
- User management.
- Content management.
- Subscription management.
- Referral management.
- Payout management.
- Audit logs.

Deliverable: Fully functional administration system.

## Phase 11 – Production readiness

- Security audit.
- RLS audit.
- Payment testing.
- Responsive testing.
- Accessibility testing.
- Performance testing.
- Error handling.
- Database backup strategy.
- Production deployment.

Deliverable: Production-ready StudyBench.

---

# 24. Testing Requirements

Codex must not consider a feature complete merely because its page renders.

## Unit testing

Test:

- XP calculations.
- Level calculations.
- Subscription expiry.
- Premium entitlement.
- Free lesson restrictions.
- Mock-test access.
- Referral commission calculations.
- Question evaluation.

## Integration testing

Test:

- Signup and email verification.
- Login and logout.
- OAuth.
- Password reset.
- Profile creation.
- Lesson completion.
- Practice submission.
- Mock-test submission.
- Payment activation.
- Referral attribution.

## Security testing

Test:

- Unauthorized routes.
- Cross-user data access.
- RLS policies.
- Role escalation.
- Premium bypass.
- XP manipulation.
- Referral fraud.
- Duplicate payment callbacks.
- Webhook replay.

## UI testing

Test:

- Desktop layout.
- Mobile layout.
- Navigation.
- Forms.
- Loading states.
- Error states.
- Empty states.
- Accessibility.

## Build checks

After each implementation phase, run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Fix errors introduced by the current implementation before proceeding.

---

# 25. Definition of Done

A feature is considered complete only when:

1. The UI works.
2. The database integration works.
3. Server-side validation works.
4. Authorization works.
5. RLS policies are tested.
6. Error states are handled.
7. Loading states are implemented.
8. Mobile layout works.
9. TypeScript passes.
10. Relevant tests pass.
11. No existing working feature is broken.
12. The implementation is documented.

Do not leave fake data, non-functional buttons, placeholder payment flows or incomplete security checks while claiming production readiness.

---

# 26. Explicitly Out of Scope

Do not implement the following unless separately approved:

- Online coding judge.
- Online code execution.
- Public leaderboard.
- AI-generated lesson content.
- AI-generated illustrations.
- AI chatbot.
- Social networking.
- Public student profiles.
- Unnecessary community features.
- Automatic recurring billing.

The primary focus is delivering an excellent placement preparation platform.

---

# 27. CODEX IMPLEMENTATION INSTRUCTIONS

## Role assignment

You must act as a coordinated senior software development team.

### Role 1 – Senior Product Manager

Own product scope, student journeys, business rules, prioritization and acceptance criteria.

### Role 2 – Principal Software Architect

Own system architecture, database relationships, API boundaries, scalability and maintainability.

### Role 3 – Senior UI/UX Designer

Own design consistency, navigation, accessibility, responsive layouts and student experience.

### Role 4 – Senior Frontend Engineer

Own Next.js, React, TypeScript, reusable components, state management and client interactions.

### Role 5 – Senior Backend Engineer

Own Supabase, PostgreSQL, migrations, server-side business logic, authentication and data integrity.

### Role 6 – Application Security Engineer

Own RLS, permissions, secrets, payment verification, abuse prevention and security testing.

### Role 7 – QA Engineer

Own unit testing, integration testing, end-to-end testing and regression prevention.

All roles must work toward one coherent implementation rather than producing conflicting architecture.

## Mandatory Codex operating rules

1. First inspect the entire existing project.
2. Read AGENTS.md and all relevant project instructions.
3. Do not assume files are missing without checking.
4. Do not overwrite working code unnecessarily.
5. Do not redesign the existing landing page.
6. Do not change the product's agreed pricing or access rules.
7. Do not add a coding judge.
8. Do not add a leaderboard.
9. Do not introduce AI-generated images or decorative illustrations.
10. Use Lucide React icons.
11. Reuse existing design tokens and components.
12. Use database migrations for schema changes.
13. Never disable RLS to make functionality work.
14. Never expose service-role credentials.
15. Never trust client-side payment verification.
16. Never hardcode administrator privileges.
17. Never use fabricated analytics or progress.
18. Do not create unnecessary dependencies.
19. Do not leave broken placeholder controls.
20. Preserve existing working features.

## Working methodology

Use this implementation cycle:

**Inspect → Plan → Implement → Test → Review → Commit → Continue**

At the start of every phase:

- Explain what will be implemented.
- List affected files.
- Identify database changes.
- Identify security considerations.
- Define acceptance tests.

After implementation:

- Run TypeScript checks.
- Run lint.
- Run the production build.
- Run relevant tests.
- Review the changes for regressions.
- Summarize what was completed.
- List remaining issues honestly.

Do not silently skip failed tests.

Do not begin a dependent phase if the current phase has critical unresolved errors.

If a requirement is ambiguous, inspect existing code and established product decisions first. Ask for clarification only when an implementation decision materially affects the product or data.

## Git methodology

Use meaningful commits after each stable phase.

Suggested commit messages:

- `feat: implement supabase authentication`
- `feat: add student onboarding`
- `feat: implement student dashboard`
- `feat: build learning management system`
- `feat: implement practice engine`
- `feat: add company mock tests`
- `feat: integrate premium subscriptions`
- `feat: implement gamification`
- `feat: add referral management`
- `feat: build admin dashboard`
- `test: add production readiness checks`

Never overwrite or discard the user's existing uncommitted work.

---

# 28. Final Product Success Criteria

StudyBench should ultimately deliver the following experience.

A new student visits the landing page, understands the product, registers, verifies their email, completes onboarding and enters a personalized dashboard.

The student chooses a learning path, studies a lesson, completes practice questions, receives explanations, earns XP and tracks progress.

When the student wants more learning content or company mock tests, they can purchase Premium.

The platform verifies payment securely, grants access and preserves the student's learning history.

Students can also refer friends, track commissions and request eligible payouts.

Administrators can manage the platform, its content, users, payments, referrals and payouts through a secure administrative interface.

The final application should be:

- Reliable.
- Secure.
- Responsive.
- Maintainable.
- Affordable.
- Easy to understand.
- Useful for students at different preparation levels.

**The ultimate goal is not to build a large collection of features. It is to build a placement preparation platform that genuinely helps students become more prepared for recruitment.**

---

**END OF PRD**

**Implementation authority:** This document defines the agreed product scope and engineering requirements. Existing working code and established project architecture should be preserved wherever they satisfy these requirements. Any necessary deviations must be explained and documented before implementation.