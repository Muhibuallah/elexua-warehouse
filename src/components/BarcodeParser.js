
export function parseBarcode(code){
  if(!code) return null;

  const parts=code.split("-");
  return {
    secretCode: parts[0] || "",
    supplierArticleId: parts[1] || "",
    boxLabel: parts[2] || ""
  };
}
