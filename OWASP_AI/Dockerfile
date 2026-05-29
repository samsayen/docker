FROM python:3.12-alpine

WORKDIR /site

COPY index.html styles.css app.js ./

EXPOSE 8000

CMD ["python", "-m", "http.server", "8000", "--bind", "0.0.0.0"]
