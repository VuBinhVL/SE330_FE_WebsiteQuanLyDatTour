import React from 'react';
import './HelpPage.css';

const helpData = [
  {
    question: 'Điều kiện đăng ký tour như thế nào?',
    answer: `Để đăng ký tour Quý khách cần chuẩn bị Chứng minh nhân dân (còn hạn sử dụng) đối với tour du lịch trong nước, và Hộ chiếu (còn hạn trên 6 tháng) đối với tour du lịch nước ngoài, ngoài ra đối với một số nước thì sẽ Quý khách sẽ phải chuẩn bị thêm hồ sơ để xin visa, hồ sơ sẽ theo yêu cầu của Lãnh sự quán/ ĐSQ tại quận quy định.`
  },
  {
    question: 'Cần phải đăng ký tour trước bao lâu? Hồ sơ cần phải chuẩn bị trước bao lâu? Nếu tôi bị từ chối visa thì Vietravel sẽ giải quyết cho tôi như thế nào?',
    answer: `Kính chào Quý khách, để đảm bảo cho chỗ ngồi và thủ tục hành trình du lịch được chuẩn bị sẵn, Quý khách nên đăng ký ít nhất trước 1 tháng so với ngày khởi hành, riêng đối với các tour cần phải xin visa thì Quý khách phải chuẩn bị hồ sơ để xin visa theo yêu cầu của cơ quan thẩm quyền nước đến.

Trường hợp bị từ chối visa, mức chi phí visa và phí dịch vụ sẽ được trừ để hoàn tiền lại cho Quý khách. Quý khách nên liên hệ trực tiếp với chi nhánh để được tư vấn cụ thể. Trường hợp công tác nghiệp vụ ở Hà Nội, Quý khách sẽ thanh toán phí máy bay, lệ phí visa cho Vietravel.`
  },
  {
    question: 'Khách lớn tuổi đi tour cần điều kiện gì? Tôi đăng ký mua tour trực tiếp khách lớn tuổi mà không được?',
    answer: `Đối với khách từ 55 tuổi trở lên và khách nam từ 60 tuổi trở lên: Vietravel khuyến cáo nên có người thân đi cùng đối với khách từ 55 tuổi, đặc biệt là khách từ 70 tuổi trở lên và có bệnh lý nền về sức khỏe. Riêng khách từ 70 tuổi trở lên: Bắt buộc phải có người thân dưới 60 tuổi đi cùng và có giấy khám sức khỏe, không có bệnh lý nền nặng, do bác sĩ xác nhận và chấp thuận đi du lịch.

Giấy cam kết phải được ký bởi người thân và người đăng ký. Trong một số trường hợp đặc biệt, các tuyến có độ khó hoặc hiểm nguy thì Vietravel thường không nhận khách đã quá tuổi quy định.`
  },
  {
    question: 'Khách dưới 18 tuổi đăng ký tour thì cần điều kiện gì?',
    answer: `Quý khách dưới 18 tuổi phải có Bố/Mẹ hoặc người nhà trên 18 tuổi đi cùng. Trường hợp quý khách dưới 18 tuổi đi cùng người thân thì Bố & Mẹ phải ủy quyền (có xác nhận của chính quyền địa phương) cho người thân.`
  }
];

const HelpPage = () => {
  return (
    <div className="help-container">
      <h2 className="help-title">TRỢ GIÚP</h2>
      <div className="help-content">
        {helpData.map((item, index) => (
          <details key={index} className="help-item">
            <summary className="help-question">{item.question}</summary>
            <p className="help-answer">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
};

export default HelpPage;
