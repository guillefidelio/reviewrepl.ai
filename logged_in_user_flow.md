# 🔐 Logged-In User Flow Documentation


### Direct URL Access
- Any `/dashboard/*` URL → check → Redirect to `/login` if not logged in
- Successful login → Redirect to original URL or `/dashboard`

---

## 🏠 Dashboard Home Screen (`/dashboard`)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ╭──── SIDEBAR (256px) ────╮ ┌── HEADER ──────────────────────────────────────────────────────────────┐ │
│ │                         │ │ [≡] (mobile)         John Doe | free | active | [🚪 Sign Out]      │ │
│ │ ╭─ 🌐 ReviewRepl.ai ──╮ │ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │ Dashboard           │ │                                                                         │
│ │ ╰─────────────────────╯ │ ╭── MAIN CONTENT AREA ────────────────────────────────────────────╮ │
│ │                         │ │                                                                  │ │
│ │ ⌂ Home              ●   │ │ ╭─ WELCOME SECTION ───────────────────────────────────────────╮ │ │
│ │   Dashboard overview    │ │ │ Welcome back, John!                                          │ │
│ │                         │ │ │ Manage your AI-powered review replies and track your usage. │ │
│ │ 👤 Profile              │ │ ╰──────────────────────────────────────────────────────────────╯ │ │
│ │   Manage your info      │ │                                                                  │ │
│ │                         │ │ ╭─ STATS GRID (1 col → 2 col → 4 col responsive) ─────────────╮ │ │
│ │ 💬 Prompts              │ │ │ ┌─ CREDITS CARD ────────┐ ┌─ REVIEWS CARD ────────┐          │ │ │
│ │   AI response templates │ │ │ │ Available Credits  💳  │ │ Reviews Responded  📊  │          │ │ │
│ │                         │ │ │ │                        │ │                        │          │ │ │
│ │                         │ │ │ │         0              │ │         0              │          │ │ │
│ │ ╭─ Chrome Extension ─╮  │ │ │ │ 0 used of 0 total      │ │ This month             │          │ │ │
│ │ │ Version 2.0.1       │  │ │ │ [░░░░░░░░░░░░░░░░░░]    │ │                        │          │ │ │
│ │ ╰─────────────────────╯  │ │ │ └────────────────────────┘ └────────────────────────┘          │ │ │
│ ╰─────────────────────────╯ │ │                                                                  │ │
│                             │ │ │ ┌─ ANSWERING MODE ─────────┐ ┌─ SUBSCRIPTION STATUS─┐          │ │ │
│                             │ │ │ │ You are using      📈 │ │ Current Plan     🕐   │          │ │ │
│                             │ │ │ │                        │ │                        │          │ │ │
│                             │ │ │ │        PRO             │ │        Pro             │          │ │ │
│                             │ │ │ │        mode            │ │                        │          │ │ │
│                             │ │ │ │                        │ │                        │          │ │ │
│                             │ │ │ └────────────────────────┘ └────────────────────────┘          │ │ │
│                             │ │ ╰──────────────────────────────────────────────────────────────╯ │ │
│                             │ │                                                                  │ │
│                             │ │ ╭─ MAIN ACTIONS (1 col → 2 col responsive) ───────────────────╮ │ │
│                             │ │ │ ┌─ CHROME EXTENSION CARD ───────────────────────────────────┐ │ │ │
│                             │ │ │ │ 🌐 Chrome Extension                                        │ │ │ │
│                             │ │ │ │ Install our Chrome extension to start generating AI replies│ │ │ │
│                             │ │ │ │                                                            │ │ │ │
│                             │ │ │ │ ┌─ ReviewRepl.ai Extension    [Not Installed] ──────────┐ │ │ │ │
│                             │ │ │ │ │ Version 2.0.1                                          │ │ │ │ │
│                             │ │ │ │ └────────────────────────────────────────────────────────┘ │ │ │ │
│                             │ │ │ │                                                            │ │ │ │
│                             │ │ │ │ [ 💾 Install Chrome Extension              ]              │ │ │ │
│                             │ │ │ └────────────────────────────────────────────────────────────┘ │ │ │
│                             │ │ │                                                                │ │ │
│                             │ │ │ ┌─ ACCOUNT SETTINGS CARD ─────────────────────────────────────┐ │ │ │
│                             │ │ │ │ 👤 Account Settings                                          │ │ │ │
│                             │ │ │ │ Manage your profile and subscription                         │ │ │ │
│                             │ │ │ │                                                              │ │ │ │
│                             │ │ │ │ ┌─ Current Plan              [Active] ─────────────────────┐ │ │ │ │
│                             │ │ │ │ │ Free Plan                                                │ │ │ │ │
│                             │ │ │ │ └──────────────────────────────────────────────────────────┘ │ │ │ │
│                             │ │ │ │                                                              │ │ │ │
│                             │ │ │ │ [  ⚙️ Manage Account                      ]                │ │ │ │
│                             │ │ │ │                                                              │ │ │ │
│                             │ │ │ │ • Update billing information                                 │ │ │ │
│                             │ │ │ │ • Change subscription plan                                   │ │ │ │
│                             │ │ │ └──────────────────────────────────────────────────────────────┘ │ │ │
│                             │ │ ╰──────────────────────────────────────────────────────────────╯ │ │
│                             │ │                                                                  │ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Dashboard Home Features
- **Navigation**: Persistent sidebar (mobile: collapsible)
- **Stats Overview**: Credits, reviews generated, success rate, last activity
- **Chrome Extension**: Installation status and download link
- **Account Info**: Plan type, subscription status
- **Recent Activity**: Shows usage when extension is active

---

## 👤 Profile Screen (`/dashboard/profile`)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ╭──── SIDEBAR (256px) ────╮ ┌── HEADER ──────────────────────────────────────────────────────────────┐ │
│ │                         │ │ [≡] (mobile)         John Doe | free | active | [🚪 Sign Out]      │ │
│ │ ╭─ 🌐 ReviewRepl.ai ──╮ │ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │ Dashboard           │ │                                                                         │
│ │ ╰─────────────────────╯ │ ╭── MAIN CONTENT AREA ────────────────────────────────────────────╮ │
│ │                         │ │                                                                  │ │
│ │ ⌂ Home                  │ │ ╭─ PAGE HEADER ─────────────────────────────────────────────────╮ │ │
│ │   Dashboard overview    │ │ │ Profile                                                        │ │
│ │                         │ │ │ Manage your personal information                               │ │
│ │ 👤 Profile          ●   │ │ ╰────────────────────────────────────────────────────────────────╯ │ │
│ │   Manage your info      │ │                                                                  │ │
│ │                         │ │ ╭─ SUCCESS/ERROR ALERT (if present) ───────────────────────────╮ │ │
│ │ 💬 Prompts              │ │ │ ✅ Profile updated successfully!                              │ │ │
│ │   AI response templates │ │ ╰────────────────────────────────────────────────────────────────╯ │ │
│ │                         │ │                                                                  │ │
│ │                         │ │ ╭─ PERSONAL INFORMATION FORM CARD ─────────────────────────────╮ │ │
│ │ ╭─ Chrome Extension ─╮  │ │ │ Personal Information                                         │ │ │
│ │ │ Version 2.0.1       │  │ │ │ Update your personal details below.                         │ │ │
│ │ ╰─────────────────────╯  │ │ │                                                              │ │ │
│ ╰─────────────────────────╯ │ │ │ ┌─ FORM GRID (1 col → 2 col responsive) ─────────────────┐ │ │ │
│                             │ │ │ │ ┌─ First Name ─────────────┐ ┌─ Last Name ──────────────┐ │ │ │ │
│                             │ │ │ │ │ First Name               │ │ Last Name                │ │ │ │ │
│                             │ │ │ │ │ [John                   ] │ │ [Doe                    ] │ │ │ │ │
│                             │ │ │ │ └─────────────────────────────┘ └──────────────────────────┘ │ │ │ │
│                             │ │ │ │                                                              │ │ │ │
│                             │ │ │ │ ┌─ Email Address ──────────────────────────────────────────┐ │ │ │ │
│                             │ │ │ │ │ Email Address                                            │ │ │ │ │
│                             │ │ │ │ │ [john@example.com              ] (disabled/grayed out)  │ │ │ │ │
│                             │ │ │ │ │ Email cannot be changed after registration              │ │ │ │ │
│                             │ │ │ │ └──────────────────────────────────────────────────────────┘ │ │ │ │
│                             │ │ │ │                                                              │ │ │ │ │
│                             │ │ │ │ ┌─ Phone Number ───────────────────────────────────────────┐ │ │ │ │
│                             │ │ │ │ │ Phone Number                                             │ │ │ │ │
│                             │ │ │ │ │ [+1 (555) 123-4567            ]                         │ │ │ │ │
│                             │ │ │ │ └──────────────────────────────────────────────────────────┘ │ │ │ │
│                             │ │ │ └──────────────────────────────────────────────────────────────┘ │ │ │
│                             │ │ ╰──────────────────────────────────────────────────────────────────╯ │ │
│                             │ │                                                                  │ │
│                             │ │ ╭─ FORM ACTIONS ──────────────────────────────────────────────╮ │ │
│                             │ │ │                                              [Save Profile]  │ │ │
│                             │ │ ╰──────────────────────────────────────────────────────────────╯ │ │
│                             │ ╰──────────────────────────────────────────────────────────────────╯ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Profile Features
- **Form Fields**: First name, last name, phone (email read-only)
- **Real-time Validation**: Form validation on submit
- **Save States**: Loading spinner, success/error messages
- **API Integration**: Updates Firestore via `/api/user/profile`

---

## 💬 Prompts Management (`/dashboard/prompts`)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ╭──── SIDEBAR (256px) ────╮ ┌── HEADER ──────────────────────────────────────────────────────────────┐ │
│ │                         │ │ [≡] (mobile)         John Doe | free | active | [🚪 Sign Out]      │ │
│ │ ╭─ 🌐 ReviewRepl.ai ──╮ │ └─────────────────────────────────────────────────────────────────────┘ │
│ │ │ Dashboard           │ │                                                                         │
│ │ ╰─────────────────────╯ │ ╭── MAIN CONTENT AREA ────────────────────────────────────────────╮ │
│ │                         │ │                                                                  │ │
│ │ ⌂ Home                  │ │ ╭─ PAGE HEADER ─────────────────────────────────────────────────╮ │ │
│ │   Dashboard overview    │ │ │ Prompt Management    [📝Unsaved] [🔄Reload] [💾Save All]    │ │ │
│ │                         │ │ │ Customize your review response templates for different        │ │ │
│ │ 👤 Profile              │ │ │ review sentiments.                                             │ │ │
│ │   Manage your info      │ │ ╰────────────────────────────────────────────────────────────────╯ │ │
│ │                         │ │                                                                  │ │
│ │ 💬 Prompts          ●   │ │ ╭─ ERROR DISPLAY (if present) ─────────────────────────────────╮ │ │
│ │   AI response templates │ │ │ ⚠️ Error loading prompts. Please try again.                  │ │ │
│ │                         │ │ ╰────────────────────────────────────────────────────────────────╯ │ │
│ │                         │ │                                                                  │ │
│ │ ╭─ Chrome Extension ─╮  │ │  ╭─ TABED VIEW - SIMPLE MODE / PRO MODE(1 col → 3 col responsive) │ │
│ │ │ Version 2.0.1       │  │ │ │  SIMPLE MODE SHOWS A MESSAGE "YOU ARE GOING TO ANSWER REVIEWS
│                             │ │ │ ON OUR STATE OF THE ART AI MODEL                             │ │ │
│                             │ │ │                                                              │ │ │
│                             │ │ │ PRO MODE SHOWS THE PROMPTS AND EDITABLES FROM FIRESTORE      │ │ │
│                             │ │ │                                                              │ │ │
│                             │ │ │                                                              │ │ │
│                             │ │ │                                                              │ │ │
│                             │ │ │                                                              │ │ │
│                             │ │ │                                                              │ │ │
│                             │ │ │                                                              │ │ │
│                             │ │ │                                                              │ │ │
│                             │ │ │                                                              │ │ │
│                             │ │ │                                                              │ │ │                             │ │ │                                                              │ │ │
│                             │ │ │                                                              │ │ │
│                             │ │ │                                                              │ │ │
│                             │ │ │                                                              │ │ │
│                             │ │ │                                                              │ │ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### When Editing a Prompt

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             ╭── MAIN CONTENT AREA ────────────────────────────────────────────╮ │
│                             │                                                                  │ │
│                             │ ╭─ PRO MODE WARNING ──────────────────────────────────────────╮ │ │
│                             │ │ ⚠️ You are in pro mode. You are about to edit a System     │ │ │
│                             │ │ prompt that will be sent to our AI model along with the    │ │ │
│                             │ │ review data. This means the model will follow whatever     │ │ │
│                             │ │ instruction you give (eg: Tone, voice, catch phrases, etc.)│ │ │
│                             │ ╰─────────────────────────────────────────────────────────────╯ │ │
│                             │                                                                  │ │
│                             │ ╭─ PROMPT EDITOR CARD ────────────────────────────────────────╮ │ │
│                             │ │ 💬 2 star no text 
│                             │ │ [1247 chars] [🔄Reset] [❌Cancel] [✅Save] │ │ │
│                             │ │ Last updated: 12/15/2024                                    │ │ │
│                             │ │                                                              │ │ │
│                             │ │ ┌─ LARGE TEXTAREA (min-height: 150px) ─────────────────────┐ │ │ │
│                             │ │ │ You are a professional customer service representative   │ │ │ │
│                             │ │ │ responding to negative reviews. Use a sincere,           │ │ │ │
│                             │ │ │ apologetic tone and focus on resolution. Address the    │ │ │ │
│                             │ │ │ customer's concerns directly and offer concrete steps   │ │ │ │
│                             │ │ │ to resolve their issues.                                 │ │ │ │
│                             │ │ │                                                          │ │ │ │
│                             │ │ │ When responding to {reviewerName}, acknowledge their    │ │ │ │
│                             │ │ │ specific feedback from {reviewText} and provide a       │ │ │ │
│                             │ │ │ thoughtful, personalized response that demonstrates     │ │ │ │
│                             │ │ │ you care about their experience and are committed      │ │ │ │
│                             │ │ │ to making things right.                                 │ │ │ │
│                             │ │ │                                                          │ │ │ │
│                             │ │ │ [Cursor here for editing]                               │ │ │ │
│                             │ │ │                                                          │ │ │ │
│                             │ │ │                                                          │ │ │ │
│                             │ │ │                                                          │ │ │ │
│                             │ │ └──────────────────────────────────────────────────────────┘ │ │ │
│                             │ │                                                              │ │ │
│                             │ │ 1247 characters. Use {reviewText} and {reviewerName}       │ │ │
│                             │ │ as placeholders.                                             │ │ │ │
│                             │ ╰──────────────────────────────────────────────────────────────╯ │ │
│                             ╰──────────────────────────────────────────────────────────────────╯ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Prompts Features
- **Three Categories**: Bad (1-2 star), Neutral (3 star), Good (4-5 star)
- **Live Editing**: Real-time character count, preview
- **State Management**: Unsaved changes tracking, bulk save
- **Template Variables**: `{reviewText}` and `{reviewerName}` placeholders
- **Pro Mode**: Warning about system prompt editing
- **Chrome Extension Sync**: Automatic synchronization

---

## 🔄 Navigation Flow

```
                    ┌─────────────────┐
                    │   Dashboard     │◄─────────┐
                    │   /dashboard    │          │
                    └─────────────────┘          │
                            │                    │
                   ┌────────┼────────┐          │
                   ▼        ▼        ▼          │
          ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
          │  Profile    │ │   Prompts   │ │  Sign Out   │
          │ /dashboard/ │ │ /dashboard/ │ │    Action   │
          │  profile    │ │   prompts   │ └─────────────┘
          └─────────────┘ └─────────────┘          │
                   │         │                     │
                   └─────────┼─────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Landing Page   │
                    │       /         │
                    └─────────────────┘
```

### Navigation Methods
1. **Sidebar Navigation**: Always visible on desktop, collapsible on mobile
2. **Active State Indicators**: Current page highlighted in sidebar
3. **Sign Out**: Returns to landing page
4. **Direct URL Access**: All routes accessible via direct links

---

## 🔐 Authentication States

### Loading State
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                            ⏳ Loading...                                    │
│                         [Spinner Animation]                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Unauthenticated Access
```
Any /dashboard/* URL
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│   Middleware    │────►│  Redirect to    │
│     Check       │     │   / │
                        └─────────────────┘
```

### Session Management
- **Session Provider**: firebase auth wraps entire app
- **Protected Routes**: ProtectedRoute component for client-side protection
- **Middleware**: Server-side route protection
- **Automatic Redirects**: Seamless auth flow

---

## 🎨 UI/UX Patterns

### Layout Structure
- **Responsive Design**: Mobile-first approach
- **Consistent Spacing**: Tailwind spacing scale
- **Card-Based Layout**: Information grouped in cards
- **Action-Oriented**: Clear CTAs and button hierarchies

### Interactive Elements
- **Loading States**: Spinners, disabled buttons during actions
- **Feedback**: Success/error alerts, toast notifications
- **Progressive Disclosure**: Expandable sections, modals
- **Keyboard Navigation**: Tab-friendly interface

### Visual Hierarchy
- **Typography Scale**: Hero → Section → Subsection → Body
- **Color System**: Primary blue, semantic colors, neutral grays
- **Iconography**: Lucide React icons throughout
- **Status Indicators**: Badges, progress bars, state icons

---

## 🔧 Technical Implementation

### Routing
- **App Router**: Next.js 13+ app directory structure
- **Layout Hierarchy**: Nested layouts for dashboard area
- **Dynamic Routes**: No dynamic segments in current implementation

### State Management
- **React Hooks**: useState, useEffect for local state
- **Custom Hooks**: usePrompts for prompt management
- **Session State**: Firebase session management


### Performance Considerations
- **Client-Side Navigation**: Next.js router for SPA-like experience
- **Optimistic Updates**: UI updates before API confirmation
- **Lazy Loading**: Component-level code splitting
- **Caching**: API response caching where appropriate

---

## 📱 Mobile Responsiveness

### Breakpoint Behavior
- **Mobile (< 768px)**: Collapsible sidebar, stacked layouts
- **Tablet (768px - 1024px)**: Adaptive grid layouts
- **Desktop (> 1024px)**: Full sidebar, multi-column layouts

### Mobile-Specific Features
- **Hamburger Menu**: Overlay sidebar on mobile
- **Touch-Friendly**: Larger tap targets
- **Responsive Typography**: Fluid text sizing
- **Optimized Forms**: Mobile-friendly input handling

---

## 🎯 User Goals & Success Metrics

### Primary User Goals
1. **Set Up Account**: Complete profile information
2. **Configure Prompts**: Customize AI response templates
3. **Install Extension**: Download and install Chrome extension
4. **Monitor Usage**: Track credits and review generation

### Success Indicators
- **Profile Completion**: All fields filled out
- **Prompt Customization**: At least one prompt modified
- **Extension Installation**: Chrome extension downloaded
- **Active Usage**: Regular review response generation

---

This user flow documentation provides a comprehensive view of the logged-in experience, from entry points through feature usage to navigation patterns. The ASCII diagrams illustrate the visual layout and user interaction patterns for each major screen in the application.