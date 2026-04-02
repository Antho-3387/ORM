# 🎨 Guide de Personnalisation du Design

> Comment customiser le design EDHREC-inspired selon vos préférences

---

## 📋 Table des matières
1. [Modifier les couleurs](#couleurs)
2. [Changer les fonts](#fonts)
3. [Personnaliser les animations](#animations)
4. [Ajouter de nouveaux composants](#composants)
5. [Thème alternatif](#themes)

---

## 🎨 Couleurs {#couleurs}

### Fichier de configuration: `globals.css`

Las couleurs sont définies comme variables CSS:

```css
:root {
  /* Couleur primaire: change partout */
  --primary: #7c3aed;           /* Purple -> change à votre couleur */
  --primary-light: #a78bfa;
  --primary-dark: #5b21b6;
  
  /* Backgrounds */
  --bg-primary: #0f172a;         /* Dark slate le plus sombre */
  --bg-secondary: #1e293b;       /* Medium dark */
  --bg-tertiary: #334155;        /* Light dark */
}
```

### Exemples de personnalisation:

**Theme Bleu (à la place de Purple):**
```css
:root {
  --primary: #3b82f6;           /* Blue */
  --primary-light: #60a5fa;
  --primary-dark: #1e40af;
}
```

**Theme Vert:**
```css
:root {
  --primary: #10b981;           /* Green */
  --primary-light: #6ee7b7;
  --primary-dark: #047857;
}
```

**Theme Rouge (MTG themed):**
```css
:root {
  --primary: #ef4444;           /* Red */
  --primary-light: #f87171;
  --primary-dark: #991b1b;
}
```

### Utilisation dans les composants:

```tsx
// Dans CardImage.tsx: modifier les badges
<div className="bg-purple-600">  {/* CHANGE: purple-600 à votre teinte */}
  {manaValue}
</div>
```

---

## 🔤 Fonts {#fonts}

### Configuration dans `layout.tsx`:

```tsx
import { Geist, Geist_Mono, Poppins } from 'next/font/google'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '600', '700']
})

export default function RootLayout({ children }) {
  return (
    <html className={poppins.variable}>
      {children}
    </html>
  )
}
```

### Ajouter fonts alternatives:

```tsx
// Inter pour un look moderne
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

// Ou Roboto pour un look plus corporate
import { Roboto } from 'next/font/google'
const roboto = Roboto({ weight: ['400', '700'] })
```

### Within Tailwind CSS:
```css
body {
  font-family: var(--font-poppins), system-ui, sans-serif;
}

code {
  font-family: var(--font-geist-mono), monospace;
}
```

---

## ⚡ Animations {#animations}

### Modifier la vitesse des transitions:

**Dans `globals.css`:**
```css
/* Tous les transitions utilise 200ms par défaut */
/* Modifier ceci pour changer globalement */

:root {
  --transition-fast: 100ms;
  --transition-normal: 200ms;
  --transition-slow: 300ms;
}
```

**Dans les composants:**
```tsx
// Rapide
className="transition-all duration-100"

// Normal (défaut)
className="transition-colors"

// Lent
className="transition-all duration-300"
```

### Exemples d'animations personnalisées:

**Glow effect:**
```tsx
<div className="bg-purple-600 hover:shadow-lg hover:shadow-purple-500/80 transition-shadow">
  {/* Augmente l'intensité du shadow */}
</div>
```

**Scale effect:**
```tsx
<button className="scale-100 hover:scale-110 transition-transform">
  Hover me
</button>
```

**Gradient animation:**
```css
@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.gradient-animate {
  background: linear-gradient(-45deg, #7c3aed, #3b82f6, #7c3aed);
  background-size: 400% 400%;
  animation: gradientFlow 3s ease infinite;
}
```

---

## 🧩 Ajouter des composants {#composants}

### Template pour un nouveau composant:

```tsx
// components/MyComponent.tsx

interface MyComponentProps {
  title: string
  children?: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export function MyComponent({ 
  title, 
  children, 
  variant = 'primary' 
}: MyComponentProps) {
  
  const variantClass = {
    primary: 'bg-purple-600 text-white',
    secondary: 'bg-slate-800 text-slate-200'
  }[variant]
  
  return (
    <div className={`p-4 rounded-lg ${variantClass}`}>
      <h3 className="font-semibold mb-2">{title}</h3>
      {children}
    </div>
  )
}
```

### Intégration dans une page:

```tsx
import { MyComponent } from '@/components/MyComponent'

export default function Page() {
  return (
    <MyComponent title="Hello" variant="secondary">
      <p>Contenu personnalisé</p>
    </MyComponent>
  )
}
```

---

## 🎭 Thèmes alternatifs {#themes}

### Theme Light Mode:

**Créer: `globals-light.css`**
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #ebebeb;
  
  --text-primary: #1f2937;
  --text-secondary: #4b5563;
  --text-muted: #9ca3af;
}
```

### Theme High Contrast:

```css
:root {
  --primary: #ffff00;           /* Yellow for contrast */
  --primary-dark: #000000;
  
  --bg-primary: #000000;         /* Pure black */
  --text-primary: #ffffff;       /* Pure white */
}
```

### Toggle entre thèmes:

```tsx
'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState('dark')
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
```

**Update `globals.css`:**
```css
:root[data-theme="light"] {
  --bg-primary: #ffffff;
  /* ... light colors */
}

:root[data-theme="dark"] {
  --bg-primary: #0f172a;
  /* ... dark colors */
}
```

---

## 🎯 Exemples Rapides

### Change Primary Color (1 ligne):

**Before:**
```tsx
<button className="bg-purple-600">
```

**After (Green):**
```tsx
<button className="bg-green-600">
```

### Augmenter Border Radius:

```tsx
// Compact
className="rounded-lg"  /* 8px */

// Medium
className="rounded-xl"  /* 12px */

// Large (rounded)
className="rounded-2xl" /* 16px */
```

### Ajuster Spacing:

```tsx
// Compact
className="p-2 gap-2"

// Normal
className="p-4 gap-4"

// Spacious
className="p-6 gap-6"
```

---

## 📦 Assets & Images

### Ajouter un logo personnalisé:

**Dans `components/Navbar.tsx`:**
```tsx
<Link href="/">
  <Image
    src="/logo.png"           {/* Ajouter logo dans public/ */}
    alt="Logo"
    width={32}
    height={32}
  />
  <span>My App</span>
</Link>
```

### Backgrounds personnalisés:

```tsx
// Section avec background image
<section 
  className="p-12 rounded-lg"
  style={{
    backgroundImage: 'url(/bg-pattern.png)',
    backgroundSize: 'cover'
  }}
>
  Content...
</section>
```

---

## 🎓 Ressources

- [Tailwind Color Palette](https://tailwindcss.com/docs/customization/colors)
- [Google Fonts](https://fonts.google.com)
- [Color Picker Tools](https://coolors.co)
- [CSS Gradient Generator](https://cssgradient.io)

---

**Bon design! 🎨**
