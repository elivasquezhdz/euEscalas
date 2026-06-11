# Calculadoras VGI

Suite estática de escalas para la **Valoración Geriátrica Integral**. Sin backend, sin dependencias: HTML + CSS + JS puro. Lista para desplegar en **GitHub Pages**.

## Escalas incluidas

| Categoría     | Escala                                |
|---------------|----------------------------------------|
| Fragilidad    | FRAIL                                  |
| Ánimo         | Yesavage GDS-15 · Beck Ansiedad (BAI)  |
| Cognición     | CAM (delirium) · Mini-Mental (MMSE)    |
| Funcional     | Lawton-Brody · Barthel                 |
| Marcha        | Tinetti (POMA) · Downton               |
| Nutrición     | MNA cribado                            |
| Salud oral    | GOHAI                                  |
| Cuidador      | Zarit abreviada                        |
| Sueño         | Escala de Atenas de Insomnio           |

## Características

- Diseño responsivo (móvil / tablet / escritorio).
- Modo claro y oscuro.
- Cálculo de puntaje e interpretación en vivo.
- Persistencia automática en `localStorage`.
- Exportar/importar evaluaciones en JSON.
- Impresión / PDF amigable con vista limpia.
- Sin frameworks ni paquetes externos. Cero builds.

## Uso local

Por ser una webapp 100 % estática, basta con abrir `index.html` en cualquier navegador moderno. Si tu navegador bloquea recursos por `file://`, puedes servirla con:

```bash
python3 -m http.server 5180
# luego visita http://localhost:5180
```

## Despliegue en GitHub Pages

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta.
   ```bash
   git init
   git add .
   git commit -m "feat: webapp inicial de Calculadoras VGI"
   git branch -M main
   git remote add origin https://github.com/<usuario>/<repo>.git
   git push -u origin main
   ```
2. En GitHub: **Settings → Pages → Build and deployment**.
3. Source: **Deploy from a branch**, Branch: `main` / carpeta `/ (root)`.
4. Espera 1-2 minutos. Tu sitio estará en `https://<usuario>.github.io/<repo>/`.

> El archivo `.nojekyll` ya está incluido para evitar el procesamiento Jekyll.

## Estructura

```
.
├── index.html
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── scales.js   ← definición de cada escala
│       └── app.js      ← render, cálculo, persistencia
├── .nojekyll
└── README.md
```

## Aviso

Esta herramienta es de apoyo clínico y educativo. **No sustituye el juicio profesional**. Los puntos de corte se basan en versiones de referencia de cada escala; verificar con la guía vigente de tu institución.
