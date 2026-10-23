FROM node:22-bookworm-slim AS frontend
WORKDIR /build/front_end
COPY front_end/package.json front_end/package-lock.json ./
RUN npm ci
COPY front_end/ ./
RUN npm run build

FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 \
    ORBYTE_DATABASE=/app/data/orbyte.sqlite3 \
    ORBYTE_FRONTEND_DIRECTORY=/app/front_end/dist
WORKDIR /app
COPY back_end/requirements*.txt ./back_end/
RUN pip install --no-cache-dir -r back_end/requirements-production.txt \
    && useradd --system --create-home --uid 10001 orbyte \
    && mkdir -p /app/data && chown orbyte:orbyte /app/data
COPY --chown=orbyte:orbyte back_end/ ./back_end/
COPY --from=frontend --chown=orbyte:orbyte /build/front_end/dist ./front_end/dist
USER orbyte
WORKDIR /app/back_end
EXPOSE 8080
CMD ["gunicorn", "--config", "gunicorn.conf.py", "app:create_app()"]
