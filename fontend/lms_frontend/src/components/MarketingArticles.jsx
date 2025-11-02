import img1 from "../assets/article1.png";
import img2 from "../assets/article2.jpeg";
import img3 from "../assets/article3.jpg";
import img4 from "../assets/article4.jpg";

const MarketingArticles = () => {
  const articles = [
    {
      image: img1,
      category: "Remote Learning",
      duration: "3 Months",
      title: "Master Remote Learning: 7 Pro Strategies for Success",
      description:
        "Unlock your full potential studying from home — learn how to beat distractions, structure your day, and stay motivated as you progress.",
      author: "Lina",
      oldPrice: "$100",
      price: "$80",
    },
    {
      image: img2,
      category: "Web Development",
      duration: "2 Months",
      title: "Jumpstart Your React Skills: Build Real-World Projects",
      description:
        "Jump into modern web development with React — step-by-step guides, practical tips, and a hands-on project to reinforce your learning.",
      author: "Lina",
      oldPrice: "$120",
      price: "$100",
    },
    {
      image: img3,
      category: "Backend Development",
      duration: "3 Months",
      title: "PHP 8 Deep Dive: What Every Back-End Developer Should Know",
      description:
        "Discover the power of PHP 8 — new features, best practices, and how to upgrade your existing projects with confidence.",
      author: "Lina",
      oldPrice: "$90",
      price: "$70",
    },
    {
      image: img4,
      category: "JavaScript",
      duration: "2 Months",
      title: "Modern JavaScript: ES2024 Techniques You’ll Actually Use",
      description:
        "Stay ahead of the curve with the latest JavaScript enhancements — learn how to apply ES2024 syntax, optimize performance, and write cleaner code.",
      author: "Lina",
      oldPrice: "$110",
      price: "$90",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Marketing Articles</h2>
          <a href="#" className="text-[#00b6b6] font-semibold hover:underline">
            See all
          </a>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((article, i) => (
            <div
              key={i}
              className="bg-white shadow-md rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-gray-500 text-sm">
                  <span>{article.category}</span>
                  <span>{article.duration}</span>
                </div>
                <h3 className="font-bold text-lg text-[#132742] leading-snug hover:text-[#00b6b6] transition-all">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm">{article.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <img
                      src="https://i.pravatar.cc/40?img=5"
                      alt={article.author}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-gray-800 text-sm font-medium">
                      {article.author}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 space-x-1">
                    <span className="line-through">{article.oldPrice}</span>
                    <span className="text-[#00b6b6] font-bold">
                      {article.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketingArticles;
