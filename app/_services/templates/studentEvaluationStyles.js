

export const studentEvaluationStyles = `<style>
      @page { size: A4; margin: 30px 45px; }
      body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1c1917; }
 
      /* Repeating-header table: thead re-prints at the top of every
         printed page; each tbody row is an unbreakable content chunk. */
      table.doc { width: 100%; border-collapse: collapse; table-layout: fixed; }
      table.doc > thead { display: table-header-group; }
      table.doc td.header-cell { padding: 0 0 16px 0; }
      table.doc td.content-cell { padding: 0; page-break-inside: avoid; break-inside: avoid; }
 
      .header { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }
      .header img.logo { width: 60px; height: 60px; flex-shrink: 0; }
      .header-text { flex: 1; }
      .header-text .uni-name {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 15px;
        font-weight: bold;
        color: #7f1d1d;
        letter-spacing: 0.3px;
        margin: 0 0 2px 0;
        border-bottom: 1.5px solid #7f1d1d;
        display: inline-block;
        padding-bottom: 1px;
      }
      .header-text .dept-name {
        font-size: 11.5px;
        margin: 3px 0 0 0;
        letter-spacing: 0.5px;
      }
      .header-rule { border: none; border-top: 2px solid #7f1d1d; margin: 4px 0 16px 0; }
 
      .date-row { text-align: right; margin-bottom: 16px; font-size: 11px; }
 
      .meta { margin-bottom: 14px; }
      .meta p { margin: 3px 0; }
      .blank-line {
        display: inline-block;
        min-width: 320px;
        border-bottom: 1px solid #1c1917;
        height: 12px;
      }
 
      .instruction { font-size: 10.5px; margin-bottom: 10px; }
 
      table.scale { border-collapse: collapse; width: 60%; margin-bottom: 18px; font-size: 10.5px; }
      table.scale th, table.scale td { border: 1px solid #1c1917; padding: 3px 10px; text-align: center; }
      table.scale th { background: #f5f5f4; }
 
      .evaluation-heading { text-align: center; font-weight: bold; font-size: 13px; margin: 14px 0; }
 
      .section { margin-bottom: 10px; page-break-inside: avoid; }
      .section-title { font-weight: bold; font-size: 11px; margin-bottom: 4px; }
      .item-row { display: flex; align-items: baseline; gap: 6px; margin: 2px 0 2px 14px; }
      .item-letter { width: 14px; flex-shrink: 0; }
      .item-label { flex-shrink: 0; }
      .item-line {
        flex: 1;
        text-align: right;
        border-bottom: 1px dotted #1c1917;
        margin: 0 4px 0 6px;
        padding-right: 6px;
        font-weight: bold;
      }
 
      .remarks { margin-top: 16px; }
      .remarks-title { font-weight: bold; font-size: 11px; margin-bottom: 4px; }
      .remarks-line { border-bottom: 1px solid #1c1917; height: 16px; margin-top: 4px; }
 
      .sign-heading { text-align: right; font-weight: bold; font-size: 11px; margin-top: 50px; margin-bottom: 30px; }
      .sign { display: flex; justify-content: space-between; gap: 40px; }
      .sign-block { text-align: center; flex: 1; }
      .sign-line { border-bottom: 1px solid #1c1917; height: 30px; }
      .sign-label { font-size: 10px; margin-top: 4px; }
    </style>`;
