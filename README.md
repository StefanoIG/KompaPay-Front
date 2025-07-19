# 💰 KompaPay - Gestión Inteligente de Gastos Compartidos

KompaPay es una aplicación móvil y web innovadora que revoluciona la forma en que las personas gestionan gastos compartidos. Con funcionalidades offline-first, resolución automática de conflictos y sincronización en tiempo real, KompaPay hace que dividir gastos sea tan fácil como respirar.

## 🌟 Características Principales

### 🔥 Funcionalidades Core
- **🏠 Grupos Inteligentes**: Crea y gestiona múltiples grupos (familia, amigos, roommates, viajes)
- **💳 División Automática**: Divide gastos equitativamente, por porcentajes o cantidades personalizadas
- **🔄 Sincronización Offline-First**: Funciona perfectamente sin internet, sincroniza automáticamente
- **⚡ Resolución de Conflictos**: Sistema inteligente que maneja discrepancias automáticamente
- **📱 Multi-plataforma**: Disponible en iOS, Android y Web con experiencia nativa

### 🎨 Experiencia de Usuario
- **🌈 Diseño Moderno**: Interfaz limpia con animaciones fluidas y gradientes atractivos
- **🎯 Intuitividad**: UX optimizada para máxima simplicidad y eficiencia
- **🌙 Tema Adaptativo**: Soporte para modo claro y oscuro
- **📊 Visualización Rica**: Gráficos y estadísticas en tiempo real
- **🔔 Notificaciones Smart**: Alertas contextuales y no intrusivas

### 🛡️ Seguridad y Confiabilidad
- **🔐 Encriptación End-to-End**: Todos los datos protegidos con encriptación de 256 bits
- **☁️ Backup Automático**: Respaldo seguro en la nube
- **⚡ Alta Disponibilidad**: 99.9% de tiempo activo garantizado
- **🔄 Recuperación Automática**: Sistema resiliente ante fallos

## 🏗️ Arquitectura Técnica

### Frontend (React Native + Expo)
```
📁 app/
├── 🏠 index.tsx              # Landing page animada
├── 📱 (tabs)/                # Navegación principal
│   ├── index.tsx             # Dashboard principal
│   └── explore.tsx           # Funcionalidades y demos
├── 🔐 (auth)/               # Autenticación
└── 🌐 (web)/                # Versión web específica

📁 components/
├── 🎨 ui/                    # Componentes UI reutilizables
│   ├── AnimatedComponents.tsx # Animaciones custom
│   ├── LoadingButton.tsx     # Botones con estados
│   └── IconSymbol.tsx        # Iconografía consistente
└── 📱 screens/               # Pantallas principales
    ├── AuthScreen.tsx        # Login/Registro
    └── HomeScreen.tsx        # Dashboard principal

📁 hooks/                     # Lógica de negocio
├── 🔗 useAPI.ts             # Cliente HTTP con interceptors
├── 👤 useAuth.ts            # Gestión de autenticación
├── 👥 useGroups.ts          # Operaciones de grupos
├── 💰 useExpenses.ts        # Gestión de gastos
├── 🔄 useSync.ts            # Sincronización offline
└── 📊 types.ts              # Tipado TypeScript

📁 constants/
├── 🎨 Styles.ts             # Sistema de diseño
└── ⚙️ Colors.ts             # Paleta de colores

📁 utils/
└── 🔧 formatters.ts         # Utilidades de formato
```

### Backend (Laravel - Separado)
- **🐘 PHP 8.2** con Laravel 10
- **🗄️ PostgreSQL** para persistencia principal
- **📮 Redis** para cache y colas
- **🔄 WebSockets** para sincronización en tiempo real
- **📊 API REST** con documentación OpenAPI

## 🚀 Instalación y Desarrollo

### Prerrequisitos
```bash
📋 Node.js 18+ 
📱 Expo CLI
🔧 Git
📱 Simulador iOS/Android (opcional)
```

### Setup Rápido
```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/KompaPay-Front.git
cd KompaPay-Front

# 2. Instalar dependencias
npm install

# 3. Iniciar en desarrollo
npm start

# 4. Ejecutar en plataformas específicas
npm run ios      # iOS Simulator
npm run android  # Android Emulator  
npm run web      # Navegador web
```

### Variables de Entorno
```bash
# 📁 .env.local
EXPO_PUBLIC_API_URL=http://localhost:8000/api
EXPO_PUBLIC_WS_URL=ws://localhost:6001
EXPO_PUBLIC_ENV=development
```

## 🎯 Scripts Disponibles

```bash
npm start          # 🚀 Inicia Expo development server
npm run reset      # 🔄 Resetea el proyecto a estado inicial
npm run lint       # 🔍 Ejecuta ESLint
npm run type-check # ✅ Verifica tipos TypeScript
npm run build      # 📦 Construye para producción
npm run preview    # 👀 Preview de build de producción
```

## 🧪 Testing

```bash
npm run test              # 🧪 Ejecuta tests unitarios
npm run test:watch        # 👀 Tests en modo watch
npm run test:coverage     # 📊 Coverage report
npm run test:e2e          # 🔄 Tests end-to-end
```

## 📱 Funcionalidades por Plataforma

| Funcionalidad | iOS | Android | Web |
|---------------|-----|---------|-----|
| ✅ Autenticación | ✅ | ✅ | ✅ |
| 👥 Gestión de Grupos | ✅ | ✅ | ✅ |
| 💰 Registro de Gastos | ✅ | ✅ | ✅ |
| 🔄 Sincronización Offline | ✅ | ✅ | ⚠️ |
| 📊 Dashboard Avanzado | ✅ | ✅ | ✅ |
| 🔔 Push Notifications | ✅ | ✅ | ⚠️ |
| 📤 Compartir | ✅ | ✅ | ✅ |
| 🎨 Animaciones Nativas | ✅ | ✅ | 🌐 |

## 🔧 Tecnologías Utilizadas

### Core
- **⚛️ React Native 0.79** - Framework principal
- **🚀 Expo 53** - Plataforma de desarrollo
- **📱 Expo Router 5** - Navegación file-based
- **🎨 React Native Reanimated 3** - Animaciones de alto rendimiento

### UI/UX
- **🌈 Expo Linear Gradient** - Gradientes nativos
- **✨ Expo Blur** - Efectos de blur
- **🎭 React Native SVG** - Gráficos vectoriales
- **📱 Expo Symbols** - Iconografía iOS

### Estado y Datos
- **💾 AsyncStorage** - Persistencia local
- **🔄 Custom Hooks** - Gestión de estado
- **📡 Fetch API** - Cliente HTTP
- **🔐 JWT** - Autenticación

### Desarrollo
- **📘 TypeScript** - Tipado estático
- **🔍 ESLint** - Linting
- **🎨 Prettier** - Code formatting
- **🧪 Jest** - Testing framework

## 🌟 Casos de Uso

### 👨‍👩‍👧‍👦 Familias
- Gastos del hogar compartidos
- Compras del supermercado
- Servicios y utilidades
- Gastos de los niños

### 🏠 Roommates
- Alquiler y servicios
- Compras de casa
- Gastos de limpieza
- Internet y streaming

### ✈️ Viajes en Grupo
- Alojamiento compartido
- Transporte
- Comidas y actividades
- Compras grupales

### 👥 Amigos
- Salidas y restaurants
- Regalos grupales
- Eventos y fiestas
- Actividades recreativas

## 🔮 Roadmap

### 🎯 Próximas Funcionalidades
- [ ] 📊 **Dashboard Avanzado** con gráficos interactivos
- [ ] 🤖 **IA para Categorización** automática de gastos
- [ ] 💳 **Integración Bancaria** para importar transacciones
- [ ] 📱 **Widget para Home Screen** con balance rápido
- [ ] 🌍 **Soporte Multi-idioma** (EN, ES, PT, FR)
- [ ] 💰 **Multi-moneda** con conversión automática
- [ ] 📈 **Analytics Avanzado** y reportes personalizados
- [ ] 🔗 **Integración con Apps** de delivery y transporte

### 🚀 Versión 2.0
- [ ] 🎮 **Gamificación** del ahorro grupal
- [ ] 🏪 **Marketplace** de descuentos grupales
- [ ] 📅 **Gastos Recurrentes** automatizados
- [ ] 🤝 **Préstamos entre Usuarios** con tracking
- [ ] 📊 **Business Intelligence** para grupos grandes

## 🤝 Contribución

¡Contribuciones son bienvenidas! Por favor lee nuestra [guía de contribución](CONTRIBUTING.md) para más detalles.

### Proceso de Contribución
1. 🍴 Fork el proyecto
2. 🌿 Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push a la branch (`git push origin feature/AmazingFeature`)
5. 🔄 Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **🎨 Frontend Lead** - [@tu-usuario](https://github.com/tu-usuario)
- **⚙️ Backend Lead** - [@backend-dev](https://github.com/backend-dev)
- **🎨 UI/UX Designer** - [@designer](https://github.com/designer)

## 📞 Soporte

- 📧 **Email**: soporte@kompapay.com
- 💬 **Discord**: [Únete a nuestro servidor](https://discord.gg/kompapay)
- 📚 **Documentación**: [docs.kompapay.com](https://docs.kompapay.com)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/tu-usuario/KompaPay-Front/issues)

## 🙏 Agradecimientos

- 💙 **Expo Team** por la increíble plataforma
- ⚛️ **React Native Community** por las herramientas
- 🎨 **Design Inspiration** de Dribbble y Behance
- 👥 **Beta Testers** por su valioso feedback

---

<div align="center">

**¿Te gusta KompaPay? ¡Dale una ⭐ en GitHub!**

[🌐 Website](https://kompapay.com) • [📱 Download iOS](https://apps.apple.com) • [📱 Download Android](https://play.google.com) • [💬 Community](https://discord.gg/kompapay)

</div>