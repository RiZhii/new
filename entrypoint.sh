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

sleep 4

ffmpeg -nostdin -f x11grab -video_size 1280x720 -framerate 30 -i :99 \
       -c:v libx264 -preset ultrafast -tune zerolatency -pix_fmt yuv420p \
       -f rtsp rtsp://localhost:8554/mystream &

pkill chromium || true

rm -rf /tmp/chrome

export HOSTNAME=browser-box 

google-chrome \
  --no-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --remote-debugging-port=9222\
  --remote-debugging-address=0.0.0.0 \
  --user-data-dir=/tmp/chrome \
  --headless=new \
  about:blank &

echo "waiting"
until curl -s http://localhost:9222/json > /dev/nell; do 
  sleep 2
done 

echo "chrome ready"

node /proxy.js &

wait