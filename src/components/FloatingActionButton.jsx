
export default function FloatingActionButton({ onClick }){
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg text-2xl"
    >
      +
    </button>
  );
}
