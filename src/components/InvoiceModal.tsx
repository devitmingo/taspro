"use client";

import React, { useRef, useState } from "react";
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  MapPin,
  ShieldCheck,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  RefreshCw,
} from "lucide-react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: "estimate" | "invoice";
  booking: any;
  bookingDetails: any;
  customerAddress?: any;
  profile?: any;
}

function numberToWords(amount: number): string {
  if (!amount || amount <= 0) return "Zero Rupees Only";
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const numToWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : " ");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        "Hundred " +
        (n % 100 !== 0 ? "and " + numToWords(n % 100) : "")
      );
    if (n < 100000)
      return (
        numToWords(Math.floor(n / 1000)) +
        "Thousand " +
        (n % 1000 !== 0 ? numToWords(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        numToWords(Math.floor(n / 100000)) +
        "Lakh " +
        (n % 100000 !== 0 ? numToWords(n % 100000) : "")
      );
    return (
      numToWords(Math.floor(n / 10000000)) +
      "Crore " +
      (n % 10000000 !== 0 ? numToWords(n % 10000000) : "")
    );
  };

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let res = numToWords(rupees).trim() + " Rupees";
  if (paise > 0) {
    res += " and " + numToWords(paise).trim() + " Paise";
  }
  return res + " Only";
}

export default function InvoiceModal({
  isOpen,
  onClose,
  documentType,
  booking,
  bookingDetails,
  customerAddress,
  profile,
}: InvoiceModalProps) {
  if (!isOpen) return null;

  const bBooking = bookingDetails?.booking || booking;
  const bService = bookingDetails?.service_details;
  const bCustomer = bookingDetails?.customer_details;
  const bPayment = bookingDetails?.payment_summary;
  const bAdvance = bookingDetails?.advance_payment_summary;

  const bookingNo =
    bBooking?.booking_no ||
    (bBooking?.booking_id ? `TAS-${bBooking.booking_id}` : "ENQ-0042");

  const isInvoice = documentType === "invoice";
  const docTitle = isInvoice ? "TAX INVOICE" : "SERVICE ESTIMATE";
  const docNumber = isInvoice
    ? `INV-${String(bookingNo).replace(/^TAS-/, "")}`
    : `EST-${String(bookingNo).replace(/^TAS-/, "")}`;

  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const scheduledDate =
    bBooking?.scheduled_at ||
    bBooking?.enquiry_date_time ||
    booking?.date ||
    "Tue, 3rd Nov 2026 (09:00 AM)";

  const customerName =
    bCustomer?.name ||
    customerAddress?.full_name ||
    profile?.name ||
    profile?.first_name ||
    "Amit";

  const customerPhone =
    bCustomer?.phone ||
    customerAddress?.contact_number ||
    profile?.mobile ||
    "+91 7812991993";

  const customerAddr =
    bCustomer?.address ||
    customerAddress?.address_line_1 ||
    "Home, 259, hirapur, Raipur, Chhattisgarh - 492099";

  const totalAmount = Number(
    bPayment?.total ??
    bAdvance?.total_balance ??
    booking?.total_amount ??
    booking?.price ??
    200
  );

  const totalPaid = Number(
    bAdvance?.advance_payment ??
    (isInvoice ? totalAmount : 0)
  );

  const balanceDue = Math.max(0, totalAmount - totalPaid);

  const serviceItems: any[] =
    bService?.items && bService.items.length > 0
      ? bService.items
      : [
          {
            subtitle: bService?.title || booking?.service || "AC Repair - Gas Filling",
            qty: 1,
            price: totalAmount,
            warranty_days: 30,
          },
        ];

  const spareItems: any[] = bookingDetails?.spare_details?.items || [];

  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    const element = document.getElementById("printable-invoice");
    if (!element) {
      window.print();
      return;
    }

    try {
      setIsPrinting(true);

      // Create isolated iframe for clean 1-page printing
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        window.print();
        setIsPrinting(false);
        return;
      }

      // Collect all page stylesheets (Tailwind / fonts / styles)
      const styles = Array.from(
        document.querySelectorAll("style, link[rel='stylesheet']")
      )
        .map((el) => el.outerHTML)
        .join("\n");

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${isInvoice ? "Tax Invoice" : "Service Estimate"} - ${docNumber}</title>
            ${styles}
            <style>
              @page {
                size: A4 portrait;
                margin: 6mm 8mm;
              }
              html, body {
                background: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              #printable-invoice {
                border: none !important;
                box-shadow: none !important;
                padding: 12px !important;
                max-width: 100% !important;
                width: 100% !important;
                margin: 0 auto !important;
              }
              .no-print {
                display: none !important;
              }
            </style>
          </head>
          <body>
            ${element.outerHTML}
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          setIsPrinting(false);
        }, 1500);
      }, 400);
    } catch (err) {
      console.error("Print error:", err);
      window.print();
      setIsPrinting(false);
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById("printable-invoice");
    if (!element) return;

    try {
      setIsDownloading(true);

      // Clone element into offscreen container with fixed desktop A4 width (794px at 96 DPI)
      // This prevents responsive collapse or distortion on mobile/tablet viewports
      const clone = element.cloneNode(true) as HTMLElement;
      clone.id = "printable-invoice-pdf-clone";
      clone.style.width = "794px";
      clone.style.maxWidth = "794px";
      clone.style.minWidth = "794px";
      clone.style.padding = "28px 32px";
      clone.style.margin = "0";
      clone.style.background = "#ffffff";
      clone.style.boxSizing = "border-box";
      clone.style.position = "fixed";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.zIndex = "-9999";
      clone.style.borderRadius = "0";
      clone.style.border = "none";
      clone.style.boxShadow = "none";

      document.body.appendChild(clone);

      // @ts-ignore
      const html2pdfModule: any = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const filename = `${isInvoice ? "Tax_Invoice" : "Service_Estimate"}_${docNumber || "TAS"}.pdf`;

      const opt = {
        margin: [6, 6, 6, 6] as [number, number, number, number],
        filename: filename,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          scrollX: 0,
          windowWidth: 1024,
        },
        jsPDF: { unit: "mm" as const, format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(clone).save();
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
    } catch (err) {
      console.error("PDF generation error, attempting direct download link:", err);
      const existingClone = document.getElementById("printable-invoice-pdf-clone");
      if (existingClone && document.body.contains(existingClone)) {
        document.body.removeChild(existingClone);
      }
      // Fallback: If backend invoice link exists, trigger direct download
      if (isInvoice && bookingDetails?.invoice) {
        const link = document.createElement("a");
        link.href = bookingDetails.invoice;
        link.download = `Invoice_${docNumber || "TAS"}.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Print styles injected for clean A4 printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6A00] flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 leading-tight">
                  {isInvoice ? "Tax Invoice Preview" : "Service Estimate Preview"}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${
                    isInvoice
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {isInvoice ? "Official Receipt" : "Quotation"}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                Ref: <span className="font-mono text-gray-700 font-semibold">{docNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isPrinting || isDownloading}
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg border border-gray-300 hover:bg-white text-gray-700 hover:text-gray-900 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-60"
              title="Print document"
            >
              {isPrinting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-600" />
              ) : (
                <Printer className="w-3.5 h-3.5 text-gray-600" />
              )}
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              disabled={isPrinting || isDownloading}
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-[#FF6A00] hover:bg-[#e55f00] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-60"
              title="Download PDF"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-200/80 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Invoice Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">
          <div
            id="printable-invoice"
            className="bg-white rounded-xl border border-gray-200 p-6 sm:p-9 shadow-xs text-gray-800 space-y-6 text-xs max-w-2xl mx-auto"
          >
            {/* Header: Company Logo & Document Meta */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-200">
              <div className="space-y-1.5 max-w-sm">
                <img
                  src="/tas.logo.png"
                  alt="TASpro Company"
                  crossOrigin="anonymous"
                  className="h-9 w-auto object-contain mb-2"
                />
                <h4 className="font-extrabold text-sm text-gray-950 uppercase tracking-tight">
                  TASPRO SERVICE INDIA PVT. LTD.
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Office No. 201, Atlantis Corporate Park Ring Road No.1, Telebandha, Raipur, Chhattisgarh - 492001
                </p>
                <div className="text-[11px] text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
                  <span><strong>Tel:</strong> +91 7447-0000-45</span>
                  <span><strong>Email:</strong> info@tascompany.in</span>
                </div>
                <div className="text-[10px] text-gray-400 flex flex-wrap gap-x-3 gap-y-0.5 font-mono pt-0.5">
                  <span><strong>GSTIN:</strong> 22AAAAA0000A1Z5</span>
                  <span><strong>PAN:</strong> ABCDE1234F</span>
                  <span><strong>CIN:</strong> U52100CT2023PTC015123</span>
                </div>
              </div>

              <div className="sm:text-right space-y-1.5 shrink-0">
                <div
                  className={`inline-block px-3 py-1 rounded-lg text-sm font-black tracking-wider uppercase border ${
                    isInvoice
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-orange-50 text-orange-800 border-orange-300"
                  }`}
                >
                  {docTitle}
                </div>
                <div className="text-[11px] text-gray-500 font-medium">
                  {isInvoice ? "Original for Recipient" : "Cost Estimate / Quotation"}
                </div>
                <div className="space-y-0.5 pt-1 text-[11px]">
                  <p>
                    <span className="text-gray-400 font-medium">Doc No: </span>
                    <strong className="font-mono text-gray-900">{docNumber}</strong>
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">Date: </span>
                    <strong className="text-gray-800">{todayFormatted}</strong>
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">Booking ID: </span>
                    <strong className="font-mono text-gray-800">{bookingNo}</strong>
                  </p>
                  <p>
                    <span className="text-gray-400 font-medium">Payment: </span>
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded font-bold text-[10px] ${
                        balanceDue === 0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {balanceDue === 0 ? "PAID" : "PENDING"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Billed To / Service Location & Booking Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-b border-gray-100">
              <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Billed To / Customer Details
                </span>
                <p className="font-extrabold text-sm text-gray-900">{customerName}</p>
                <p className="text-[11px] text-gray-600 leading-snug">{customerAddr}</p>
                <p className="text-[11px] text-gray-600 font-medium pt-0.5">
                  <strong>Phone:</strong> {customerPhone}
                </p>
                {bCustomer?.email && (
                  <p className="text-[11px] text-gray-500">
                    <strong>Email:</strong> {bCustomer.email}
                  </p>
                )}
                {bookingDetails?.gst_details?.gst_number && (
                  <p className="text-[10px] font-mono text-gray-600 pt-0.5">
                    <strong>Customer GSTIN:</strong> {bookingDetails.gst_details.gst_number}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Service &amp; Job Details
                  </span>
                  <p className="text-[11px]">
                    <span className="text-gray-500">Payment Mode: </span>
                    <strong className="text-gray-800">
                      {bookingDetails?.payment_method || (isInvoice ? "Online (Razorpay)" : "Pay on Service / COD")}
                    </strong>
                  </p>
                  <p className="text-[11px]">
                    <span className="text-gray-500">Place of Supply: </span>
                    <strong className="text-gray-800">Raipur, Chhattisgarh (22)</strong>
                  </p>
                </div>

                {/* Warranty Badge matching reference image */}
                <div className="pt-1">
                  <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-white rounded-xl border border-gray-300 shadow-2xs">
                    <svg
                      className="w-5 h-5 text-gray-800 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <div className="w-[1.5px] h-6 bg-gray-300 shrink-0" />
                    <div className="text-left">
                      <div className="text-[10px] font-bold text-gray-900 leading-tight">
                        Service Warranty
                      </div>
                      <div className="text-xs font-black text-gray-950 leading-tight">
                        {serviceItems[0]?.warranty_days || 30} Days
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="space-y-2">
              <h5 className="font-extrabold text-xs text-gray-900 uppercase tracking-wide">
                Services Rendered
              </h5>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100/80 text-gray-600 font-bold border-b border-gray-200 text-[11px]">
                      <th className="py-2.5 px-3 w-8">#</th>
                      <th className="py-2.5 px-3">Service &amp; Description</th>
                      <th className="py-2.5 px-3 text-center">Warranty</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">Discount</th>
                      <th className="py-2.5 px-3 text-right">GST (18%)</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[11px]">
                    {serviceItems.map((item: any, idx: number) => {
                      const itemPrice = Number(item.price || item.unit_price || 200);
                      const qty = Number(item.qty || 1);
                      const baseAmt = Math.round((itemPrice * qty) / 1.18);
                      const gstAmt = (itemPrice * qty) - baseAmt;

                      return (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-3 px-3 font-bold text-gray-400">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="font-extrabold text-gray-900">
                              {item.subtitle || item.title || "AC Repair Service"}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              Standard professional doorstep service
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center text-emerald-700 font-semibold">
                            {item.warranty_days || 30} Days
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-gray-800">
                            {qty}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-600 font-medium">
                            ₹{itemPrice.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-500">
                            -₹{(Number(bPayment?.item_discount || 0)).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-600">
                            ₹{(Number(bPayment?.taxes_and_fees || gstAmt)).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-gray-900">
                            ₹{(itemPrice * qty).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      );
                    })}

                    {spareItems.map((spare: any, idx: number) => (
                      <tr key={`spare-${idx}`} className="hover:bg-gray-50/50">
                        <td className="py-3 px-3 font-bold text-gray-400">
                          {serviceItems.length + idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-800">
                            {spare.subtitle || spare.name || "Spare Part"}
                          </div>
                          <div className="text-[10px] text-gray-500">Genuine replacement part</div>
                        </td>
                        <td className="py-3 px-3 text-center text-gray-600">30 Days</td>
                        <td className="py-3 px-3 text-center font-bold text-gray-800">
                          {spare.qty || 1}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-600 font-medium">
                          ₹{Number(spare.price || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-500">-</td>
                        <td className="py-3 px-3 text-right text-gray-600">Included</td>
                        <td className="py-3 px-3 text-right font-extrabold text-gray-900">
                          ₹{Number((spare.price || 0) * (spare.qty || 1)).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Breakdown & Amount in Words */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 items-start">
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100">
                  <span className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-wider block mb-0.5">
                    Amount in Words
                  </span>
                  <p className="font-bold text-xs text-gray-900 italic">
                    {numberToWords(totalAmount)}
                  </p>
                </div>

                <div className="space-y-1 text-[10px] text-gray-500">
                  <p className="font-bold text-gray-700">Terms &amp; Conditions:</p>
                  <ol className="list-decimal pl-4 space-y-0.5">
                    <li>30-day warranty applies strictly to service issues inspected &amp; fixed.</li>
                    <li>Payment receipts subject to bank realization in case of online transfer.</li>
                    <li>All legal disputes subject to Raipur (C.G.) jurisdiction only.</li>
                    <li>
                      {isInvoice
                        ? "This is a system-generated invoice and does not require a physical signature."
                        : "This is a system-generated estimate and does not require a physical signature."}
                    </li>
                  </ol>
                </div>
              </div>

              {/* Financial Box */}
              <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 text-xs">
                <div className="p-2.5 px-3.5 flex justify-between bg-gray-50/80">
                  <span className="text-gray-500 font-medium">Item Subtotal</span>
                  <span className="font-bold text-gray-800">
                    ₹{(Number(bPayment?.item_total || totalAmount)).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="p-2.5 px-3.5 flex justify-between">
                  <span className="text-gray-500 font-medium">Item Discount</span>
                  <span className="font-bold text-emerald-700">
                    -₹{(Number(bPayment?.item_discount || 0)).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="p-2.5 px-3.5 flex justify-between">
                  <span className="text-gray-500 font-medium">Taxes &amp; Fees (GST 18%)</span>
                  <span className="font-bold text-gray-800">
                    ₹{(Number(bPayment?.taxes_and_fees || 0)).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="p-3 px-3.5 flex justify-between bg-orange-50/40 text-sm">
                  <span className="font-extrabold text-gray-900">Total Amount</span>
                  <span className="font-black text-[#FF6A00]">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="p-2.5 px-3.5 flex justify-between bg-emerald-50/40 text-emerald-800 font-bold">
                  <span>Total Paid</span>
                  <span>₹{totalPaid.toLocaleString("en-IN")}</span>
                </div>

                <div className="p-2.5 px-3.5 flex justify-between bg-gray-50 text-gray-700 font-bold">
                  <span>Balance Due</span>
                  <span className={balanceDue > 0 ? "text-rose-600" : "text-emerald-700"}>
                    ₹{balanceDue.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer: Warranty Card & System Generated Notice */}
            <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="inline-flex items-center gap-3.5 px-4 py-2 bg-white rounded-xl border border-gray-300 shadow-2xs">
                <svg
                  className="w-6 h-6 text-gray-800 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <div className="w-[1.5px] h-7 bg-gray-300 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold text-gray-900 leading-tight">
                    Service Warranty
                  </div>
                  <div className="text-sm font-black text-gray-950 leading-tight">
                    {serviceItems[0]?.warranty_days || 30} Days
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-right space-y-1">
                <div className="font-serif italic text-gray-500 text-sm tracking-wide">
                  TASpro Service India Pvt. Ltd.
                </div>
                <div className="text-[10px] text-gray-500 font-medium leading-tight max-w-xs sm:text-right">
                  {isInvoice
                    ? "This is a system-generated invoice and does not require a physical signature."
                    : "This is a system-generated estimate and does not require a physical signature."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

