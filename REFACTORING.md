# Arquitectura Refactorizada de KompaPay

## 📁 Estructura de Archivos

### `/styles/` - Estilos organizados por sección
```
styles/
├── index.ts          # Exportaciones centralizadas
├── auth.styles.ts    # Estilos para autenticación
├── tabs.styles.ts    # Estilos para navegación por tabs
└── explore.styles.ts # Estilos para la pantalla explore
```

### `/hooks/` - Lógica de negocio separada
```
hooks/
├── index.ts          # Exportaciones centralizadas
├── useValidation.ts  # Validaciones de formularios
├── useUI.ts          # Lógica de interfaz de usuario
├── useUtilities.ts   # Utilidades generales
├── useAuth.ts        # Autenticación (existente)
├── useGroups.ts      # Gestión de grupos (existente)
├── useExpenses.ts    # Gestión de gastos (existente)
└── types.ts          # Tipos TypeScript (existente)
```

### `/app/` - Componentes refactorizados
```
app/
├── (auth)/
│   ├── login_new.tsx     # Login refactorizado
│   └── register.tsx      # Registro (pendiente refactorizar)
└── (tabs)/
    ├── dashboard_refactored.tsx  # Dashboard refactorizado
    └── explore_refactored.tsx    # Explore refactorizado
```

## 🎨 Sistema de Estilos

### Principios de Organización
1. **Separación por sección**: Cada área de la app tiene su archivo de estilos
2. **Reutilización**: Estilos comunes en `/constants/Styles.ts`
3. **Exportación centralizada**: Importar desde `/styles/index.ts`

### Uso de Estilos
```typescript
// ✅ Correcto - Importar estilos específicos
import { authStyles } from '@/styles/auth.styles';
import { tabsStyles } from '@/styles/tabs.styles';

// ✅ También correcto - Importar desde índice
import { authStyles, tabsStyles } from '@/styles';
```

## 🔧 Hooks de Validación

### `useFormValidation`
Manejo completo de formularios con validación en tiempo real:

```typescript
const {
  fields,
  setFieldValue,
  validateForm,
  getFieldProps,
  hasErrors
} = useFormValidation({ email: '', password: '' });

// Validar campo
setFieldValue('email', value, {
  required: true,
  email: true
});

// Validar formulario completo
const isValid = validateForm({
  email: { required: true, email: true },
  password: { required: true, minLength: 8 }
});
```

### `useAuthValidation`
Validaciones específicas para autenticación:

```typescript
const { validateLoginForm, validateRegistrationForm } = useAuthValidation();

const error = validateLoginForm(email, password);
if (error) {
  showValidationAlert(error);
}
```

## 🎯 Hooks de UI

### `useDashboardUI`
Gestión completa del estado de la interfaz del dashboard:

```typescript
const {
  activeTab,
  switchTab,
  showCreateGroup,
  openCreateGroupModal,
  validateGroupForm,
  formatCurrency
} = useDashboardUI();
```

### `useExploreUI`
Manejo del estado para la pantalla de exploración:

```typescript
const {
  selectedDemo,
  demos,
  handleDemoSelection,
  startDemo
} = useExploreUI();
```

## 🔨 Hooks de Utilidades

### `useUtilities`
Funciones utilitarias comunes:

```typescript
const {
  formatCurrency,
  formatDate,
  validateEmail,
  generateGroupCode,
  shareContent
} = useUtilities();
```

## 📱 Componentes Refactorizados

### Principios de los Componentes
1. **Solo JSX y llamadas a hooks**: No lógica de negocio en componentes
2. **Estilos importados**: No StyleSheet inline
3. **Validación en hooks**: Toda validación movida a hooks específicos

### Ejemplo de Componente Refactorizado
```typescript
// ✅ Componente limpio
export default function LoginScreen() {
  const { validateLoginForm } = useAuthValidation();
  const { login } = useAuth();
  
  const handleLogin = async () => {
    const error = validateLoginForm(email, password);
    if (error) return;
    
    await login({ email, password });
  };

  return (
    <View style={authStyles.container}>
      {/* Solo JSX aquí */}
    </View>
  );
}
```

## 📋 Archivos Eliminados

### Archivos obsoletos removidos:
- `app/index_new.tsx`
- `app/(tabs)/index_new.tsx`
- `app/(tabs)/explore_new.tsx`
- `app/(app)/index.tsx`
- `app/(web)/index.tsx`

## 🚀 Cómo Usar la Nueva Arquitectura

### 1. Para crear un nuevo componente:
```typescript
// 1. Crear estilos en /styles/seccion.styles.ts
export const miSeccionStyles = StyleSheet.create({
  container: { ... }
});

// 2. Crear hook de UI si necesario en /hooks/useUI.ts
export const useMiSeccionUI = () => {
  // Lógica de estado y UI
};

// 3. Crear componente limpio
import { miSeccionStyles } from '@/styles';
import { useMiSeccionUI } from '@/hooks';

export default function MiComponente() {
  const { estado, accion } = useMiSeccionUI();
  
  return (
    <View style={miSeccionStyles.container}>
      {/* Solo JSX */}
    </View>
  );
}
```

### 2. Para agregar validaciones:
```typescript
// Agregar a /hooks/useValidation.ts
export const useMiValidacion = () => {
  const validarCampo = (valor: string) => {
    // Lógica de validación
  };
  
  return { validarCampo };
};
```

### 3. Para agregar utilidades:
```typescript
// Agregar a /hooks/useUtilities.ts
const nuevaUtilidad = useCallback(() => {
  // Lógica utilitaria
}, []);

return {
  // ... otras utilidades
  nuevaUtilidad
};
```

## ✅ Beneficios de la Refactorización

1. **Separación de responsabilidades**: Estilos, lógica y UI separados
2. **Reutilización**: Hooks y estilos compartibles entre componentes
3. **Mantenibilidad**: Código más fácil de mantener y debuggear
4. **Testabilidad**: Hooks pueden ser testeados independientemente
5. **Escalabilidad**: Estructura clara para agregar nuevas funcionalidades

## 🔄 Migración de Componentes Existentes

Para migrar un componente existente:

1. **Extraer estilos** a archivo correspondiente en `/styles/`
2. **Extraer lógica** a hooks en `/hooks/`
3. **Extraer validaciones** a `useValidation.ts`
4. **Limpiar componente** dejando solo JSX y llamadas a hooks
5. **Eliminar archivo original** después de verificar funcionamiento

## 📝 Próximos Pasos

1. ✅ Refactorizar login screen
2. ✅ Refactorizar dashboard
3. ✅ Refactorizar explore screen
4. ⏳ Refactorizar register screen
5. ⏳ Refactorizar componentes restantes
6. ⏳ Migrar todos los archivos a la nueva estructura
