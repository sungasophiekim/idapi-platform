export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 bg-green-deep rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto mb-3 animate-pulse">ID</div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
