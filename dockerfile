FROM debian:bookworm-slim
ENV DEBIAN_FRONTEND=noninteractive 

RUN apt-get update && apt-get install -y socat \
    xvfb x11vnc novnc websockify ffmpeg fluxbox \
    chromium \
    dbus-x11 dbus fonts-liberation libnss3 \
    supervisor net-tools iproute2 curl wget git \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/novnc/noVNC.git /opt/novnc    

RUN wget https://github.com/aler9/mediamtx/releases/download/v1.9.3/mediamtx_v1.9.3_linux_amd64.tar.gz && \
    tar -xzf mediamtx_v1.9.3_linux_amd64.tar.gz -C /usr/local/bin/ mediamtx && \
    rm mediamtx_v1.9.3_linux_amd64.tar.gz

COPY mediamtx.yml /etc/mediamtx.yml     
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 6080 8888 8889 8554 9222 9223

CMD ["/entrypoint.sh"]