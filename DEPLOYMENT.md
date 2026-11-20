# Despliegue de las tres tools

Cada servicio Railway usa el contexto de build de la raíz y su propio Dockerfile:

| Tool | `RAILWAY_DOCKERFILE_PATH` | Servicio |
| --- | --- | --- |
| `calculate_control_charts` | `tools/calculate_control_charts/Docker/Dockerfile` | `calculate-control-charts` |
| `detect_business_anomalies` | `tools/detect_business_anomalies/Docker/Dockerfile` | `detect-business-anomalies` |
| `generate_kpis` | `tools/generate_kpis/Docker/Dockerfile` | `generate-kpis` |

Cada Dockerfile empaqueta el backend Node compartido y la UI de su tool en una
sola imagen y escucha `process.env.PORT` (8101 solo es el valor local por defecto).
El endpoint abierto de liveness es `/health`; `/ready` comprueba el acceso al
core y `/status` muestra el cursor y la última actividad del poller. Las rutas
de eventos y artefactos siguen protegidas por `x-api-key`.

## GitHub Actions

El workflow `.github/workflows/deploy-railway.yml` usa un único secreto de
repositorio llamado `RAILWAY_TOKEN` para desplegar el core/dashboard. No
despliega estas tres tools; para ellas no hace falta configurar ese secreto en
este workflow. El responsable de plataforma debe crear los servicios de tools y
asociar cada nombre con su proyecto Railway.

En Railway, configure por servicio:

```text
RAILWAY_DOCKERFILE_PATH=<valor de la tabla>
```

Variables de runtime habituales: `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`, `DB_NAME`, `LOG_LEVEL` y las variables de bootstrap/API key
definidas por plataforma. Nunca las pongas en HTML, Dockerfile ni commits.
Para cada servicio federado configure también:

```text
TOOL_ID=<id de la tool de la tabla>
ISOTOOLS_API_URL=https://api-events.orcalabs.mx/api/v1
ISOTOOLS_API_KEY=<key registrada en el core con events:read,events:write>
```

El poller usa `GET /events/subscriptions/:TOOL_ID` y publica cada salida en
`POST /events`, conservando `correlation_id` y estableciendo `causation_id`.
El cursor es local a la instancia y se reinicia saltando el backlog; para no
perder eventos durante reinicios, el cursor debe persistirse en almacenamiento
durable antes de usarlo en producción crítica.

## Uso desde el navegador

Cada subdominio sirve el panel operativo de su tool. Después de iniciar sesión
por OIDC, captura los parámetros y envía la ejecución desde la página. El
backend publica el evento con su API key privada; la clave nunca se envía al
navegador. La pantalla consulta la cadena por `correlation_id` y muestra los
resultados que la tool guardó en Industrial Events.

Las ejecuciones manuales se identifican con el módulo `isotools_manual_test`,
un activo `ENS-*` y metadatos `syntheticTest: true`. Son eventos nuevos y
visibles en el registro central; no son datos ERP ni deben etiquetarse como
producción real. Para publicarlos se requiere sesión OIDC, rol `operator`,
confirmación explícita en el formulario y mismo origen. El evento registra el
subject OIDC del operador y su rol de autorización; el endpoint de consulta
requiere sesión, pero no permiso para escribir:

| Tool | Página | Parámetros principales | Salida mostrada |
| --- | --- | --- | --- |
| `calculate_control_charts` | `/` en `ccc.orcalabs.mx` | Planta, característica, tipo de carta, subgrupo y mediciones | Límites, puntos, estado y gráfica SPC |
| `detect_business_anomalies` | `/` en `dba.orcalabs.mx` | Planta, métrica, desviación, sensibilidad y periodo | Anomalías, valores esperados/observados y Z-score |
| `generate_kpis` | `/` en `gk.orcalabs.mx` | Planta, periodo y variación sintética | Tarjetas OEE, scrap rate, entrega a tiempo y costo unitario |

La UI usa `POST /api/tool/runs` para iniciar una prueba y
`GET /api/tool/runs/:correlationId` para consultar la cadena. El servicio debe
tener `TOOL_ID`, la URL del Core y una `ISOTOOLS_API_KEY` con scopes
`events:read,events:write`. Si la UI responde “authentication required”, inicia
sesión en el dominio de esa tool; cada subdominio es un relying party OIDC
independiente. Para cambiar cálculos, campos o comportamiento de la interfaz,
modifica el código fuente y vuelve a desplegar; el panel solo cambia parámetros
de ejecución, no edita el código desplegado.

Los contenedores federados no necesitan PostgreSQL: el esquema/migrador local
del servidor es no fatal cuando no hay base configurada; lectura y publicación
se realizan contra el Core API. La API key se registra en el Core (el admin
puede usar `BOOTSTRAP_API_KEY` allí) y después se configura como
`ISOTOOLS_API_KEY` en cada servicio de tool. No configures el bootstrap key en
los servicios consumidores.

## Primer despliegue

1. El administrador crea los tres servicios Railway y configura el contexto de build en la raíz del repositorio.
2. En cada servicio, configura `RAILWAY_DOCKERFILE_PATH` con la ruta de su fila y sus variables `TOOL_ID`, `ISOTOOLS_API_URL` y `ISOTOOLS_API_KEY`.
3. Configura el relying party OIDC de cada subdominio para emitir el rol `operator` a quienes pueden ejecutar pruebas.
4. Después de aprobar e integrar el commit, el responsable despliega manualmente cada servicio de tool desde Railway. El workflow de este repo despliega solo el core/dashboard.
5. Comprueba `GET /health`, `GET /ready` y `/status` en cada dominio; una respuesta 200 no demuestra que la cadena funcional haya procesado un evento.
6. Con una sesión del rol `operator`, ejecuta una prueba sintética marcada y verifica su cadena en Core. No reenvíes eventos de producción como prueba.

No modificar Secrets, Services ni configuración de Railway cuando falle un
deployment; conservar los logs del workflow y escalar el fallo al administrador.
