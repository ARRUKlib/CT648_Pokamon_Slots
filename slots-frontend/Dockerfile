# ใช้ Node.js base image
FROM node:16

# กำหนด working directory ใน container
WORKDIR /app

# ติดตั้ง Bun และเพิ่ม PATH
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# คัดลอกไฟล์ package.json และ bun.lockb
COPY package.json bun.lockb* ./

# ติดตั้ง dependencies โดยใช้ Bun
RUN bun install

# ติดตั้ง react-markdown (หากจำเป็น)
RUN bun add react-markdown

# คัดลอกไฟล์ทั้งหมดในโฟลเดอร์ไปที่ container
COPY . .

# สร้าง build ของ Frontend
RUN bun run build

# ใช้ serve.json เพื่อจัดการ React Router
RUN echo '{ "rewrites": [ { "source": "**", "destination": "/index.html" } ] }' > build/serve.json

# ติดตั้ง serve
RUN npm install -g serve

# รัน Frontend server
CMD ["serve", "-s", "build", "-l", "3001"]
