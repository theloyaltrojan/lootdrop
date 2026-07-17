export default function Skeleton({ count = 8 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="skeleton">
      <div className="sk-thumb" />
      <div className="sk-line" style={{ width: "70%" }} />
      <div className="sk-line" style={{ width: "40%" }} />
      <div
        className="sk-line"
        style={{ width: "90%", height: 36, marginTop: 24 }}
      />
    </div>
  ));
}
