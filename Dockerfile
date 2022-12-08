FROM python:3.8-slim

RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install mkdocs
RUN pip install mkdocs-material
RUN pip install mkdocs-minify-plugin


COPY mkdocs.yml /app/mkdocs.yml
WORKDIR /docs
EXPOSE 8000

CMD ["mkdocs", "serve", "-a", "0.0.0.0:8000"]