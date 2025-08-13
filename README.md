# Safety Games WebApp

A comprehensive web application for gamified safety training, designed to make workplace safety education more engaging, interactive, and effective through serious games and gamification elements.

## 🎯 Project Overview

Safety Games is a SaaS platform that combines realistic safety simulations with gamification features (points, badges, leaderboards) to transform traditional safety training into an engaging learning experience. The platform serves both individual learners and partner organizations looking to distribute safety training content.

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1** - Modern UI library with hooks
- **React Router DOM 6.28.0** - Client-side routing and navigation
- **Vite 7.1.2** - Fast build tool and development server
- **CSS3** - Custom styling with gradients and responsive design

### Development Tools
- **ESLint** - Code linting and quality assurance
- **Vite Plugin React** - Fast refresh and HMR support

### Design Features
- **Responsive Design** - Mobile-first approach with breakpoints
- **Modern UI/UX** - Card-based layouts with smooth animations
- **Brand Consistency** - Red gradient theme throughout
- **Accessibility** - Proper ARIA labels and keyboard navigation

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your system:
- **Node.js** (version 16.0 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Safety-Games-WebApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup and have the safety_saas mysql DB ready**

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## 📱 Features

### 🏠 Main Application
- **Home Page** - Landing page with work-in-progress content
- **About Page** - Comprehensive information about gamified safety training
- **Game Store** - Browse 16+ safety training games with responsive grid layout
- **Navigation** - Pill-style navigation with active states and gradient effects

### 🏢 Partner Dashboard
- **Partner Login** (`/partner/login`) - Secure authentication with form validation
- **Partner Registration** (`/partner/signup`) - Multi-step signup process
  - Step 1: Personal details (name, email, password)
  - Step 2: Company information (company name, address, city, country)
- **Distribution Dashboard** (`/partner/distribute`) - Partner management interface

### 🎮 Game Store Features
- **Featured Games Section** - Highlighted games with larger tiles
- **Scrollable Store Section** - Complete game catalog with custom scrollbar
- **Responsive Grid Layout** - Adapts from 5 columns (desktop) to 1 column (mobile)
- **4:3 Aspect Ratio Images** - Consistent landscape game covers
- **Interactive Tiles** - Hover effects with "Play Now" overlay buttons

### 🔐 Authentication & Validation
- **Form Validation** - Real-time validation with error highlighting
- **Error Tooltips** - User-friendly error messages with red styling
- **Multi-step Forms** - Progressive registration with step indicators
- **Responsive Forms** - Mobile-optimized input fields and layouts

## 🎨 Design System

### Color Palette
- **Primary Gradient**: Red to lighter red (`#dc2626` to `#ef4444`)
- **Background**: White to beige gradient (`#ffffff` to `#f5f1e8`)
- **Navigation**: Light blue-gray with backdrop blur
- **Text**: Dark grays for optimal readability

### Typography
- **Headings**: Bold weights with gradient text effects
- **Body Text**: Clean, readable fonts with proper contrast
- **Interactive Elements**: Consistent button styling with hover effects

### Layout
- **Responsive Breakpoints**: Mobile, tablet, desktop, and large screen support
- **Grid Systems**: CSS Grid for flexible, responsive layouts
- **Card Components**: Elevated cards with shadows and rounded corners

## 📁 Project Structure

```
Safety-Games-WebApp/
├── public/
│   ├── antiz-logo.png          # Company logo
│   ├── game-placeholder.svg    # Game tile placeholder image
│   └── vite.svg               # Vite logo
├── src/
│   ├── components/
│   │   ├── Navigation.jsx     # Main navigation component
│   │   └── Navigation.css     # Navigation styling
│   ├── pages/
│   │   ├── Home.jsx          # Landing page
│   │   ├── About.jsx         # About page with features
│   │   ├── About.css         # About page styling
│   │   ├── Store.jsx         # Game store with tiles
│   │   ├── Store.css         # Store page styling
│   │   ├── Partner.jsx       # Partner redirect page
│   │   ├── PartnerLogin.jsx  # Partner authentication
│   │   ├── PartnerLogin.css  # Login page styling
│   │   ├── PartnerSignup.jsx # Partner registration
│   │   ├── PartnerSignup.css # Signup page styling
│   │   ├── PartnerDistribute.jsx # Partner dashboard
│   │   └── PartnerDistribute.css # Dashboard styling
│   ├── App.jsx              # Main app component with routing
│   ├── App.css              # Global app styling
│   ├── index.css            # Global base styles
│   └── main.jsx             # App entry point
├── package.json             # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── eslint.config.js        # ESLint configuration
└── README.md               # This file
```

## 🌐 Routing Structure

```
/ → /home                    # Home page redirect
/home                        # Landing page
/about                       # About Safety Games
/store                       # Game catalog
/partner → /partner/login    # Partner redirect
/partner/login              # Partner authentication
/partner/signup             # Partner registration
/partner/distribute         # Partner dashboard
```

## 🔧 Future Enhancements

- **Backend Integration** - MySQL database for game data and user management
- **Authentication System** - JWT-based secure authentication
- **Game Integration** - Embedded game players and progress tracking
- **Analytics Dashboard** - Learning analytics and reporting
- **Payment Integration** - Subscription and licensing management
- **Multi-language Support** - Internationalization for global reach

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software developed for Antiz Technologies.

## 🏢 About Antiz Technologies

Safety Games is developed by Antiz Technologies, specializing in innovative safety training solutions that combine gaming technology with workplace safety education.

---

For questions or support, please contact the development team.
