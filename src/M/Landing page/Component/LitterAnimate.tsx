import { useEffect, useState } from "react";

const Words = [
  "إنشاء الخطط الشهرية والسنوية للتوعية الصحية",
  "إرسال التقارير الدورية عن أنشطة التوعية الصحية",
  "تسهيل وتنظيم الإنجازات الشهرية والسنوية للتوعية الصحية",
  "تطوير مواد تعليمية تفاعلية وجذابة",
  "تنظيم ورش عمل وندوات تثقيفية",
  "التعاون مع المدارس والمؤسسات الصحية",
  "استخدام وسائل التواصل الاجتماعي لنشر الوعي الصحي",
];

function LitterAnimate() {
  const [currentWord, setCurrentWord] = useState("");
  async function animateWords(index: number) {
    if (index < Words.length) {
      const word = Words[index];
      let i = 0;
      await new Promise((resolve) => {
        const timer = setInterval(() => {
          if (i < word.length) {
            setCurrentWord(word.slice(0, i + 1));
            i++;
          } else {
            clearInterval(timer);
            resolve(null);
          }
        }, 50);
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await new Promise((resolve) => {
        const timer = setInterval(() => {
          if (i >= 0) {
            setCurrentWord(word.slice(0, i + 1));
            i--;
          } else {
            clearInterval(timer);
            setCurrentWord("");
            resolve(null);
          }
        }, 50);
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  useEffect(() => {
    let currentIndex = 0;
    const loop = async () => {
      await animateWords(currentIndex);
      currentIndex = (currentIndex + 1) % Words.length;
      loop();
    };
    loop();
  }, []);
  return <span>{currentWord}</span>;
}

export default LitterAnimate;
