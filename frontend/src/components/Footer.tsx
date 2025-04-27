export default function Footer() {
    return (
      <footer className="bg-yellow-400 text-black py-8 mt-12">
        <div className="container mx-auto px-4 max-w-[1200px] grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Về CMSStore</h3>
            <p>Chuyên cung cấp sản phẩm chất lượng với giá cả hợp lý.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Liên hệ</h3>
            <p>Email: contact@cmsstore.vn</p>
            <p>Hotline: 0123 456 789</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Chính sách</h3>
            <ul className="space-y-1">
              <li>Chính sách bảo hành</li>
              <li>Chính sách đổi trả</li>
              <li>Chính sách vận chuyển</li>
            </ul>
          </div>
        </div>
      </footer>
    );
  }
  