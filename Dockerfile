FROM denoland/deno:alpine-2.1.1

WORKDIR /app

COPY . .
RUN deno install --entrypoint main.ts

EXPOSE 3000

CMD ["run", "--allow-all", "--env-file", "main.ts"]
