const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración para web con proxy para evitar CORS
if (process.env.EXPO_TARGET === 'web') {
  config.server = {
    ...config.server,
    enhanceMiddleware: (middleware, server) => {
      return (req, res, next) => {
        // Agregar headers CORS para todas las peticiones
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Manejar preflight requests
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
          return;
        }
        
        return middleware(req, res, next);
      };
    },
  };
}

module.exports = config;
