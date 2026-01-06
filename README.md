# MultiCortex 🧠

**Tactical Second Brain** built with Expo, React Native, and AI.

MultiCortex is a local-first, privacy-focused application designed to capture, organize, and crystallize your thoughts using advanced AI. It acts as a "second brain" that travels with you, offering instant capture, intelligent tagging, and persistent memory.

## 🚀 Key Features

### ⚡ Quick Capture
- **Instant Ingest**: Capture text, ideas, and notes immediately.
- **Auto-Redaction**: Automatically detects and strips sensitive API keys (OpenAI, Anthropic, etc.) for security.
- **Formatting**: Supports markdown and rich text structure.

### 🏷️ Intelligent Tagging
- **Auto-Extraction**: Type `#hashtags` in your content to automatically tag items.
- **Live Feedback**: See tags appear instantly as you type.
- **Smart Filtering**: Filter your entire library by tapping tags in the Projects view.

### 🧠 Neural Chat
- **Persistent Memory**: Chat history is saved locally and persists across sessions.
- **Context-Aware**: The AI agent has access to your 10 most recent captures to provide relevant answers.
- **Save to Projects**: Bookmark any AI response to save it permanently to your library.

### 🛡️ Safety Net (Soft Delete)
- **Instant Actions**: Delete items instantly without annoying confirmation popups.
- **Trash Can**: Deleted items move to a Trash folder where they can be restored or permanently purged.
- **Undo**: Every destructive action has an immediate "Undo" option.

### 📂 Project Management
- **Search**: Full-text search across all your captures.
- **Organization**: Group by tags, source (chat vs capture), and date.
- **Export/Import**: Full JSON export/import for data portability.

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev) (React Native) -> Web, iOS, Android
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for Native)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with persistent storage
- **Icons**: [Lucide React Native](https://lucide.dev)
- **AI**: OpenRouter API (Access to GPT-4, Claude 3, etc.)

## 🏁 Get Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the App**
   ```bash
   npx expo start
   ```
   - Press `w` for Web
   - Scan QR code for iOS/Android (Expo Go)

3. **Configure AI**
   - Go to **Settings** tab.
   - Enter your [OpenRouter](https://openrouter.ai) API key.
   - Your key is stored securely in local storage.

## 🔒 Privacy & Security

- **Local First**: All data is stored on your device (LocalStorage / Async Storage).
- **Key Redaction**: The app actively sanitizes input to prevent accidental pasting of secrets.
- **No Tracking**: No analytics or tracking scripts are included.

## 🤝 Contributing

This is a personal tool designed for high-velocity operators. Pull requests are welcome for tactical improvements.

## 📄 License

MIT
