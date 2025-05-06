export function SkeletonLoader({ count = 3 }) {
  return (
    <div className="skeleton-loader-related">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-item">
          <div className="skeleton-content">
            <div className="skeleton-line skeleton-title"></div>
          </div>
          <div className="skeleton-icon"></div>
        </div>
      ))}
    </div>
  );
}
