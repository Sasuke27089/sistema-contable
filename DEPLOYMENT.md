# Guía de Despliegue - Sistema Contable

## Opciones de Despliegue

### Opción 1: Vercel (Recomendado - Gratis para Node.js)

**Ventajas:**
- Gratis con dominio subdominio (ej. sistema-contable.vercel.app)
- Soporte nativo para Node.js/Express
- Despliegue automático desde GitHub
- HTTPS incluido
- Base de datos SQLite soportada
- Muy rápido y confiable

**Pasos:**
1. Crea cuenta en https://vercel.com
2. Conecta tu repositorio GitHub
3. Configura variables de entorno (.env)
4. Click en "Deploy"
5. Accede a tu dominio

**Agregar dominio personalizado:**
- Compra un dominio en Namecheap, GoDaddy o similar (~$10-15/año)
- En Vercel: Settings → Domains → Agregar tu dominio
- Configura DNS records según instrucciones de Vercel
- ¡Listo! Tu-dominio.com apunta a tu app

---

### Opción 2: Railway (Alternativa - Muy buena)

**Ventajas:**
- Gratis con créditos iniciales ($5/mes)
- Muy fácil de usar
- Soporte para Node.js + SQLite
- Despliegue automático desde GitHub
- Dominio gratis incluido

**Pasos:**
1. Crea cuenta en https://railway.app
2. Conecta GitHub
3. Selecciona el repositorio
4. Railway detecta Node.js automáticamente
5. Deploy instant

**Costo aproximado:** $5-10/mes con dominio personalizado

---

### Opción 3: Render (Alternativa)

**Ventajas:**
- Gratis con limitaciones (duerme después de 15 min inactividad)
- Pago: desde $7/mes
- Fácil integración con GitHub
- Soporte Node.js

**Pasos similares a Railway**

---

### Opción 4: DigitalOcean (VPS - Más Control)

**Ventajas:**
- Control total del servidor
- Mejor para aplicaciones de producción pesadas
- Escalable
- Más configuración manual

**Costo:** $5-6/mes (droplet básico)

**Pasos:**
1. Crea cuenta en https://digitalocean.com
2. Crea un "Droplet" (Ubuntu 22.04)
3. SSH al servidor
4. Instala Node.js, npm, SQLite
5. Clona tu repo
6. Configura PM2 para mantener la app viva
7. Configura Nginx como reverse proxy
8. Agrega dominio personalizado

---

### Opción 5: Heroku (Antes era gratis, ahora pago)

**Costo:** $7/mes (mínimo)
- Ya no tiene plan gratuito
- Alternativas mejores disponibles

---

## Recomendación para ti: **Vercel + Dominio Personalizado**

### Paso a paso completo:

#### 1️⃣ Preparar el proyecto para Vercel

Crea archivo `vercel.json` en la raíz:

```json
{
  "buildCommand": "npm install",
  "devCommand": "npm start",
  "outputDirectory": ".",
  "framework": "express",
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 2️⃣ Actualizar `index.js` para producción

En tu `index.js`, cambia:

```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
```

#### 3️⃣ Desplegar en Vercel

```bash
# Instalar CLI de Vercel
npm i -g vercel

# Desplegar (en la raíz del proyecto)
vercel
# Sigue las instrucciones interactivas
```

#### 4️⃣ Comprar dominio

Opciones económicas:
- **Namecheap**: ~$10.88/año (dominio .com)
- **GoDaddy**: ~$14.99/año (primer año)
- **Porkbun**: ~$11.52/año (muy buena opción)

#### 5️⃣ Conectar dominio en Vercel

1. Ve a Vercel Dashboard → Settings → Domains
2. Agrega tu dominio personalizado
3. Copia los DNS records que Vercel te da
4. En Namecheap/GoDaddy: 
   - Entra a Domain Management
   - Custom DNS
   - Reemplaza con los records de Vercel
5. Espera 24-48h para que se propague el DNS

#### 6️⃣ (Opcional) Certificado SSL

Vercel lo maneja automáticamente ✓

---

## Comparativa rápida:

| Plataforma | Costo | Facilidad | Control | Node.js |
|-----------|-------|-----------|---------|---------|
| **Vercel** | Gratis* | ⭐⭐⭐⭐⭐ | Alto | ✅ |
| **Railway** | $5-10/mes | ⭐⭐⭐⭐⭐ | Alto | ✅ |
| **Render** | $7/mes+ | ⭐⭐⭐⭐ | Alto | ✅ |
| **DigitalOcean** | $5-6/mes | ⭐⭐⭐ | Total | ✅ |
| **Heroku** | $7/mes+ | ⭐⭐⭐⭐ | Medio | ✅ |

*Vercel: Gratis con subdominio, pago personalizado

---

## Posibles problemas y soluciones

### SQLite en producción
- **Problema**: SQLite en servidores sin persistencia de archivos no funciona bien
- **Solución**: 
  - Vercel: Soporta SQLite con persistencia
  - Alternativa: Migrar a PostgreSQL (Railway ofrece gratis)

### Variables de entorno
- Configúralas en el panel de la plataforma (nunca en .env en producción)
- Ejemplo Vercel: Settings → Environment Variables

### Base de datos persistente
- En Vercel: Los archivos sqlite3 se guardan automáticamente
- En DigitalOcean: Tienes control total

---

## Mi recomendación personal:

**Para empezar:** **Vercel**
- ✅ Gratis con dominio gratuito
- ✅ Deploy automático desde GitHub
- ✅ HTTPS automático
- ✅ Soporte excelente
- ✅ Muy rápido
- ✅ Perfecto para tu caso de uso

**Si necesitas más control:** **DigitalOcean App Platform o VPS**
- Más caro pero más flexible
- Mejor para aplicaciones de producción críticas

---

## Próximos pasos:

1. Elige plataforma (recomiendo **Vercel**)
2. Crea cuenta
3. Conecta GitHub
4. Despliega
5. Compra dominio
6. Configura DNS
7. ¡Listo!

¿Necesitas ayuda configurando alguna plataforma específica?
