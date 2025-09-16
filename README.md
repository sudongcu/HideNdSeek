# HideNdSeek
Simple Hide and Seek Game

## Local Source
**Start Flask**
``` bash
flask run
```
or

**Local Docker**
```bash
bash build_image.sh
```

```bash
bash run_container.sh
```

## Docker
[Docker Hub](https://hub.docker.com/repository/docker/sudongcu/hidendseek/general)

**1. Pull docker image.**
``` bash
docker pull sudongcu/hidendseek:latest
```

**2. Run docker image.**
``` bash
docker run -d -p 5000:5000 sudongcu/hidendseek:latest
```
