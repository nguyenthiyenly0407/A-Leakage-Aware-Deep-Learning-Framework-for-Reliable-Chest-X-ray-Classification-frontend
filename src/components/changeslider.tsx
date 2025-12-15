import { useState, useEffect } from "react";

export function ChangeSlider() {
  const [progressLeft, setProgressLeft] = useState(0);
  const [progressRight, setProgressRight] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const [showParagraphLeft, setShowParagraphLeft] = useState(false);
  const [showParagraphRight, setShowParagraphRight] = useState(false);

  useEffect(() => {
    // Giả lập tiến trình của thanh bên trái
    const intervalLeft = setInterval(() => {
      setProgressLeft((prev) => {
        if (prev >= 100) {
          clearInterval(intervalLeft);
          setShowImage(true); // Đổi ảnh khi thanh bên trái hoàn tất
          setShowParagraphLeft(true); // Mở thẻ <p> bên trái
          setShowParagraphRight(false); // Đóng thẻ <p> bên phải
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // Giả lập tiến trình của thanh bên phải
    const intervalRight = setInterval(() => {
      setProgressRight((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRight);
          setShowImage(false); // Đổi ảnh khi thanh bên phải hoàn tất
          setShowParagraphRight(true); // Mở thẻ <p> bên phải
          setShowParagraphLeft(false); // Đóng thẻ <p> bên trái
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    return () => {
      clearInterval(intervalLeft);
      clearInterval(intervalRight);
    };
  }, []);

  return (
    <div>
      <div>
        <div style={{ width: `${progressLeft}%`, backgroundColor: "blue" }}>
          Thanh bên trái
        </div>
        {showParagraphLeft && <p>Thông tin thanh bên trái</p>}
      </div>
      <div>
        <div style={{ width: `${progressRight}%`, backgroundColor: "green" }}>
          Thanh bên phải
        </div>
        {showParagraphRight && <p>Thông tin thanh bên phải</p>}
      </div>
      {showImage && <img src="./images/2.png" alt="Đổi ảnh" />}
    </div>
  );
}
