import React from 'react';
import './About.css';
import profileImage from '../assets/images/me.jpg';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <div className="profile-card">
        <img
          src={profileImage}
          alt="Profile"
          className="profile-image"
        />
        <h1>Jiraporn Sornbunma</h1>
        <div className="profile-details">
          <p>รหัสนักศึกษา: 66130136</p>
          <p>การศึกษา:</p>
          <p>จบการศึกษาปริญญาตรี - คณะบริหารธุรกิจและการจัดการ สาขาคอมพิวเตอร์ธุรกิจ มหาวิทยาลัยราชภัฏอุบลราชธานี</p>
          <p>กำลังศึกษาปริญญาโท - คณะวิศวกรรมคอมพิวเตอร์ สาขาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยธุรกิจบัณฑิตย์</p>
        </div>
        <div className="profile-details">
          <p>อาจารย์ที่ปรึกษา:</p>
          <p>
            <a 
              href="https://cite.dpu.ac.th/ResumeDean.html" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              ผู้ช่วยศาสตราจารย์ ดร.ชัยพร เขมะภาตะพันธ์
            </a>
          </p>
          <p>ตำแหน่ง: ผู้อำนวยการหลักสูตร สาขาวิชาวิศวกรรมคอมพิวเตอร์ วิทยาลัยวิศวกรรมศาสตร์และเทคโนโลยี</p>
        </div>
      </div>

      <div className="research-section">
        <h2>About Project</h2>
        <div className="research-card">
          <h3>Source Code Repository: 
            <a href="https://github.com/ARRUKlib/CT648_Pokamon_Slots.git" target="_blank" rel="noopener noreferrer">
              View Code on GitHub
            </a>
          </h3>
        </div>
        <div className="research-card">
          <h3>Project Documentation: 
            <a href="/doc" target="_blank" rel="noopener noreferrer">
              View Documentation Details
            </a>
          </h3>
        </div>
      </div>
    </div>
  );
};

export default About;
