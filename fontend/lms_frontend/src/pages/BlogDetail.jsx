import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const blogData = {
  "ux-ui": {
    title: "Why UX/UI Design Matters in Modern Product Development",
    author: "Lina",
    img: "https://img.freepik.com/free-vector/gradient-ui-ux-background_23-2149052117.jpg?semt=ais_hybrid&w=1400&q=80",
    content: `
UX/UI design plays a crucial role in building digital products that are intuitive,
visually appealing, and user-centered. A well-designed interface improves user retention,
brand trust, and overall product success.

UX focuses on how a product works, while UI focuses on how it looks.
Together, they create seamless digital experiences.

Modern UX/UI design involves user research, usability testing, interaction design,
wireframing, prototyping, and visual design.

With thousands of apps competing for attention, good design is no longer optional —
it’s essential.
    `,
    tags: ["design", "ui/ux", "mobile", "trending"],
  },

  react: {
    title: "Why React Is Still the Most Popular Frontend Framework",
    author: "Lina",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80",
    content: `
React remains the leading JavaScript library for building user interfaces due to its component-based architecture,
virtual DOM, and a huge ecosystem. Developers can build reusable UI components, manage state efficiently,
and scale apps from small prototypes to large production systems.

Key strengths include:
- Component reusability and composition
- Rich ecosystem (routing, state, forms, testing)
- Great developer experience (tools, devtools, community)
- Wide adoption across startups and enterprises
    `,
    tags: ["react", "frontend", "javascript"],
  },

  php: {
    title: "Is PHP Still Worth Learning in 2025?",
    author: "Lina",
    img: "https://tse4.mm.bing.net/th/id/OIP.haot_Z24O7l7b_SmDt_V1QHaFj?pid=Api&P=0&h=1024",
    content: `
PHP continues to power a large portion of the web — from CMS platforms like WordPress to full-featured frameworks like Laravel.
Modern PHP is performant, secure, and developer-friendly with tools for testing, dependency management, and modern syntax.

Use-cases:
- Content-heavy sites (WordPress)
- Rapid backend development with frameworks (Laravel, Symfony)
- APIs & server-side rendering
    `,
    tags: ["php", "backend", "laravel"],
  },

  javascript: {
    title: "Why JavaScript Will Always Be the Language of the Web",
    author: "Lina",
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=80",
    content: `
JavaScript is the foundation of interactive web applications. Over the years it has evolved beyond the browser:
Node.js runs servers, frameworks like React/Vue/Angular power frontends, and tooling has matured to enable large-scale apps.

Strengths:
- Universal runtime (browser + server)
- Large ecosystem (NPM)
- Fast iteration and many frameworks/tools
    `,
    tags: ["javascript", "web dev", "programming"],
  },
};

const relatedBlogs = [
  {
    img: "https://tse1.mm.bing.net/th/id/OIP.Ns0hzsNAINabHxLIwUU0QgHaD4?pid=Api&P=0&h=220",
    title:
      "Class adds $30 million to its balance sheet for a Zoom-friendly edtech solution",
    description:
      "Class integrates seamlessly with Zoom to enhance virtual classrooms.",
    author: "Lina",
    views: "251,232",
  },
  {
    img: "https://tse1.mm.bing.net/th/id/OIP.17MVddEzJthuGfBV17pk3wHaEK?pid=Api&P=0&h=220",
    title: "Remote Learning 2.0: How Teachers Are Reinventing Online Education",
    description:
      "Educators are transforming online learning with new tools for 2025.",
    author: "Lina",
    views: "198,541",
  },
];

export default function BlogDetail() {
  const { category } = useParams();
  const blog = blogData[category];

  if (!blog) return <h1 className="text-center mt-20">Blog not found</h1>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      {/* HERO FIGURE */}
      <figure className="relative w-full h-[650px] overflow-hidden">
        <img
          src={blog.img}
          alt={blog.title}
          className="w-full h-full object-cover object-center"
        />

        {/* gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />

        <figcaption className="absolute bottom-8 left-8 text-white text-2xl md:text-3xl font-semibold drop-shadow-lg">
          {blog.title}
        </figcaption>
      </figure>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 bg-white rounded-xl shadow-xl -mt-28 relative z-10">
        <div className="md:flex md:gap-10">
          {/* main article */}
          <article className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-[#132742] mb-6">
              {blog.title}
            </h1>

            <p className="text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-line mb-8">
              {blog.content}
            </p>

            {/* tags */}
            <div className="flex flex-wrap gap-3 mb-10">
              {blog.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* author */}
            <div className="flex items-center gap-4 border-t pt-6">
              <img
                src="https://i.pravatar.cc/40?img=47"
                className="w-14 h-14 rounded-full"
                alt={blog.author}
              />
              <div>
                <p className="font-semibold text-lg">{blog.author}</p>
                <p className="text-sm text-gray-500">Writer</p>
              </div>
            </div>
          </article>

          
        </div>

        {/* Related Blogs */}
        <section className="py-12 mt-14 bg-[#eaf5ff] rounded-xl">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Related Blog</h2>
              <a className="text-[#00b6b6] font-semibold text-sm hover:underline">See all</a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedBlogs.map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:-translate-y-1 transition"
                >
                  <img src={item.img} className="w-full h-56 object-cover" alt={item.title} />
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>

                    <div className="flex items-center gap-2 mb-3">
                      <img src="https://i.pravatar.cc/40?img=47" className="w-8 h-8 rounded-full" alt={item.author} />
                      <span className="font-medium text-gray-700 text-sm">{item.author}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <a className="text-[#00b6b6] font-semibold hover:underline">Read more</a>
                      <span className="flex items-center gap-1">👁 {item.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
