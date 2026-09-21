"use client";

export const generateCSVContent = (rows: any[]) => {
  if (!rows || !rows.length) return "";
  
  const separator = ";";
  const keys = Object.keys(rows[0]);
  
  const header = keys.join(separator);
  
  const body = rows.map((row) =>
    keys.map((k) => {
      let cell = row[k] === null || row[k] === undefined ? "" : row[k];
      cell = cell.toString().replace(/"/g, '""');
      if (cell.search(/(" | ; | \n)/g) >= 0) cell = `"${cell}"`;
      return cell;
    }).join(separator)
  ).join("\n");

  return "\ufeff" + header + "\n" + body;
};

export const exportToCSV = (filename: string, rows: any[]) => {
  const csvContent = generateCSVContent(rows);
  if (!csvContent) return;
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const parseCSV = (csvText: string): any[] => {
  const cleanText = csvText.replace(/^\ufeff/, "");
  const lines = cleanText.split(/\r?\n/);
  if (lines.length < 2) return [];

  const firstLine = lines[0];
  const separator = firstLine.includes(";") ? ";" : ",";
  
  const headers = firstLine.split(separator);
  return lines.slice(1)
    .filter(line => line.trim() !== "")
    .map((line) => {
      const values = line.split(separator);
      return headers.reduce((obj: any, header, index) => {
        let val: any = values[index]?.replace(/^"|"$/g, "").trim();
        if (!isNaN(val) && val !== "") val = Number(val);
        obj[header.trim()] = val;
        return obj;
      }, {});
    });
};