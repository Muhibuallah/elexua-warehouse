
export default function SidePreviewPanel({ item, onClose }) {
  if(!item) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[350px] bg-white shadow-xl z-40 p-4 overflow-y-auto">
      <button
        onClick={onClose}
        className="mb-4 text-sm text-gray-500"
      >
        Close
      </button>

      <h2 className="text-lg font-bold mb-2">
        {item.productName || item.boxLabel || "Record"}
      </h2>

      <pre className="text-xs bg-gray-100 p-2 rounded">
        {JSON.stringify(item,null,2)}
      </pre>
    </div>
  );
}
