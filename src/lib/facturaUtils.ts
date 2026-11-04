import { SolicitudServicioDatos } from "@/services/reservaService";

import isotipoInvertido from "@/assets/brand/isotipo-invertido.svg";
import logotipoInvertido from "@/assets/brand/logotipo-invertido.svg";

const crearHtmlFactura = (item: SolicitudServicioDatos): string => {
  const provNombre = item.proveedor
    ? `${item.proveedor.nombre} ${item.proveedor.apellido || ""}`.trim()
    : "Proveedor";

  let clienteNombre = "Cliente";
  let clienteEmail = item.cliente?.email || "";
  let clienteTelefono = item.cliente?.telefono || "";
  if (item.cliente) {
    clienteNombre = `${item.cliente.nombre} ${item.cliente.apellido || ""}`.trim();
  } else {
    try {
      const perfil = JSON.parse(localStorage.getItem("user_profile") || "{}");
      if (perfil.name) clienteNombre = perfil.name;
      if (perfil.email) clienteEmail = perfil.email;
      if (perfil.telefono) clienteTelefono = perfil.telefono;
    } catch {}
  }

  const numeroFactura = `INV-${String(item.id).padStart(6, "0")}`;
  const fecha = new Date().toLocaleDateString("es-CO", {
    year: "numeric", month: "long", day: "numeric",
  });
  const fechaServicio = item.fecha_completado
    ? new Date(item.fecha_completado).toLocaleDateString("es-CO", {
        year: "numeric", month: "long", day: "numeric",
      })
    : item.fecha;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; background:#fff; color:#1a1a2e; }
    .page { width:700px; background:#fff; }
    .header {
      background:#132651;
      padding:32px 40px 26px;
      color:#fff;
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
    }
    .brand-logo { display:flex; align-items:center; gap:8px; height:36px; }
    .brand-logo img { display:block; width:auto; }
    .brand-sub { font-size:12px; opacity:.8; margin-top:8px; }
    .invoice-meta { text-align:right; }
    .invoice-title { font-size:28px; font-weight:800; letter-spacing:-1px; }
    .invoice-num { font-size:14px; opacity:.85; margin-top:4px; }
    .invoice-date { font-size:12px; opacity:.7; margin-top:2px; }
    .status-badge {
      background:rgba(255,255,255,0.18);
      border:1.5px solid rgba(255,255,255,0.35);
      font-size:11px; font-weight:700;
      padding:4px 12px; border-radius:20px;
      margin-top:10px; display:inline-block;
      letter-spacing:.5px; text-transform:uppercase;
    }
    .body { padding:28px 40px; }
    .parties { display:flex; gap:16px; margin-bottom:24px; }
    .party { flex:1; background:#f4f6fb; border-radius:12px; padding:16px 18px; }
    .party-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#1a75ee; margin-bottom:6px; }
    .party-name { font-size:14px; font-weight:700; color:#1a1a2e; }
    .party-detail { font-size:12px; color:#64748b; margin-top:2px; }
    hr { border:none; border-top:1.5px solid #e8ecf4; margin:0 0 20px; }
    .section-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#1a75ee; margin-bottom:10px; }
    table { width:100%; border-collapse:collapse; margin-bottom:18px; }
    thead th { background:#f4f6fb; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#64748b; padding:9px 12px; text-align:left; }
    thead th:last-child { text-align:right; }
    tbody td { padding:12px 12px; font-size:13px; color:#1a1a2e; border-bottom:1px solid #f0f2f8; vertical-align:top; }
    tbody td:last-child { text-align:right; font-weight:600; }
    tbody tr:last-child td { border-bottom:none; }
    .details-box { background:#f4f6fb; border-radius:10px; padding:12px 16px; margin-bottom:20px; font-size:13px; color:#334155; line-height:1.6; }
    .detail-row { display:flex; justify-content:space-between; padding:3px 0; font-size:13px; }
    .detail-label { color:#64748b; }
    .detail-value { font-weight:500; color:#1a1a2e; }
    .total-box {
      background:linear-gradient(135deg,#132651 0%,#1a75ee 100%);
      border-radius:12px; padding:18px 22px;
      display:flex; justify-content:space-between; align-items:center;
      margin-bottom:24px; color:#fff;
    }
    .total-label { font-size:14px; font-weight:600; opacity:.9; }
    .total-amount { font-size:26px; font-weight:800; letter-spacing:-.5px; }
    .footer {
      background:#f4f6fb; padding:18px 40px;
      display:flex; justify-content:space-between; align-items:center;
      border-top:1.5px solid #e8ecf4;
    }
    .footer-note { font-size:11px; color:#94a3b8; }
    .footer-brand { font-size:13px; font-weight:700; color:#1a75ee; }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="brand-logo">
        <img src="${isotipoInvertido}" alt="" style="height:36px"/>
        <img src="${logotipoInvertido}" alt="LocalService" style="height:16px"/>
      </div>
      <div class="brand-sub">Plataforma de servicios locales</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">FACTURA</div>
      <div class="invoice-num">${numeroFactura}</div>
      <div class="invoice-date">Emitida el ${fecha}</div>
      <span class="status-badge">✓ Servicio Completado</span>
    </div>
  </div>

  <div class="body">
    <div class="parties">
      <div class="party">
        <div class="party-label">Cliente</div>
        <div class="party-name">${clienteNombre}</div>
        ${clienteEmail ? `<div class="party-detail">${clienteEmail}</div>` : ""}
        ${clienteTelefono ? `<div class="party-detail">${clienteTelefono}</div>` : ""}
      </div>
      <div class="party">
        <div class="party-label">Proveedor</div>
        <div class="party-name">${provNombre}</div>
        ${item.proveedor?.email ? `<div class="party-detail">${item.proveedor.email}</div>` : ""}
        ${item.proveedor?.telefono ? `<div class="party-detail">${item.proveedor.telefono}</div>` : ""}
      </div>
    </div>

    <hr/>

    <div class="section-title">Detalle del Servicio</div>
    <table>
      <thead>
        <tr>
          <th>Servicio</th>
          <th>Fecha</th>
          <th>Dirección</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${item.servicio?.nombre || "Servicio Personalizado"}</strong>
            ${item.servicio?.categoria ? `<br/><span style="color:#64748b;font-size:11px">${item.servicio.categoria}</span>` : ""}
          </td>
          <td>${fechaServicio}</td>
          <td>${item.direccion || "—"}</td>
          <td>${item.monto_cotizado || "—"}</td>
        </tr>
      </tbody>
    </table>

    ${item.descripcion ? `
    <div class="section-title">Descripción acordada</div>
    <div class="details-box">${item.descripcion}</div>
    ` : ""}

    ${item.detalles_cotizacion ? `
    <div class="section-title">Detalles de la cotización</div>
    <div class="details-box">${item.detalles_cotizacion}</div>
    ` : ""}

    <div class="section-title">Información adicional</div>
    <div class="details-box">
      ${item.tiempo_estimado ? `<div class="detail-row"><span class="detail-label">Tiempo estimado</span><span class="detail-value">${item.tiempo_estimado}</span></div>` : ""}
      ${item.garantia ? `<div class="detail-row"><span class="detail-label">Garantía</span><span class="detail-value">${item.garantia}</span></div>` : ""}
      ${item.hora ? `<div class="detail-row"><span class="detail-label">Hora del servicio</span><span class="detail-value">${item.hora}</span></div>` : ""}
      <div class="detail-row"><span class="detail-label">Referencia</span><span class="detail-value">${numeroFactura}</span></div>
    </div>

    <div class="total-box">
      <span class="total-label">Total Pagado</span>
      <span class="total-amount">${item.monto_cotizado || "—"}</span>
    </div>
  </div>

  <div class="footer">
    <div class="footer-note">Comprobante oficial de transacción realizada en LocalService.<br/>Gracias por usar nuestra plataforma.</div>
    <div class="footer-brand">LocalService</div>
  </div>
</div>
</body>
</html>`;
};

export const descargarFacturaPDF = async (item: SolicitudServicioDatos): Promise<void> => {
  const { default: jsPDF } = await import("jspdf");
  const { default: html2canvas } = await import("html2canvas");

  const contenedor = document.createElement("div");
  contenedor.style.cssText = "position:fixed;left:-9999px;top:0;width:700px;";
  contenedor.innerHTML = crearHtmlFactura(item);
  document.body.appendChild(contenedor);

  const pagina = contenedor.querySelector(".page") as HTMLElement;

  try {
    // Esperar a que carguen las imágenes del logo antes de capturar
    await Promise.all(
      Array.from(pagina.querySelectorAll("img")).map(img =>
        img.complete ? null : new Promise(resolve => { img.onload = img.onerror = resolve; })
      )
    );

    const canvas = await html2canvas(pagina, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });

    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pdfW / canvas.width, pdfH / canvas.height);
    const imgW = canvas.width * ratio;
    const imgH = canvas.height * ratio;
    const offsetX = (pdfW - imgW) / 2;
    const offsetY = (pdfH - imgH) / 2;

    pdf.addImage(imgData, "PNG", offsetX, offsetY, imgW, imgH);
    pdf.save(`Factura-${String(item.id).padStart(6, "0")}.pdf`);
  } finally {
    document.body.removeChild(contenedor);
  }
};
