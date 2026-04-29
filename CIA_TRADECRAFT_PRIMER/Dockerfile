FROM python:3.12-alpine

WORKDIR /site

COPY ["Tradecraft Primer.html", "lessons-data.js", "app.jsx", "./"]

EXPOSE 8000

CMD ["python", "-m", "http.server", "8000", "--bind", "0.0.0.0"]
