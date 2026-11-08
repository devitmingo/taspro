declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | [number, number] | [number, number, number, number];
    filename?: string;
    image?: { type?: string; quality?: number };
    enableLinks?: boolean;
    html2canvas?: any;
    jsPDF?: any;
  }

  interface Html2PdfInstance {
    from(element: HTMLElement | string): Html2PdfInstance;
    set(opt: Html2PdfOptions): Html2PdfInstance;
    save(): Promise<void>;
    outputPdf(type?: string): Promise<any>;
    outputImg(type?: string): Promise<any>;
    then(callback?: (pdf: any) => void): Promise<any>;
  }

  function html2pdf(): Html2PdfInstance;
  function html2pdf(element: HTMLElement | string, opt?: Html2PdfOptions): Promise<void>;

  export default html2pdf;
}

