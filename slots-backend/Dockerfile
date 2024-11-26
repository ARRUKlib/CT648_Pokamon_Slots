FROM node:16

WORKDIR /app

# ติดตั้ง Bun
RUN curl -fsSL https://bun.sh/install | bash && \
    export PATH="/root/.bun/bin:$PATH"

# คัดลอกไฟล์ package.json และ bun.lockb
COPY package.json bun.lockb* ./

# ติดตั้ง dependencies โดยใช้ Bun
RUN /root/.bun/bin/bun install

# คัดลอกไฟล์ทั้งหมดในโฟลเดอร์
COPY . .

# ตรวจสอบว่า 'axios' ถูกติดตั้งแล้ว
RUN /root/.bun/bin/bun add axios

# รันเซิร์ฟเวอร์ Backend
CMD ["/root/.bun/bin/bun", "run", "server.ts"]
