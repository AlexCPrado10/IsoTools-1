# generate_kpis

- Backend: `src/tools/generate_kpis.js`
- Frontend: `frontend/index.html`
- Dockerfile: `Docker/Dockerfile`
- Railway: `RAILWAY_DOCKERFILE_PATH=tools/generate_kpis/Docker/Dockerfile`

En `/` se seleccionan planta, periodo y variación sintética. El reporte muestra
las tarjetas KPI generadas por el handler y su cadena causal. Las ejecuciones
manuales generan eventos sintéticos `ENS-*` en el Core; consulta
`DEPLOYMENT.md` para requisitos de sesión y API key.
