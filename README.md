# CT648_Pokamon_Slots

### โปรเจคนี้จัดทำขึ้นเพื่อเป็นการศึกษาการเรียนรู้และพัฒนา   Backend, Frontend, DataBase การใช้งาน API และการเขียนเว็บด้วย Bun และ React เท่านั้น  

## 1. หลักการพัฒนา (Development Principles)
### **1.1 โครงสร้าง**
- **Frontend**  
  - ใช้ **React.js** สำหรับการพัฒนาและแสดงผลส่วนติดต่อผู้ใช้ (UI/UX)  
  - สไตล์การออกแบบใช้ CSS

- **Backend** 
  - ใช้ **Express.js** เป็นเว็บเซิร์ฟเวอร์ในการจัดการ API  
  - มีการเชื่อมต่อและประมวลผลข้อมูลระหว่างฐานข้อมูลและ Frontend  

- **Database** 
  - ใช้ **PostgreSQL** สำหรับจัดเก็บข้อมูล เช่น
    - ข้อมูลผู้ใช้ (Users)  
    - ข้อมูลการทำธุรกรรม (Transactions)  
    - ข้อมูลการหมุนสล็อต (Spins)  
    - ข้อมูลสถิติผู้เล่น (Player Statistics)

- **Open API**  
  - ใช้ **PokeAPI** สำหรับดึงข้อมูลโปเกมอน เช่น รูปภาพและชื่อ เพื่อใช้ในเกม
<img width="946" alt="Screenshot 2567-11-25 at 21 16 26" src="https://github.com/user-attachments/assets/46158515-a365-4ca8-bb5e-e35a052cb567">

### **1.2 แนวคิดการออกแบบ**
- **แยกหน้าที่ของผู้ใช้** 
  - **ผู้เล่น (Player)**  
    - ล็อกอินเข้าสู่ระบบ  
    - เล่นเกม (หมุนสล็อตและรับรางวัล)  
    - เห็นยอดเงินในหน้าเกม  
  - **ผู้ดูแลระบบ (Admin)**  
    - เพิ่มเงินในบัญชีผู้เล่น  
    - ปรับอัตราการชนะ (Win Rate) ของผู้เล่น  
    - จัดการข้อมูลผู้ใช้งาน
    - สามารถดูยอดเงินและสถิติการเล่นของผู้เล่นได้  

- **ความปลอดภัย**  
  - ใช้ **JWT (JSON Web Token)** สำหรับการตรวจสอบสิทธิ์ผู้ใช้งาน (**Authentication**)  
  - ใช้ Middleware เพื่อจัดการสิทธิ์การเข้าถึงตามบทบาทของผู้ใช้ (**Authorization**) เช่น แยกสิทธิ์ระหว่าง Player และ Admin  

- **RESTful API**
  - ใช้แนวคิด **RESTful API** ที่ชัดเจนสำหรับการสื่อสารระหว่าง Frontend และ Backend  
  - แบ่ง Endpoint ตามฟังก์ชันการทำงาน เช่น `/api/users`, `/api/spin-slot`, `/api/transactions`
---

## 2. API ที่สำคัญ (Key APIs)

### **Authentication and Authorization**
1. **Login User**  
   - `POST /api/login`  
     ใช้สำหรับผู้ใช้เข้าสู่ระบบ และสร้าง JWT Token  
<img width="1470" alt="Screenshot 2567-11-09 at 14 57 29" src="https://github.com/user-attachments/assets/2297a683-bae5-4475-87c4-d65ddc0b3237">

2. **Login Admin**  
   - `POST /api/admin-login`  
     ใช้สำหรับผู้ดูแลระบบเข้าสู่ระบบ และสร้าง JWT Token  
<img width="1470" alt="Screenshot 2567-11-25 at 21 44 17" src="https://github.com/user-attachments/assets/bf8b1628-0af8-4896-bb31-dd9da2f5c160">

3. **Record Login**  
   - `POST /api/record-login`  
     ใช้สำหรับบันทึกการล็อกอินของผู้ใช้หรือผู้ดูแลระบบ  

4. **Middleware: Authenticate Token**  
   - ใช้เพื่อตรวจสอบ JWT Token ในทุก API ที่ต้องการการยืนยันตัวตน  

5. **Middleware: Authorize Role**  
   - ใช้เพื่อจำกัดสิทธิ์ของ API ให้เฉพาะบทบาทที่กำหนด (`user` หรือ `admin`)  


### **User Management**
6. **Register User**  
   - `POST /api/register`  
     ใช้สำหรับลงทะเบียนผู้ใช้ใหม่  
<img width="1470" alt="Screenshot 2567-11-09 at 15 22 19" src="https://github.com/user-attachments/assets/34788e1f-bdf9-4b6c-8816-2b94c4060a33">

7. **Register Admin**  
   - `POST /api/register-admin`  
     ใช้สำหรับลงทะเบียนผู้ดูแลระบบ  
<img width="1470" alt="Screenshot 2567-11-25 at 21 45 44" src="https://github.com/user-attachments/assets/d72b13ee-09b8-41f7-8883-be5a594ba113">

8. **Get User Profile**  
   - `GET /api/user-profile`  
     ใช้สำหรับดึงข้อมูลโปรไฟล์ของผู้ใช้  

9. **Get All Users**  
   - `GET /api/users`  
     ใช้สำหรับดึงข้อมูลผู้ใช้ทั้งหมด (สำหรับผู้ดูแลระบบเท่านั้น) 
<img width="1470" alt="Screenshot 2567-11-25 at 23 06 21" src="https://github.com/user-attachments/assets/395d9797-5a9d-4273-b5f9-16327ef3384a">


### **Slot Game**
10. **Spin Slot**  
    - **Endpoint**: `POST /api/spin-slot`  
      ใช้สำหรับหมุนสล็อตและคำนวณผลลัพธ์ของเกม เช่น การจัดเรียงของสัญลักษณ์ในแนวแถว คอลัมน์ หรือแนวทแยง พร้อมรางวัลที่ได้รับ

11. **Record Spin**  
    - **Endpoint**: `POST /api/record-spin`  
      ใช้สำหรับบันทึกข้อมูลการหมุนสล็อต เช่น จำนวนเงินเดิมพัน จำนวนเงินที่ชนะ จำนวนการหมุน และอัปเดตข้อมูลในตารางสถิติ

12. **Get Pokémon Images**  
    - **Endpoint**: `GET /api/pokemon-images`  
      ใช้สำหรับดึงข้อมูลภาพโปเกมอนที่โหลดล่วงหน้ามาจาก PokeAPI โดย API หลักที่ใช้งานคือ https://pokeapi.co/api/v2/pokemon/ ใช้เพื่อดึงข้อมูลโปเกมอนแต่ละตัว เช่น ชื่อ, รูปภาพ, และรายละเอียดอื่นๆ
<img width="1470" alt="Screenshot 2567-11-25 at 22 03 58" src="https://github.com/user-attachments/assets/fa26ab1c-0935-42bf-a5fa-6d156fdca8ed">
<img width="1390" alt="Screenshot 2567-11-25 at 23 33 37" src="https://github.com/user-attachments/assets/c60d46a2-aad0-41a4-988f-6bb55cb07e2d">


### **Finance Management**
**13. Update Balance**
- **API:** `POST /api/update-balance`
  **ใช้หน้า Admin**  
    - ใช้เมื่อผู้ดูแลระบบต้องการเพิ่มยอดเงินของผู้ใช้
  **ใช้หน้าเกม (Game.tsx)**  
    - ใช้สำหรับอัปเดตยอดเงินผู้เล่นหลังจากที่เล่นเกมเสร็จ เช่น เพิ่มรางวัลหลังจากชนะสล็อต

**14. Update Win Rate**
- **API:** `POST /api/update-win-rate`
  - **ใช้หน้า Admin**  
    ใช้เมื่อผู้ดูแลระบบต้องการปรับค่า Win Rate ของผู้เล่นเฉพาะราย

**15. Win Rate Update (Simplified)**
- **API:** `POST /api/win-rate`
  **ใช้หน้า Admin**  
    - ใช้สำหรับเปลี่ยน Win Rate ของผู้เล่นในกรณีทั่วไป เช่น การรีเซ็ตหรือปรับ Win Rate แบบกลุ่ม
  **อาจใช้ใน Script ภายในระบบ:**  
    - สำหรับการอัปเดตค่า Win Rate แบบแบ็คเอนด์ เช่น การปรับ Win Rate ตามเหตุการณ์หรือโปรโมชั่นพิเศษ
<img width="1470" alt="Screenshot 2567-11-25 at 22 31 55" src="https://github.com/user-attachments/assets/395a742e-8d9d-4670-917b-ed396e742a89">

### **Player Statistics**
16. **Get Player Statistics by User ID**  
    - `GET /api/player-statistics/:userId`  
      ใช้สำหรับดึงข้อมูลสถิติการเล่นของผู้ใช้แต่ละคน  

17. **Get All Player Statistics**  
    - `GET /api/player-statistics`  
      ใช้สำหรับดึงข้อมูลสถิติการเล่นทั้งหมดของผู้เล่น
<img width="1470" alt="Screenshot 2567-11-25 at 23 12 45" src="https://github.com/user-attachments/assets/4280f686-4406-44e2-b972-89c3821c3265">

### **Transaction Management**
18. **Record Admin Action**  
    - `POST /api/record-admin`  
      ใช้สำหรับบันทึกการทำรายการของผู้ดูแลระบบ  

19. **Get All Transactions**  
    - `GET /api/transactions`  
      ใช้สำหรับดึงข้อมูลการทำรายการทั้งหมด
<img width="1470" alt="Screenshot 2567-11-25 at 23 09 12" src="https://github.com/user-attachments/assets/f2102c79-8205-4daf-92f2-dd25c51e9268">


20. **Get All Spins**  
    - `GET /api/spins`  
      ใช้สำหรับดึงข้อมูลการหมุนสล็อตแต่ละรอบ เช่น ในการหมุนแต่ละรอบมีจำนวนเงินเดิมพันเท่าไรได้รางวัลเท่าไร
<img width="1470" alt="Screenshot 2567-11-25 at 23 10 26" src="https://github.com/user-attachments/assets/f95039e3-e2c7-4231-94d4-23eeef71d543">


## 3. วิธีการ Deploy โปรเจกต์

โปรเจกต์นี้ใช้ **Docker Compose** สำหรับการจัดการบริการ (Frontend, Backend, และฐานข้อมูล) ขั้นตอนการ Deploy มีดังนี้

---

### **1. ติดตั้ง Docker และ Docker Compose**
1. ดาวน์โหลดและติดตั้ง Docker:
   - สำหรับ Windows: ดาวน์โหลด Docker Desktop [ที่นี่](https://www.docker.com/products/docker-desktop/).
   - สำหรับ macOS: ดาวน์โหลด Docker Desktop [ที่นี่](https://www.docker.com/products/docker-desktop/).
   - สำหรับ Linux: ติดตั้ง Docker ด้วยคำสั่ง:
     ```bash
     sudo apt-get update
     sudo apt-get install docker-ce docker-ce-cli containerd.io
     ```

2. ตรวจสอบว่า Docker และ Docker Compose ถูกติดตั้งสำเร็จ:
   ```bash
   docker --version
   docker-compose --version
   ```

---

### **2. สร้างไฟล์ `.env`**
- สร้างไฟล์ `.env` ใน root directory ของโปรเจกต์ YourProject/.env
- ตัวอย่างไฟล์ `.env`:
  ```env
      # Backend Configuration
      PORT=3000                                 # พอร์ตที่ backend จะรันใน container
      SECRET_KEY=your_secret_key                # กุญแจลับสำหรับการเข้ารหัส JWT
      
      # Database Configuration
      DATABASE_HOST=db                          # ชื่อบริการฐานข้อมูล (ควรตรงกับ service name ใน docker-compose)
      DATABASE_USER=postgres                    # ชื่อผู้ใช้ฐานข้อมูล
      DATABASE_PASSWORD=12345678               # รหัสผ่านฐานข้อมูล
      DATABASE_NAME=ct648                      # ชื่อฐานข้อมูล
      DATABASE_PORT=5433                        # พอร์ตฐานข้อมูลภายใน container (ไม่ใช่พอร์ตที่ expose)

  ```
---

### **3. ตรวจสอบ Docker Compose Configuration**
ตรวจสอบว่าโค้ดไฟล์ `docker-compose.yml` มีเนื้อหาถูกต้อง
- ตรวจสอบให้ตรงกับฐานข้อมูลที่ตนเองติดตั้ง

```bash
  db:
      image: postgres:13  # ใช้ PostgreSQL เวอร์ชัน 13
      environment:
        - POSTGRES_USER=postgres  # ตั้งชื่อผู้ใช้ PostgreSQL
        - POSTGRES_PASSWORD=12345678  # ตั้งรหัสผ่านสำหรับ PostgreSQL
        - POSTGRES_DB=ct648  # ชื่อฐานข้อมูลที่จะสร้าง
      volumes:
        - postgres_data:/var/lib/postgresql/data  # เชื่อมข้อมูลฐานข้อมูลใน volume
        - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # รันสคริปต์ `init.sql` ตอนเริ่มต้น
      ports:
        - "5433:5432"  # เปิดพอร์ต 5433 ให้เข้าถึงฐานข้อมูล
      networks:
        - backend  # เชื่อมโยงเครือข่าย backend
```
---

### **4. รัน Docker Compose**
- รันคำสั่งต่อไปนี้ใน root directory ของโปรเจกต์:
```bash
  docker-compose up --build
```
  หรือ
```bash
  docker-compose up --build -d
```

- ระบบจะเริ่มต้น 3 บริการ:
  - **Frontend**: เปิดที่ `http://localhost:3001`
  - **Backend**: เปิดที่ `http://localhost:3000`
  - **Database**: เปิดที่ `localhost:5433` (สำหรับเชื่อมต่อฐานข้อมูล)

---

### **5. ทดสอบระบบ**
1. เปิด Frontend ที่ `http://localhost:3001` เพื่อดู UI
2. ทดสอบ API ผ่าน `http://localhost:3000/api` เช่น
   - **ตรวจสอบ API** 
   ```bash
     curl -X GET http://localhost:3000/api/all-pokemon-images
   ```

3. หากต้องการเข้าไปดูในฐานข้อมูล ให้เชื่อมต่อฐานข้อมูล PostgreSQL ผ่านเครื่องมือ เช่น pgAdmin หรือ DBeaver:
   - Host: `localhost`         (IP Host ที่ใช้รัน)
   - Port: `5433`              (Port ที่ใช้)
   - Username: `postgres`      (ชื่อผู้ใช้)
   - Password: `123456789`     (รหัสผ่าน)
   - Database: `slotdb`        (ชื่อฐานข้อมูล)

---

### **6. หากต้องการปิดหรือสั่งหยุดการทำงาน**
- หากต้องการหยุดบริการทั้งหมด:
  ```bash
  docker-compose down
  ```
---
---
## สำหรับกติกาเกมสล็อต

### **กติกาเกม Pokémon Slot Machine**

#### **1. วิธีการเล่น**
- ผู้เล่นจะเลือกจำนวนเงินเดิมพันจากตัวเลือกที่กำหนด (100, 200, 300, 500, 1,000, 1,500, 2,000)  
- กดปุ่ม **"Spin"** เพื่อเริ่มหมุนสล็อต  
- ผลลัพธ์ของสล็อตจะสุ่มและแสดงผล 3 แถว 3 คอลัมน์  
- หากสัญลักษณ์ตรงตามเงื่อนไขที่กำหนด ผู้เล่นจะได้รับรางวัล  

---

#### **2. กติกาในการชนะ**
การคำนวณรางวัลจะขึ้นอยู่กับรูปแบบการเรียงของสัญลักษณ์ในสล็อต:

- หากสัญลักษณ์ใน แถวใดแถวหนึ่ง เหมือนกันทั้งหมด จะได้รับรางวัล 3 เท่า
- หากสัญลักษณ์ใน คอลัมน์ใดคอลัมน์หนึ่ง เหมือนกันทั้งหมด จะได้รับรางวัล 3 เท่า
- หากสัญลักษณ์เรียง แนวทแยงมุม (ซ้ายบน-ขวาล่าง หรือ ขวาบน-ซ้ายล่าง) เหมือนกันทั้งหมด จะได้รับรางวัล 5 เท่า
- รางวัลคำนวณโดย: รางวัล × จำนวนเงินเดิมพัน
---
##### กติกาเกมสามารถเข้าดูได้ที่หน้า Rules โดยกดปุ่ม Game Rules ที่หน้า Home
<img width="1390" alt="Screenshot 2567-11-25 at 23 33 37" src="https://github.com/user-attachments/assets/d95f64cb-d94c-4726-86c4-100bad6572a1">


#### **5. หมายเหตุ**
- รางวัลทั้งหมดจะถูกคำนวณและอัปเดตโดยอัตโนมัติเมื่อหมุนสล็อตเสร็จ.
- ระบบจะตรวจสอบเงื่อนไขการชนะและบันทึกข้อมูลการเล่น (เช่น ยอดเดิมพัน, จำนวนรางวัลที่ได้) ลงในฐานข้อมูล.
---
___
#### จัดทำโดย: นางสาว จิราพร สอนบุญมา มหาวิทยาลัยธุรกิจบัณฑิต 
![logo](https://github.com/user-attachments/assets/4b8b542c-b76b-46da-9c16-111b77338e76)

