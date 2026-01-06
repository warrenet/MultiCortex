# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-01-06

### 🚀 Features
- **Neural Chat**: Implemented persistent AI chat with streaming responses and context awareness.
- **Tags System**: Added auto-extraction of `#hashtags`, live detection in capture, and filtering in Projects tab.
- **Safety Net**: Implemented "Soft Delete" (Trash) system with instant delete, undo, and restore functionality.
- **Quick Capture**: Built TacticalHUD with security redaction and instant ingest.
- **Save to Projects**: Added ability to bookmark/save AI responses directly to the projects library.

### 💅 UI/UX
- **Visual Overhaul**: Complete redesign using Zinc/Cyan/Emerald tactical color scheme.
- **New Components**: Created reusable `PageHeader`, `SectionTitle`, `EmptyState`, `ActionCard`, and `FloatingHelpButton`.
- **Onboarding**: Added comprehensive tour and "First Run" wizard.
- **Feedback**: Implemented `sonner-native` for beautiful toast notifications.

### 🛡️ Security
- **Data Sanitization**: Added `SecurityService` to redact API keys from inputs.
- **Import Validation**: strict schema validation for importing project backups.
- **API Safety**: Implemented request timeouts and context limiting to prevent API abuse/hanging.

### 🏗️ Architecture
- **State Management**: Migrated to Zustand with `persist` middleware.
- **Storage**: Implemented `UniversalStorageAdapter` for cross-platform data persistence.
- **TypeScript**: Full strict typing for all stores, services, and components.
