import { useNavigate } from "react-router-dom";

const readingList = [
  {
    img: "https://tse2.mm.bing.net/th/id/OIP.eS8QHgg0gqBiOtH_v6uj5wHaE0?pid=Api&P=0&h=220",
    title: "UX/UI",
  },
  {
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    title: "React",
  },
  {
    img: "https://tse4.mm.bing.net/th/id/OIP.haot_Z24O7l7b_SmDt_V1QHaFj?pid=Api&P=0&h=220",
    title: "PHP",
  },
  {
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    title: "JavaScript",
  },
];

const relatedBlogs = [
  {
    img: "https://tse1.mm.bing.net/th/id/OIP.Ns0hzsNAINabHxLIwUU0QgHaD4?pid=Api&P=0&h=220",
    title:
      "Class adds $30 million to its balance sheet for a Zoom-friendly edtech solution",
    description:
      "Class, launched less than a year ago by Blackboard co-founder Michael Chasen, integrates seamlessly with Zoom to enhance virtual classrooms.",
    author: "Lina",
    views: "251,232",
  },
  {
    img: "https://tse1.mm.bing.net/th/id/OIP.17MVddEzJthuGfBV17pk3wHaEK?pid=Api&P=0&h=220",
    title:
      "Remote Learning 2.0: How Teachers Are Reinventing Online Education",
    description:
      "Discover how educators are transforming online learning with new digital tools and interactive teaching models for 2025.",
    author: "Lina",
    views: "198,541",
  },
];

const BlogSections = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    // Navigate to a category page (or use filtering)
    navigate(`/blog?category=${category.toLowerCase()}`);
  };

  return (
    <>
      {/* Reading Blog List */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Reading blog list
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {readingList.map((item, i) => (
              <div
                key={i}
                onClick={() => handleCategoryClick(item.title)}
                className="relative rounded-2xl overflow-hidden shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-white/80 text-gray-900 font-semibold px-3 py-1 rounded-md text-sm">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Blog */}
      <section className="py-20 bg-[#eaf5ff]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Related Blog</h2>
            <a
              href="#"
              className="text-[#00b6b6] font-semibold hover:underline text-sm"
            >
              See all
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedBlogs.map((blog, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:-translate-y-1 transition-transform duration-300"
              >
                <img
                  src={blog.img}
                  alt={blog.title}
                  className="w-full h-60 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2">
                    {blog.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <img
                      src="https://i.pravatar.cc/40?img=47"
                      alt={blog.author}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-gray-700 font-medium text-sm">
                      {blog.author}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {blog.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <a
                      href="#"
                      className="text-[#00b6b6] font-semibold hover:underline"
                    >
                      Read more
                    </a>
                    <span className="flex items-center space-x-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.008 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.01-9.964-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{blog.views}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination arrows */}
          <div className="flex justify-end mt-8 space-x-3">
            <button className="bg-[#00b6b6]/10 text-[#00b6b6] p-2 rounded-md hover:bg-[#00b6b6]/20">
              ‹
            </button>
            <button className="bg-[#00b6b6]/10 text-[#00b6b6] p-2 rounded-md hover:bg-[#00b6b6]/20">
              ›
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogSections;
