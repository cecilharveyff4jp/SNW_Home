const EDIT_PASSWORD = "snow1234";
const SPREADSHEET_ID = "1E3snSo7vzpdcTLkRqJFDlgDK3GZ3IuJYehspN95AgvQ";

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getMap') {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const metaSheet = ss.getSheetByName('meta');
    const objectsSheet = ss.getSheetByName('objects');
    
    // メタデータを取得（key-value形式）
    const metaData = metaSheet.getDataRange().getValues();
    const meta = {};
    
    // key-value形式で読み込み（A列=key, B列=value）
    for (let i = 1; i < metaData.length; i++) {
      if (metaData[i][0]) {
        meta[metaData[i][0]] = metaData[i][1];
      }
    }
    
    const output = {
      ok: true,
      meta: {
        cols: Number(meta.cols) || 60,
        rows: Number(meta.rows) || 40,
        cellSize: Number(meta.cellSize) || 24,
        mapName: meta.mapName || "SNW Map",
        bgImage: meta.bgImage || "map-bg.jpg",
        bgCenterX: Number(meta.bgCenterX) || 50,
        bgCenterY: Number(meta.bgCenterY) || 50,
        bgScale: Number(meta.bgScale) || 1.0,
        bgOpacity: Number(meta.bgOpacity) || 1.0
      },
      objects: []
    };
    
    // オブジェクトデータを取得（ヘッダー行をスキップ）
    const objectsData = objectsSheet.getDataRange().getValues();
    for (let i = 1; i < objectsData.length; i++) {
      if (objectsData[i][0]) {
        output.objects.push({
          id: objectsData[i][0],
          type: objectsData[i][1],
          label: objectsData[i][2],
          x: objectsData[i][3],
          y: objectsData[i][4],
          w: objectsData[i][5],
          h: objectsData[i][6],
          birthday: objectsData[i][7] || '',  // 8列目（birthday）
          note: objectsData[i][8] || '',  // 9列目（note）を追加
          isFavorite: objectsData[i][11] || false,  // 12列目（isFavorite）
          Animation: objectsData[i][12] || '',  // 13列目（Animation）
          Fire: objectsData[i][13] || ''  // 14列目（Fire）
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getLinks') {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const linkSheet = ss.getSheetByName('LINK');
    
    if (!linkSheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        ok: true, 
        links: [] 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const linkData = linkSheet.getDataRange().getValues();
    const links = [];
    
    // ヘッダー行をスキップして、全てのリンクを取得（表示/非表示含む）
    for (let i = 1; i < linkData.length; i++) {
      if (linkData[i][0]) {  // 名前が存在する行のみ
        const displayFlag = linkData[i][3]; // D列（表示FLG）
        links.push({
          name: linkData[i][0],    // A列（非表示名）
          url: linkData[i][1],     // B列（URL）
          order: linkData[i][2],   // C列（表示順）
          display: displayFlag === true || displayFlag === 'TRUE'  // 表示フラグ
        });
      }
    }
    
    // 表示順でソート
    links.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return ContentService.createTextOutput(JSON.stringify({ 
      ok: true, 
      links: links 
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  
  if (action === 'saveMap') {
    const data = JSON.parse(e.postData.contents);
    
    // パスワード認証
    if (data.password !== EDIT_PASSWORD) {
      return ContentService.createTextOutput(JSON.stringify({ 
        ok: false, 
        error: 'Invalid password' 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const metaSheet = ss.getSheetByName('meta');
    const objectsSheet = ss.getSheetByName('objects');
    
    // メタ情報を更新（もし送られてきた場合）
    if (data.meta) {
      // metaシートの形式: A列=key, B列=value
      // 既存のメタデータを取得して行番号をマップ化
      const metaData = metaSheet.getDataRange().getValues();
      const metaMap = new Map();
      for (let i = 1; i < metaData.length; i++) {
        if (metaData[i][0]) {
          metaMap.set(metaData[i][0], i + 1); // 行番号を保存（1-indexed）
        }
      }
      
      // 更新するメタ情報
      const metaUpdates = {
        'cols': data.meta.cols,
        'rows': data.meta.rows,
        'cellSize': data.meta.cellSize,
        'mapName': data.meta.mapName,
        'bgImage': data.meta.bgImage,
        'bgCenterX': data.meta.bgCenterX,
        'bgCenterY': data.meta.bgCenterY,
        'bgScale': data.meta.bgScale,
        'bgOpacity': data.meta.bgOpacity
      };
      
      // 各キーに対して更新または追加
      for (const key in metaUpdates) {
        const value = metaUpdates[key];
        if (value !== undefined) {
          const rowIndex = metaMap.get(key);
          if (rowIndex) {
            // 既存の行を更新
            metaSheet.getRange(rowIndex, 2).setValue(value);
          } else {
            // 新しい行を追加
            metaSheet.appendRow([key, value]);
          }
        }
      }
    }
    
    // 既存データをクリア（2行目以降、ヘッダーは残す）
    const lastRow = objectsSheet.getLastRow();
    if (lastRow >= 2) {
      objectsSheet.getRange(2, 1, lastRow - 1, 14).clearContent();  // 14列まで拡張
    }
    
    // 新しいデータを書き込み
    if (data.objects && data.objects.length > 0) {
      const timestamp = new Date().toISOString();
      const actor = data.actor || 'anonymous';
      
      const rows = data.objects.map(obj => [
        obj.id, 
        obj.type, 
        obj.label, 
        obj.x, 
        obj.y, 
        obj.w, 
        obj.h, 
        obj.birthday || '',  // birthday列
        obj.note || '',  // note列
        timestamp,  // updatedAt
        actor,  // updatedBy
        obj.isFavorite || false,  // isFavorite
        obj.Animation || '',  // Animation列
        obj.Fire || ''  // Fire列
      ]);
      objectsSheet.getRange(2, 1, rows.length, 14).setValues(rows);  // 14列まで書き込み
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      ok: true,
      updated: data.objects ? data.objects.length : 0
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'saveLinks') {
    const data = JSON.parse(e.postData.contents);
    
    // パスワード認証
    if (data.password !== EDIT_PASSWORD) {
      return ContentService.createTextOutput(JSON.stringify({ 
        ok: false, 
        error: 'Invalid password' 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let linkSheet = ss.getSheetByName('LINK');
    
    // LINKシートが存在しない場合は作成
    if (!linkSheet) {
      linkSheet = ss.insertSheet('LINK');
      linkSheet.appendRow(['非表示名', 'URL', '表示順', '表示FLG']);
    }
    
    // 既存データをクリア（2行目以降、ヘッダーは残す）
    const lastRow = linkSheet.getLastRow();
    if (lastRow >= 2) {
      linkSheet.getRange(2, 1, lastRow - 1, 4).clearContent();
    }
    
    // 新しいデータを書き込み
    if (data.links && data.links.length > 0) {
      const rows = data.links.map(link => [
        link.name,
        link.url,
        link.order,
        link.display !== false  // displayフラグ（デフォルトtrue）
      ]);
      linkSheet.getRange(2, 1, rows.length, 4).setValues(rows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      ok: true,
      updated: data.links ? data.links.length : 0
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}
