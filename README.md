# 📖 Game Rules

## Basics

At the start, the player begins in the center of the grid.<br>
The grid size is defined by the number of rows and columns entered at the beginning.<br>
Clicking on a hidden box starts the exploration to search for the hidden gem.

## Objective

The goal is to find the hidden gem.<br>
Once the gem is discovered, a victory overlay is shown and the game is completed.

## Danger

A ghost is hidden somewhere on the grid.<br>
If the player steps onto the ghost’s cell, it’s Game Over immediately.<br>
When the ghost is nearby, warning effects and rumble sounds are triggered, and the HUD shows "?" instead of distance numbers.

## Movement

PC (Keyboard):<br>
Use arrow keys (↑ ↓ ← →) or WASD to move up, down, left, or right.

Mobile:<br>
Swipe (up, down, left, right) on the screen to move.<br>
Each move plays a footstep sound, and the minimap updates the player’s position.

#$ Hint & Minimap

The number shows the remaining steps/distance to the gem.<br>
If the ghost is close, the HUD displays ? instead to increase tension.<br>
The minimap shows the player’s position and path; optionally, the ghost indicator can be enabled.

## Finish

### Win
Find the gem to win the game.<br>
After winning, you can start again with a new grid.

### Lost

Get caught by the ghost → immediate Game Over.<br>
Your path will be displayed, and you can start a new game afterwards.

<img width="2560" height="1432" alt="image" src="https://github.com/user-attachments/assets/375a25d9-dfc2-4ce0-b1fe-673bf4895613" />


<img width="689" height="715" alt="image" src="https://github.com/user-attachments/assets/20796c71-1261-4627-bfdf-a648d7f2c932" />


# How to Run

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
