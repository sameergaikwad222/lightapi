import { useEffect, useMemo, useRef, useState } from "react";
import useRequestStore from "../../store/requestStore";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import { Copy, Clock3, Database, Download, File } from "lucide-react";
import {
  detectResponseFormat, getResponseHeader, htmlPreviewDocument, parseCsv,
  prettyXml, responseFilename, responseText,
} from "../../utils/response";

const VIEW_FORMATS = [
  ["auto", "Auto"], ["json", "JSON"], ["xml", "XML"], ["html", "HTML"],
  ["text", "Text"], ["csv", "CSV / TSV"], ["image", "Image"],
  ["audio", "Audio"], ["video", "Video"], ["binary", "File"],
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function MediaResponse({ blob, format }) {
  const mediaRef = useRef(null);
  const [failure, setFailure] = useState(null);
  const failed = failure === blob;

  useEffect(() => {
    const element = mediaRef.current;
    if (!element || !blob || failed) return;
    const url = URL.createObjectURL(blob);
    element.src = url;
    return () => {
      element.removeAttribute("src");
      URL.revokeObjectURL(url);
    };
  }, [blob, format, failed]);

  if (failed) return <p className="response-notice">This browser could not preview the {format}. Download the response to open it.</p>;
  const props = { ref: mediaRef, onError: () => setFailure(blob) };
  return (
    <div className="response-media">
      {format === "image" ? <img {...props} alt="Response image" /> :
        format === "audio" ? <audio {...props} controls aria-label="Audio response" /> :
          <video {...props} controls aria-label="Video response" />}
    </div>
  );
}

function ResponseViewer() {
  const { response, activeResponseTab, setActiveResponseTab, responseViewFormat, setResponseViewFormat } = useRequestStore();
  const [actionResult, setActionResult] = useState(null);
  const text = useMemo(() => response ? responseText(response) : "", [response]);
  const contentType = response?.contentType || getResponseHeader(response?.headers, "content-type");
  const detected = response?.format ?? detectResponseFormat(contentType, text, response?.data);
  const format = responseViewFormat === "auto" ? detected : responseViewFormat;
  const canPreview = format === "html" && text !== null;
  const tab = activeResponseTab === "preview" && !canPreview ? "body" : activeResponseTab;
  const headersText = useMemo(() => JSON.stringify(response?.headers ?? {}, null, 2), [response]);
  const blob = useMemo(() => {
    if (!response) return null;
    return response.blob ?? new Blob([text ?? ""], { type: contentType || "application/octet-stream" });
  }, [response, text, contentType]);
  const filename = response?.filename ?? responseFilename(response?.headers, detected, contentType);
  const size = response?.size ?? blob?.size ?? 0;

  const view = useMemo(() => {
    if (!response || text === null) return { text: "", error: "" };
    if (format === "json" && text.trim()) {
      try {
        const json = JSON.parse(text);
        return { json, text: JSON.stringify(json, null, 2), error: "" };
      } catch {
        return { text, error: "Invalid JSON. Showing the original response." };
      }
    }
    if (format === "xml" && text.trim()) return prettyXml(text);
    if (format === "csv" && text) {
      try {
        const delimiter = contentType.split(";")[0].toLowerCase() === "text/tab-separated-values" ? "\t" : ",";
        return { rows: parseCsv(text, delimiter), text, error: "" };
      } catch (error) { return { text, error: error.message }; }
    }
    return { text, error: "" };
  }, [response, text, format, contentType]);

  const raw = text ?? response?.hex ?? "Binary response. Download for the complete file.";
  const copyText = tab === "headers" ? headersText : tab === "raw" ? raw : view.text;
  const canCopy = tab === "headers" || tab === "raw" || text !== null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setActionResult({ response, message: "Copied." });
    } catch {
      setActionResult({ response, message: "Could not copy. Select the response text to copy it manually." });
    }
  };

  const handleDownload = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (!response) return (
    <div className="response-viewer">
      <div className="response-empty">Send a request to view the response.</div>
    </div>
  );

  function renderBody() {
    if (size === 0) return <p className="response-notice">This response has no body.</p>;
    if (["image", "audio", "video"].includes(format)) return <MediaResponse blob={blob} format={format} />;
    if (format === "binary" || text === null) return (
      <div className="response-file">
        <File size={32} />
        <strong>{filename}</strong>
        <span>{contentType || "Binary file"} · {formatBytes(size)}</span>
        <p>Download this file to open it.</p>
        <button type="button" className="copy-btn" onClick={handleDownload}><Download size={15} /> Download file</button>
      </div>
    );
    if (format === "json" && !view.error && text.trim()) return (
      <JsonView src={view.json} theme="atom" collapsed={false} enableClipboard={false}
        displayDataTypes={false} displayObjectSize={false} />
    );
    if (format === "csv" && view.rows?.length) {
      const [columns, ...rows] = view.rows;
      return (
        <div className="response-csv">
          <table>
            <caption>Response data</caption>
            <thead><tr>{columns.map((column, index) => <th key={index} scope="col">{column || `Column ${index + 1}`}</th>)}</tr></thead>
            <tbody>{rows.slice(0, 500).map((row, index) => (
              <tr key={index}>{Array.from({ length: Math.max(columns.length, row.length) }, (_, cell) => <td key={cell}>{row[cell] ?? ""}</td>)}</tr>
            ))}</tbody>
          </table>
          {rows.length > 500 && <p className="response-notice">Showing the first 500 of {rows.length.toLocaleString()} rows. Raw and Download include the complete response.</p>}
        </div>
      );
    }
    return (
      <>
        {view.error && <p className="response-notice" role="status">{view.error}</p>}
        <pre className={`response-source response-source-${format}`}>{view.text}</pre>
      </>
    );
  }

  return (
    <div className="response-viewer">
      <div className="response-header">
        <div className="response-meta">
          <span className={`status-badge ${response.status >= 400 || !response.status ? "status-error" : ""}`}>
            {response.status} {response.statusText}
          </span>
          <span className="meta-badge"><Clock3 size={15} />{response.time} ms</span>
          <span className="meta-badge"><Database size={15} />{formatBytes(size)}</span>
          <span className="response-content-type" title={contentType}>{contentType || detected.toUpperCase()}</span>
        </div>
        <div className="response-actions">
          <button type="button" className="copy-btn" onClick={handleCopy} disabled={!canCopy}
            title={canCopy ? "Copy the current response view" : "Use Download to save the binary response"}>
            <Copy size={15} />Copy
          </button>
          <button type="button" className="copy-btn" onClick={handleDownload}><Download size={15} />Download</button>
        </div>
      </div>

      <div className="response-tabs">
        {[["body", "Pretty"], ["headers", "Headers"], ["raw", "Raw"], ...(canPreview ? [["preview", "Preview"]] : [])].map(([id, label]) => (
          <button type="button" key={id} className={tab === id ? "active" : ""}
            aria-pressed={tab === id} onClick={() => setActiveResponseTab(id)}>{label}</button>
        ))}
        <label className="response-format-label" htmlFor="response-view-format">View as</label>
        <select id="response-view-format" value={responseViewFormat} onChange={event => setResponseViewFormat(event.target.value)}>
          {VIEW_FORMATS.map(([value, label]) => (
            <option key={value} value={value} disabled={
              ["json", "xml", "html", "text", "csv"].includes(value) ? text === null :
                ["image", "audio", "video"].includes(value) ? detected !== value : false
            }>{value === "auto" ? `Auto (${detected === "binary" ? "File" : detected.toUpperCase()})` : label}</option>
          ))}
        </select>
      </div>

      {actionResult?.response === response && <p className="response-action-message" role="status">{actionResult.message}</p>}

      <div className={`response-content ${tab === "preview" ? "response-preview-content" : ""}`}>
        {tab === "body" && renderBody()}
        {tab === "headers" && <pre>{headersText}</pre>}
        {tab === "raw" && (size === 0 ? <p className="response-notice">This response has no body.</p> : <pre className="response-source">{raw}</pre>)}
        {tab === "preview" && <iframe title="HTML response preview" sandbox="" referrerPolicy="no-referrer" srcDoc={htmlPreviewDocument(text)} />}
      </div>
    </div>
  );
}

export default ResponseViewer;
