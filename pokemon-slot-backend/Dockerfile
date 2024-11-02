# ใช้ Node.js version 18 สำหรับ backend
FROM node:18

# ตั้งค่า directory ทำงานใน container
WORKDIR /app

# คัดลอกไฟล์ package.json และติดตั้ง dependencies
COPY package.json ./
RUN npm install

# คัดลอกไฟล์ทั้งหมดใน backend ไปยัง container
COPY . .

# เปิดพอร์ต 3001 สำหรับ backend
EXPOSE 3001

# สั่งให้ container รัน backend ด้วยคำสั่ง node
CMD ["node", "server.js"]
