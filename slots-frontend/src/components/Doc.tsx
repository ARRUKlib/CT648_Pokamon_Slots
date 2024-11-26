import React from 'react';
import './Doc.css';

const Doc: React.FC = () => {
  return (
    <div className="doc-container">
      <h1>CT648_Pokamon_Slots</h1>
      <h3>
        โปรเจคนี้จัดทำขึ้นเพื่อเป็นการศึกษาการเรียนรู้และพัฒนา   Backend, Frontend, DataBase
        การใช้งาน API และการเขียนเว็บด้วย Bun และ React เท่านั้น
      </h3>

      <h2>1. หลักการพัฒนา (Development Principles)</h2>

      <div className="doc-section">
        <h3>1.1 โครงสร้าง</h3>
        <ul>
          <li>
            <b>Frontend</b>
            <ul>
              <li>ใช้ <b>React.js</b> สำหรับการพัฒนาและแสดงผลส่วนติดต่อผู้ใช้ (UI/UX)</li>
              <li>สไตล์การออกแบบใช้ CSS</li>
            </ul>
          </li>
          <li>
            <b>Backend</b>
            <ul>
              <li>ใช้ <b>Express.js</b> เป็นเว็บเซิร์ฟเวอร์ในการจัดการ API</li>
              <li>มีการเชื่อมต่อและประมวลผลข้อมูลระหว่างฐานข้อมูลและ Frontend</li>
            </ul>
          </li>
          <li>
            <b>Database</b>
            <ul>
              <li>ใช้ <b>PostgreSQL</b> สำหรับจัดเก็บข้อมูล เช่น:</li>
              <li>ข้อมูลผู้ใช้ (Users)</li>
              <li>ข้อมูลการทำธุรกรรม (Transactions)</li>
              <li>ข้อมูลการหมุนสล็อต (Spins)</li>
              <li>ข้อมูลสถิติผู้เล่น (Player Statistics)</li>
            </ul>
          </li>
          <li>
            <b>Open API</b>
            <ul>
              <li>ใช้ <b>PokeAPI</b> สำหรับดึงข้อมูลโปเกมอน เช่น รูปภาพและชื่อ เพื่อใช้ในเกม</li>
            </ul>
          </li>
        </ul>
        <img
          src="https://github.com/user-attachments/assets/46158515-a365-4ca8-bb5e-e35a052cb567"
          alt="Project Structure"
          width="100%"
        />
      </div>

      <div className="doc-section">
        <h3>1.2 แนวคิดการออกแบบ</h3>
        <ul>
          <li>
            <b>แยกหน้าที่ของผู้ใช้</b>
            <ul>
              <li>
                <b>ผู้เล่น (Player)</b>
                <ul>
                  <li>ล็อกอินเข้าสู่ระบบ</li>
                  <li>เล่นเกม (หมุนสล็อตและรับรางวัล)</li>
                  <li>เห็นยอดเงินในหน้าเกม</li>
                </ul>
              </li>
              <li>
                <b>ผู้ดูแลระบบ (Admin)</b>
                <ul>
                  <li>เพิ่มเงินในบัญชีผู้เล่น</li>
                  <li>ปรับอัตราการชนะ (Win Rate) ของผู้เล่น</li>
                  <li>จัดการข้อมูลผู้ใช้งาน</li>
                  <li>สามารถดูยอดเงินและสถิติการเล่นของผู้เล่นได้</li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            <b>ความปลอดภัย</b>
            <ul>
              <li>
                ใช้ <b>JWT (JSON Web Token)</b> สำหรับการตรวจสอบสิทธิ์ผู้ใช้งาน (Authentication)
              </li>
              <li>
                ใช้ Middleware เพื่อจัดการสิทธิ์การเข้าถึงตามบทบาทของผู้ใช้ (Authorization) เช่น
                แยกสิทธิ์ระหว่าง Player และ Admin
              </li>
            </ul>
          </li>
          <li>
            <b>RESTful API</b>
            <ul>
              <li>
                ใช้แนวคิด <b>RESTful API</b> ที่ชัดเจนสำหรับการสื่อสารระหว่าง Frontend และ Backend
              </li>
              <li>
                แบ่ง Endpoint ตามฟังก์ชันการทำงาน เช่น `/api/users`, `/api/spin-slot`,
                `/api/transactions`
              </li>
            </ul>
          </li>
        </ul>
      </div>

    <div className="doc-container">
      <h2>2. API ที่สำคัญ (Key APIs)</h2>

      <div className="doc-section">
        <h3>Authentication and Authorization</h3>
        <ol>
          <li>
            <b>Login User</b>
            <ul>
              <li>Endpoint: <code>POST /api/login</code></li>
              <li>ใช้สำหรับผู้ใช้เข้าสู่ระบบ และสร้าง JWT Token</li>
            </ul>
            <img
              src="https://github.com/user-attachments/assets/2297a683-bae5-4475-87c4-d65ddc0b3237"
              alt="Login User"
              width="100%"
            />
          </li>

          <li>
            <b>Login Admin</b>
            <ul>
              <li>Endpoint: <code>POST /api/admin-login</code></li>
              <li>ใช้สำหรับผู้ดูแลระบบเข้าสู่ระบบ และสร้าง JWT Token</li>
            </ul>
            <img
              src="https://github.com/user-attachments/assets/bf8b1628-0af8-4896-bb31-dd9da2f5c160"
              alt="Login Admin"
              width="100%"
            />
          </li>

          <li>
            <b>Record Login</b>
            <ul>
              <li>Endpoint: <code>POST /api/record-login</code></li>
              <li>ใช้สำหรับบันทึกการล็อกอินของผู้ใช้หรือผู้ดูแลระบบ</li>
            </ul>
          </li>

          <li>
            <b>Middleware: Authenticate Token</b>
            <ul>
              <li>ใช้เพื่อตรวจสอบ JWT Token ในทุก API ที่ต้องการการยืนยันตัวตน</li>
            </ul>
          </li>

          <li>
            <b>Middleware: Authorize Role</b>
            <ul>
              <li>ใช้เพื่อจำกัดสิทธิ์ของ API ให้เฉพาะบทบาทที่กำหนด (<code>user</code> หรือ <code>admin</code>)</li>
            </ul>
          </li>
        </ol>
      </div>

      <div className="doc-section">
        <h3>User Management</h3>
        <ol>
          <li>
            <b>Register User</b>
            <ul>
              <li>Endpoint: <code>POST /api/register</code></li>
              <li>ใช้สำหรับลงทะเบียนผู้ใช้ใหม่</li>
            </ul>
            <img
              src="https://github.com/user-attachments/assets/34788e1f-bdf9-4b6c-8816-2b94c4060a33"
              alt="Register User"
              width="100%"
            />
          </li>

          <li>
            <b>Register Admin</b>
            <ul>
              <li>Endpoint: <code>POST /api/register-admin</code></li>
              <li>ใช้สำหรับลงทะเบียนผู้ดูแลระบบ</li>
            </ul>
            <img
              src="https://github.com/user-attachments/assets/d72b13ee-09b8-41f7-8883-be5a594ba113"
              alt="Register Admin"
              width="100%"
            />
          </li>

          <li>
            <b>Get User Profile</b>
            <ul>
              <li>Endpoint: <code>GET /api/user-profile</code></li>
              <li>ใช้สำหรับดึงข้อมูลโปรไฟล์ของผู้ใช้</li>
            </ul>
          </li>

          <li>
            <b>Get All Users</b>
            <ul>
              <li>Endpoint: <code>GET /api/users</code></li>
              <li>ใช้สำหรับดึงข้อมูลผู้ใช้ทั้งหมด (สำหรับผู้ดูแลระบบเท่านั้น)</li>
            </ul>
            <img
              src="https://github.com/user-attachments/assets/395d9797-5a9d-4273-b5f9-16327ef3384a"
              alt="Get All Users"
              width="100%"
            />
          </li>
        </ol>
      </div>

      <div className="doc-section">
        <h3>Slot Game</h3>
        <ol>
          <li>
            <b>Spin Slot</b>
            <ul>
              <li>Endpoint: <code>POST /api/spin-slot</code></li>
              <li>ใช้สำหรับหมุนสล็อตและคำนวณผลลัพธ์ของเกม เช่น การจัดเรียงของสัญลักษณ์และรางวัลที่ได้รับ</li>
            </ul>
          </li>

          <li>
            <b>Record Spin</b>
            <ul>
              <li>Endpoint: <code>POST /api/record-spin</code></li>
              <li>ใช้สำหรับบันทึกข้อมูลการหมุนสล็อต</li>
            </ul>
          </li>

          <li>
            <b>Get Pokémon Images</b>
            <ul>
              <li>Endpoint: <code>GET /api/pokemon-images</code></li>
              <li>ใช้สำหรับดึงข้อมูลภาพโปเกมอนที่โหลดล่วงหน้ามาจาก PokeAPI โดย API หลักที่ใช้งานคือ "https://pokeapi.co/api/v2/pokemon/" ใช้เพื่อดึงข้อมูลโปเกมอนแต่ละตัว เช่น ชื่อ, รูปภาพ, และรายละเอียดอื่นๆ</li>
            </ul>
            <img
              src="https://github.com/user-attachments/assets/fa26ab1c-0935-42bf-a5fa-6d156fdca8ed"
              alt="Pokémon Images"
              width="100%"
            />
            <img
              src="https://github.com/user-attachments/assets/c60d46a2-aad0-41a4-988f-6bb55cb07e2d"
              alt="Pokémon Images"
              width="100%"
            />
          </li>
        </ol>
      </div>

      <div className="doc-section">
        <h3>Finance Management</h3>
        <ol>
          <li>
            <b>Update Balance</b>
            <ul>
              <li>Endpoint: <code>POST /api/update-balance</code></li>
              <li>ใช้สำหรับเพิ่มยอดเงินของผู้ใช้</li>
            </ul>
          </li>

          <li>
            <b>Update Win Rate</b>
            <ul>
              <li>Endpoint: <code>POST /api/update-win-rate</code></li>
              <li>ใช้สำหรับปรับค่า Win Rate ของผู้เล่นเฉพาะราย</li>
            </ul>
            <img
              src="https://github.com/user-attachments/assets/395a742e-8d9d-4670-917b-ed396e742a89"
              alt="ีupdate"
              width="100%"
            />
          </li>
        </ol>
      </div>

      <div className="doc-section">
        <h3>Player Statistics</h3>
        <ol>
          <li>
            <b>Get Player Statistics by User ID</b>
            <ul>
              <li>Endpoint: <code>GET /api/player-statistics/:userId</code></li>
              <li>ใช้สำหรับดึงข้อมูลสถิติการเล่นของผู้ใช้แต่ละคน</li>
            </ul>
          </li>

          <li>
            <b>Get All Player Statistics</b>
            <ul>
              <li>Endpoint: <code>GET /api/player-statistics</code></li>
              <li>ใช้สำหรับดึงข้อมูลสถิติการเล่นทั้งหมดของผู้เล่น</li>
            </ul>
            <img
              src="https://github.com/user-attachments/assets/4280f686-4406-44e2-b972-89c3821c3265"
              alt="Player Statistics"
              width="100%"
            />
          </li>
        </ol>
      </div>
      <div className="doc-section">
        <h3>Transaction Management</h3>
        <ol>
          <li>
            <b>Record Admin Action</b>
            <ul>
              <li>Endpoint: <code>POST /api/record-admin</code></li>
              <li>ใช้สำหรับบันทึกการทำรายการของผู้ดูแลระบบ</li>
            </ul>
          </li>

          <li>
            <b>Get All Transactions</b>
            <ul>
              <li>Endpoint: <code>GET /api/transactions</code></li>
              <li>ใช้สำหรับดึงข้อมูลการทำรายการทั้งหมด</li>
            </ul>
            <img
              src="https://github.com/user-attachments/assets/f2102c79-8205-4daf-92f2-dd25c51e9268"
              alt="Get All Transactions"
              width="100%"
            />
          </li>

          <li>
            <b>Get All Spins</b>
            <ul>
              <li>Endpoint: <code>GET /api/spins</code></li>
              <li>
                ใช้สำหรับดึงข้อมูลการหมุนสล็อตแต่ละรอบ เช่น ในการหมุนแต่ละรอบมีจำนวนเงินเดิมพันเท่าไร
                ได้รางวัลเท่าไร
              </li>
            </ul>
            <img
              src="https://github.com/user-attachments/assets/f95039e3-e2c7-4231-94d4-23eeef71d543"
              alt="Get All Spins"
              width="100%"
            />
          </li>
        </ol>
      </div>
    </div>


    <div className="doc-container">
      <h2>3. วิธีการ Deploy โปรเจกต์</h2>

      <div className="doc-section">
        <h3>1. ติดตั้ง Docker และ Docker Compose</h3>
        <ol>
          <li>
            ดาวน์โหลดและติดตั้ง Docker:
            <ul>
              <li>
                สำหรับ Windows: ดาวน์โหลด Docker Desktop{' '}
                <a href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noreferrer">
                  ที่นี่
                </a>
              </li>
              <li>
                สำหรับ macOS: ดาวน์โหลด Docker Desktop{' '}
                <a href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noreferrer">
                  ที่นี่
                </a>
              </li>
              <li>
                สำหรับ Linux: ติดตั้ง Docker ด้วยคำสั่ง:
                <pre>
                  <code>
                    sudo apt-get update
                    <br />
                    sudo apt-get install docker-ce docker-ce-cli containerd.io
                  </code>
                </pre>
              </li>
            </ul>
          </li>
          <li>
            ตรวจสอบว่า Docker และ Docker Compose ถูกติดตั้งสำเร็จ:
            <pre>
              <code>
                docker --version
                <br />
                docker-compose --version
              </code>
            </pre>
          </li>
        </ol>
      </div>

      <div className="doc-section">
        <h3>2. สร้างไฟล์ `.env`</h3>
        <p>สร้างไฟล์ <code>.env</code> ใน root directory ของโปรเจกต์ เช่น <code>YourProject/.env</code></p>
        <p>ตัวอย่างไฟล์ <code>.env</code>:</p>
        <pre>
          <code>
            # Backend Configuration
            <br />
            PORT=3000                           # พอร์ตที่ backend จะรันใน container
            <br />
            SECRET_KEY=your_secret_key          # กุญแจลับสำหรับการเข้ารหัส JWT
            <br />
            <br />
            <br />
            # Database Configuration
            <br />
            DATABASE_HOST=db                    # ชื่อบริการฐานข้อมูล (ควรตรงกับ service name ใน docker-compose)
            <br />
            DATABASE_USER=postgres              # ชื่อผู้ใช้ฐานข้อมูล
            <br />
            DATABASE_PASSWORD=12345678          # รหัสผ่านฐานข้อมูล
            <br />
            DATABASE_NAME=ct648                 # ชื่อฐานข้อมูล
            <br />
            DATABASE_PORT=5433                  # พอร์ตฐานข้อมูลภายใน container (ไม่ใช่พอร์ตที่ expose)
          </code>
        </pre>
      </div>

      <div className="doc-section">
        <h3>3. ตรวจสอบ Docker Compose Configuration</h3>
        <p>
          ตรวจสอบว่าโค้ดไฟล์ <code>docker-compose.yml</code> มีเนื้อหาถูกต้อง
        </p>
        <pre>
          <code>
            db:
            <br />
            &nbsp;&nbsp;image: postgres:13                            # ใช้ PostgreSQL เวอร์ชัน 13
            <br />
            &nbsp;&nbsp;environment:
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;- POSTGRES_USER=postgres          # ตั้งชื่อผู้ใช้ PostgreSQL
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;- POSTGRES_PASSWORD=12345678      # ตั้งรหัสผ่านสำหรับ PostgreSQL
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;- POSTGRES_DB=ct648               # ชื่อฐานข้อมูลที่จะสร้าง
            <br />
            &nbsp;&nbsp;volumes:
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;- postgres_data:/var/lib/postgresql/data              # เชื่อมข้อมูลฐานข้อมูลใน
            volume
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;- ./init.sql:/docker-entrypoint-initdb.d/init.sql     # รันสคริปต์ `init.sql`
            ตอนเริ่มต้น
            <br />
            &nbsp;&nbsp;ports:
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;- "5433:5432"                     # เปิดพอร์ต 5433 ให้เข้าถึงฐานข้อมูล
            <br />
            &nbsp;&nbsp;networks:
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;- backend                         # เชื่อมโยงเครือข่าย backend
          </code>
        </pre>
      </div>

      <div className="doc-section">
        <h3>4. รัน Docker Compose</h3>
        <p>รันคำสั่งต่อไปนี้ใน root directory ของโปรเจกต์:</p>
        <pre>
          <code>
            docker-compose up --build
            <br />
            หรือ
            <br />
            docker-compose up --build -d
          </code>
        </pre>
        <p>ระบบจะเริ่มต้น 3 บริการ:</p>
        <ul>
          <li>
            <b>Frontend</b>: เปิดที่ <code>http://localhost:3001</code>
          </li>
          <li>
            <b>Backend</b>: เปิดที่ <code>http://localhost:3000</code>
          </li>
          <li>
            <b>Database</b>: เปิดที่ <code>localhost:5433</code> (สำหรับเชื่อมต่อฐานข้อมูล)
          </li>
        </ul>
      </div>

      <div className="doc-section">
        <h3>5. ทดสอบระบบ</h3>
        <ol>
          <li>เปิด Frontend ที่ <code>http://localhost:3001</code> เพื่อดู UI</li>
          <li>
            ทดสอบ API ผ่าน <code>http://localhost:3000/api</code> เช่น:
            <pre>
              <code>curl -X GET http://localhost:3000/api/all-pokemon-images</code>
            </pre>
          </li>
          <li>
            หากต้องการเข้าไปดูในฐานข้อมูล ให้เชื่อมต่อฐานข้อมูล PostgreSQL ผ่านเครื่องมือ เช่น pgAdmin
            หรือ DBeaver:
            <ul>
              <li>Host: <code>localhost</code> (IP Host ที่ใช้รัน)</li>
              <li>Port: <code>5433</code> (Port ที่ใช้)</li>
              <li>Username: <code>postgres</code> (ชื่อผู้ใช้)</li>
              <li>Password: <code>123456789</code> (รหัสผ่าน)</li>
              <li>Database: <code>slotdb</code> (ชื่อฐานข้อมูล)</li>
            </ul>
          </li>
        </ol>
      </div>

      <div className="doc-section">
        <h3>6. หากต้องการปิดหรือสั่งหยุดการทำงาน</h3>
        <p>หากต้องการหยุดบริการทั้งหมด:</p>
        <pre>
          <code>docker-compose down</code>
        </pre>
      </div>
    </div>

    <div className="doc-container">
      <h2>สำหรับกติกาเกมสล็อต</h2>

      <div className="doc-section">
        <h3>กติกาเกม Pokémon Slot Machine</h3>
        <h4>1. วิธีการเล่น</h4>
        <ul>
          <li>ผู้เล่นจะเลือกจำนวนเงินเดิมพันจากตัวเลือกที่กำหนด (100, 200, 300, 500, 1,000, 1,500, 2,000)</li>
          <li>กดปุ่ม <b>"Spin"</b> เพื่อเริ่มหมุนสล็อต</li>
          <li>ผลลัพธ์ของสล็อตจะสุ่มและแสดงผล 3 แถว 3 คอลัมน์</li>
          <li>หากสัญลักษณ์ตรงตามเงื่อนไขที่กำหนด ผู้เล่นจะได้รับรางวัล</li>
        </ul>
      </div>

      <div className="doc-section">
        <h4>2. กติกาในการชนะ</h4>
        <p>การคำนวณรางวัลจะขึ้นอยู่กับรูปแบบการเรียงของสัญลักษณ์ในสล็อต:</p>
        <ul>
          <li>หากสัญลักษณ์ใน <b>แถวใดแถวหนึ่ง</b> เหมือนกันทั้งหมด จะได้รับรางวัล 3 เท่า</li>
          <li>หากสัญลักษณ์ใน <b>คอลัมน์ใดคอลัมน์หนึ่ง</b> เหมือนกันทั้งหมด จะได้รับรางวัล 3 เท่า</li>
          <li>
            หากสัญลักษณ์เรียง <b>แนวทแยงมุม</b> (ซ้ายบน-ขวาล่าง หรือ ขวาบน-ซ้ายล่าง) เหมือนกันทั้งหมด
            จะได้รับรางวัล 5 เท่า
          </li>
          <li>
            <b>รางวัลคำนวณโดย:</b> <code>รางวัล × จำนวนเงินเดิมพัน</code>
          </li>
        </ul>
        <p>
          กติกาเกมสามารถเข้าดูได้ที่หน้า <b>Rules</b> โดยกดปุ่ม <b>Game Rules</b> ที่หน้า <b>Home</b>
        </p>
        <img
          src="https://github.com/user-attachments/assets/d95f64cb-d94c-4726-86c4-100bad6572a1"
          alt="Game Rules Example"
          width="100%"
        />
      </div>

      <div className="doc-section">
        <h4>5. หมายเหตุ</h4>
        <ul>
          <li>รางวัลทั้งหมดจะถูกคำนวณและอัปเดตโดยอัตโนมัติเมื่อหมุนสล็อตเสร็จ</li>
          <li>
            ระบบจะตรวจสอบเงื่อนไขการชนะและบันทึกข้อมูลการเล่น (เช่น ยอดเดิมพัน, จำนวนรางวัลที่ได้)
            ลงในฐานข้อมูล
          </li>
        </ul>
      </div>
    </div>

      <footer>
        <p>
          จัดทำโดย: นางสาว จิราพร สอนบุญมา มหาวิทยาลัยธุรกิจบัณฑิต
          <br />
          <br />
          <img
            src="https://github.com/user-attachments/assets/4b8b542c-b76b-46da-9c16-111b77338e76"
            alt="Logo"
            width="150px"
          />
        </p>
      </footer>
    </div>
  );
};

export default Doc;
