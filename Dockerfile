FROM python:3.8.5

COPY requirements .

RUN pip install -r requirements

WORKDIR /app

COPY . /app

EXPOSE 5050

ENTRYPOINT ["python3"]

CMD ["app.py"] 
