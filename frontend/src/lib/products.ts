import { db } from "../lib/db";

interface Product {
  id: number;
  name: string;
  price: string;
  is_featured: number;
  images: string[];
}

export async function getFeaturedProducts() {
  try {
    const res = await fetch('http://localhost:5000/api/products', {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();

    // Lọc sản phẩm nổi bật
    const featured = data.filter((product: any) => product.is_featured === 1);
    return featured;
  } catch (error) {
    console.error('Lỗi lấy sản phẩm nổi bật:', error);
    return [];
  }
}

export async function getAllProducts() {
  try {
    const res = await fetch('http://localhost:5000/api/products', {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error('Failed to fetch products:', res.status);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getCategoriesWithProducts() {
  const res = await fetch("http://localhost:5000/api/categories");
  const categories = await res.json();

  const categoriesWithProducts = await Promise.all(
    categories.map(async (category: any) => {
      const res = await fetch(`http://localhost:5000/api/products?category_id=${category.id}`);
      const products = await res.json();
      return {
        category,
        products,
      };
    })
  );

  return categoriesWithProducts;
}

export async function searchProducts(query: string) {
  try {
    // Sử dụng `rows` để lấy kết quả của truy vấn (mảng dữ liệu)
    const [rows] = await db.query(
      'SELECT * FROM products WHERE name LIKE ?',
      [`%${query}%`]
    );

    // Kiểm tra `rows` có phải là mảng không
    if (Array.isArray(rows)) {
      return rows.map((row: any) => ({
        ...row,
        images: JSON.parse(row.images || "[]"),
      }));
    }
    
    // Nếu không phải mảng, trả về mảng rỗng hoặc giá trị mặc định
    return [];
  } catch (error) {
    console.error('Lỗi khi tìm kiếm sản phẩm:', error);
    return [];
  }
}

export const getFilteredProducts = async (categoryId: string, priceRange: string) => {
  const res = await fetch(`/api/products?category_id=${categoryId}&priceRange=${priceRange}`);
  const products = await res.json();
  return products;
};

export async function getCategories() {
  const res = await fetch('http://localhost:5000/api/categories');
  const categories = await res.json();
  return categories;
}


