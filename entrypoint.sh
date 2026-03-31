#!/bin/bash

mkdir -p /run/dbus
dbus-daemon --system --fork 2>/dev/null || true

/usr/local/bin/mediamtx /etc/mediamtx.yml &

Xvfb :99 -screen 0 1280x720x24 &
export DISPLAY=:99
sleep 1

fluxbox &

x11vnc -display :99 -rfbport 5900 -nopw -forever -shared -listen 0.0.0.0 -bg &

/opt/novnc/utils/novnc_proxy --vnc localhost:5900 --listen 6080 &

pkill chromium || true

rm -rf /tmp/chrome

chromium \
  --no-sandbox \
  --remote-debugging-port=9222 \
  --remote-debugging-address=0.0.0.0 \
  --remote-allow-origins="*" \
  --user-date-dir=/tmp/chrome \
  --disable-dev-shm-usage \
  --disable-gpu \
  --no-first-run \
  --no-zygote \
  --disable-background-networking \
  --disable-extensions \
  --disable-sync \
  --disable-default-apps \
  --display=:99 \
  "https://google.com" &
sleep 5

socat TCP-LISTEN:9223,bind=0.0.0.0,fork TCP 127.0.0.1:9222 &

sleep 2

echo "socat started"

ffmpeg -nostdin -f x11grab -video_size 1280x720 -framerate 30 -i :99 \
       -c:v libx264 -preset ultrafast -tune zerolatency -pix_fmt yuv420p \
       -f rtsp rtsp://localhost:8554/mystream &

wait