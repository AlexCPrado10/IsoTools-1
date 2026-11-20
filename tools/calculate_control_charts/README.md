# calculate_control_charts

- Backend: `src/tools/calculate_control_charts.js`
- Frontend: `frontend/index.html`
- Dockerfile: `Docker/Dockerfile`
- Railway: `RAILWAY_DOCKERFILE_PATH=tools/calculate_control_charts/Docker/Dockerfile`

En `/` se capturan planta, característica, tipo de carta, subgrupo y mediciones.
El panel muestra UCL/CL/LCL, puntos fuera de control, gráfica y cadena causal.
Las ejecuciones manuales generan eventos sintéticos `ENS-*` en el Core; consulta
`DEPLOYMENT.md` para requisitos de sesión y API key.
