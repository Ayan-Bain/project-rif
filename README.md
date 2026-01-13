# Project-RIF: Smart Subscription Manager

Project-RIF is a modern mobile application built with **React Native** and **Expo** designed to help users track and manage digital subscriptions. It features automated brand metadata fetching, secure cloud synchronization, and smart renewal notifications.

## ✨ Features

- **Automated Brand Discovery**: Automatically fetches high-quality brand logos and categories via the **Brandfetch API**.
- **Universal Logo Support**: A custom `UniversalLogoHandler` component that seamlessly renders both **SVG** and **PNG** assets.
- **Cloud Synchronization**: Optional **Firebase** integration allowing users to backup and sync their data across multiple devices.
- **Smart Notifications**: Automatically schedules push reminders for upcoming renewals based on custom cycles (Weekly, Monthly, Yearly) via `expo-notifications`.
- **Offline-First Architecture**: Utilizes **AsyncStorage** for persistent local data access, ensuring speed and reliability even without internet.
- **Dynamic Theming**: Fully integrated Light, Dark, and System appearance modes.

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) / React Native
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **Graphics**: [react-native-svg](https://github.com/software-mansion/react-native-svg) for vector rendering
- **Storage**: [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/)

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Expo Go app (for rapid development)
- Java JDK 17 & Android Studio (required for local `.apk` builds)

### Installation
1. **Clone the repository**:
   ```bash
   git clone [https://github.com/Ayan-Bain/project-rif.git](https://github.com/Ayan-Bain/project-rif.git)
   cd Project-rif
   #Add .env file and populate it
   npx expo run:android
