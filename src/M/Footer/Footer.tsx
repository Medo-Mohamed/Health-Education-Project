function Footer() {
  return (
    <footer className="py-8 px-4 border-t-2 mt-1" dir="rtl">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* القسم الأول: عن الشركة */}
        <div>
          <h3 className="text-xl font-bold mb-4">شركتنا</h3>
          <p className="text-gray-400">
            نحن نقدم أفضل الحلول البرمجية باستخدام أحدث التقنيات العالمية.
          </p>
        </div>

        {/* القسم الثاني: روابط سريعة */}
        <div>
          <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-blue-400">
                الخصوصية
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                اتصل بنا
              </a>
            </li>
          </ul>
        </div>

        {/* القسم الثالث: التواصل الاجتماعي والظل (Drop Shadow) */}
        <div className="flex flex-col items-start">
          <h3 className="text-xl font-bold mb-4">تابعنا</h3>
          <div className="flex gap-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            {/* هنا تضع الـ SVGs الخاصة بك */}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Health Education Platform. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}

export default Footer;
