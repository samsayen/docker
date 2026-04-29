# docker

A personal play area for Docker projects — experiments, learning exercises, and small containerized apps. Nothing here is production-grade; expect rough edges, half-finished ideas, and the occasional dead end. That's the point.

## What's here

- **CIA_TRADECRAFT_PRIMER/** — A small web app (with a `Dockerfile`) built around the declassified CIA Tradecraft Primer.

More projects will land in their own top-level directories as they get built.

## Running a project

Each subdirectory is self-contained. The general flow:

```bash
cd <project-dir>
docker build -t <project-name> .
docker run --rm -p 8080:8080 <project-name>
```

Check the project's own files for any project-specific instructions.

## License

This repository is open source and freely available. Everything here may be used, copied, modified, and redistributed for any purpose, with or without attribution. No warranty is provided — if it breaks, it's yours to keep both pieces.

If a specific subproject needs a more formal license (for downstream use, contributions, etc.), it'll include its own `LICENSE` file that takes precedence for that subdirectory.

## Contributing

This is a personal sandbox, but issues and pull requests are welcome if you spot something interesting or broken.
