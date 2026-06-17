import html2canvas from 'html2canvas';

export async function exportElementAsImage(elementId: string, filename: string = 'balcony-layout.png'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#FEFAE0',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (e) {
    console.error('导出图片失败:', e);
    alert('导出失败，请重试');
  }
}

export function printElement(printAreaId: string, title: string = '养护表'): void {
  const element = document.getElementById(printAreaId);
  if (!element) {
    console.error('Element not found:', printAreaId);
    return;
  }

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('请允许弹出窗口以进行打印');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
          padding: 30px;
          color: #1f2937;
          line-height: 1.6;
        }
        h1 {
          color: #2D6A4F;
          border-bottom: 3px solid #2D6A4F;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        h2 {
          color: #40916C;
          margin-top: 24px;
          font-size: 18px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
        }
        th, td {
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          text-align: left;
          font-size: 14px;
        }
        th {
          background: #f0fdf4;
          color: #2D6A4F;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        .tag {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          margin-right: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 12px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>🌿 ${title}</h1>
      ${element.innerHTML}
      <div class="footer">
        阳台种植规划工具 | 打印时间：${new Date().toLocaleString('zh-CN')}
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
