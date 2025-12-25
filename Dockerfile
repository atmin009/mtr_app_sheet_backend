# ใช้ Node.js LTS version เป็น base image
FROM node:18-alpine

# ตั้งค่า working directory ใน container
WORKDIR /app

# Copy package files
COPY package.json ./

# ติดตั้ง dependencies
# ใช้ npm install แทน npm ci เพื่อรองรับกรณีที่ lock file ไม่ sync หรือไม่มี
RUN npm install --only=production

# Copy source code
COPY . .

# สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
RUN mkdir -p uploads/age-logos uploads/age-cate-covers uploads/category-icons

# Expose port ที่ server ใช้
EXPOSE 3000

# ตั้งค่า environment variable สำหรับ production
ENV NODE_ENV=production

# รัน server
CMD ["node", "index.js"]

