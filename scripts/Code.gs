const EDIT_PASSWORD = "snow1234";
const SPREADSHEET_ID = "1E3snSo7vzpdcTLkRqJFDlgDK3GZ3IuJYehspN95AgvQ";

// 掲示板用 Google Drive フォルダID
const THREAD_ROOT_FOLDER_ID = "18gvDl0Jm9D7S15YVWdJJM7PuA_QG6ttv";
const THREADS_INDEX_FILENAME = "threads.json";
const THREAD_META_FILENAME = "thread.json";

// マップ設定のデフォルト
const DEFAULT_MAPS = [
  { id: 'object', name: 'メインマップ', sheetName: 'objects', isVisible: true, isBase: true, order: 1 },
  { id: 'map2', name: 'サブマップ2', sheetName: 'objects_map2', isVisible: false, isBase: false, order: 2 },
  { id: 'map3', name: 'サブマップ3', sheetName: 'objects_map3', isVisible: false, isBase: false, order: 3 },
  { id: 'map4', name: 'サブマップ4', sheetName: 'objects_map4', isVisible: false, isBase: false, order: 4 },
  { id: 'map5', name: 'サブマップ5', sheetName: 'objects_map5', isVisible: false, isBase: false, order: 5 }
];

// マップ設定を取得または初期化
function getMapConfigs() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let configSheet = ss.getSheetByName('map_config');
  
  // map_configシートが存在しない場合は作成
  if (!configSheet) {
    configSheet = ss.insertSheet('map_config');
    configSheet.appendRow(['id', 'name', 'sheetName', 'isVisible', 'isBase', 'order']);
    
    // デフォルト設定を書き込み
    const rows = DEFAULT_MAPS.map(m => [m.id, m.name, m.sheetName, m.isVisible, m.isBase, m.order]);
    configSheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
  
  const data = configSheet.getDataRange().getValues();
  const configs = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      configs.push({
        id: data[i][0],
        name: data[i][1],
        sheetName: data[i][2],
        isVisible: data[i][3] === true || data[i][3] === 'TRUE',
        isBase: data[i][4] === true || data[i][4] === 'TRUE',
        order: data[i][5] || i
      });
    }
  }
  
  return configs.sort((a, b) => a.order - b.order);
}

// 音楽データを取得
function getMusic() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let musicSheet = ss.getSheetByName('Music');
  
  // Musicシートが存在しない場合は空配列を返す
  if (!musicSheet) {
    return { ok: true, music: [] };
  }
  
  const data = musicSheet.getDataRange().getValues();
  const music = [];
  
  // ヘッダー行をスキップ
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {  // IDがある行のみ
      music.push({
        id: data[i][0],
        title: data[i][1],
        url: data[i][2],
        type: data[i][3],
        order: data[i][4] || 0,
        createdAt: data[i][5] || Date.now()
      });
    }
  }
  
  // 表示順でソート
  music.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  return { ok: true, music: music };
}

// 音楽データを保存
function saveMusic(e) {
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
  let musicSheet = ss.getSheetByName('Music');
  
  // Musicシートが存在しない場合は作成
  if (!musicSheet) {
    musicSheet = ss.insertSheet('Music');
    musicSheet.appendRow(['id', 'title', 'url', 'type', 'order', 'createdAt']);
  }
  
  // 既存データをクリア（ヘッダー以外）
  const lastRow = musicSheet.getLastRow();
  if (lastRow >= 2) {
    musicSheet.getRange(2, 1, lastRow - 1, 6).clearContent();
  }
  
  // 新しいデータを書き込み
  if (data.music && data.music.length > 0) {
    const rows = data.music.map(music => [
      music.id,
      music.title,
      music.url,
      music.type,
      music.order || 0,
      music.createdAt || Date.now()
    ]);
    musicSheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ 
    ok: true,
    updated: data.music ? data.music.length : 0
  }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = e.parameter.action;
  
  // マップ一覧を取得
  if (action === 'getMaps') {
    const configs = getMapConfigs();
    return ContentService.createTextOutput(JSON.stringify({ 
      ok: true, 
      maps: configs 
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // 音楽データを取得
  if (action === 'getMusic') {
    return ContentService.createTextOutput(JSON.stringify(getMusic()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getMap') {
    const mapId = e.parameter.mapId || 'object';
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const metaSheet = ss.getSheetByName('meta');
    
    // マップ設定を取得
    const configs = getMapConfigs();
    const mapConfig = configs.find(m => m.id === mapId);
    
    if (!mapConfig) {
      return ContentService.createTextOutput(JSON.stringify({ 
        ok: false, 
        error: 'Map not found' 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const objectsSheet = ss.getSheetByName(mapConfig.sheetName);
    
    if (!objectsSheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        ok: false, 
        error: 'Sheet not found' 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
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
      mapId: mapId,
      mapName: mapConfig.name,
      isBase: mapConfig.isBase,
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
        const obj = {
          id: objectsData[i][0],
          type: objectsData[i][1],
          label: objectsData[i][2],
          x: objectsData[i][3],
          y: objectsData[i][4],
          w: objectsData[i][5],
          h: objectsData[i][6]
        };
        
        // ベースマップの場合のみ追加フィールド
        if (mapConfig.isBase) {
          obj.birthday = objectsData[i][7] || '';
          obj.note = objectsData[i][8] || '';
          obj.isFavorite = objectsData[i][11] || false;
          obj.Animation = objectsData[i][12] || '';
          obj.Fire = objectsData[i][13] || '';
          const musicIdsStr = objectsData[i][14] || '';  // 音楽ID（カンマ区切り）
          obj.musicIds = musicIdsStr ? String(musicIdsStr).split(',').map(id => id.trim()).filter(id => id) : [];
        }
        
        output.objects.push(obj);
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
  
  // 掲示板: スレッド一覧
  if (action === 'getThreads') {
    try {
      return jsonOutput(getThreadsIndex());
    } catch (err) {
      return jsonOutput({ ok: false, error: 'getThreads failed: ' + (err && err.message ? err.message : String(err)) });
    }
  }

  // 掲示板: スレッド詳細
  if (action === 'getThread') {
    try {
      const threadId = e.parameter.threadId;
      if (!threadId) {
        return jsonOutput({ ok: false, error: 'threadId required' });
      }
      return jsonOutput(getThreadDetail(threadId));
    } catch (err) {
      return jsonOutput({ ok: false, error: 'getThread failed: ' + (err && err.message ? err.message : String(err)) });
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== 掲示板ヘルパー =====

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getRootFolder_() {
  return DriveApp.getFolderById(THREAD_ROOT_FOLDER_ID);
}

function findChildFile_(folder, name) {
  const iter = folder.getFilesByName(name);
  return iter.hasNext() ? iter.next() : null;
}

function findChildFolder_(folder, name) {
  const iter = folder.getFoldersByName(name);
  return iter.hasNext() ? iter.next() : null;
}

function readJsonFile_(file, fallback) {
  if (!file) return fallback;
  try {
    return JSON.parse(file.getBlob().getDataAsString());
  } catch (err) {
    return fallback;
  }
}

function writeJsonFile_(folder, name, data) {
  const content = JSON.stringify(data);
  const existing = findChildFile_(folder, name);
  if (existing) {
    existing.setContent(content);
    return existing;
  }
  return folder.createFile(name, content, 'application/json');
}

function uuid_() {
  return Utilities.getUuid();
}

function getThreadsIndex() {
  const root = getRootFolder_();
  const indexFile = findChildFile_(root, THREADS_INDEX_FILENAME);
  const data = readJsonFile_(indexFile, { threads: [] });
  const visible = (data.threads || []).filter(function (t) { return !t.isDeleted; });
  // 新しい順（作成日時降順）
  visible.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
  return { ok: true, threads: visible };
}

function getThreadDetail(threadId) {
  const root = getRootFolder_();
  const threadFolder = findChildFolder_(root, threadId);
  if (!threadFolder) return { ok: false, error: 'Thread not found' };
  const metaFile = findChildFile_(threadFolder, THREAD_META_FILENAME);
  const detail = readJsonFile_(metaFile, null);
  if (!detail) return { ok: false, error: 'Thread meta missing' };
  // 論理削除チェック
  const idx = readJsonFile_(findChildFile_(root, THREADS_INDEX_FILENAME), { threads: [] });
  const entry = (idx.threads || []).find(function (t) { return t.id === threadId; });
  if (entry && entry.isDeleted) return { ok: false, error: 'Thread deleted' };
  return { ok: true, thread: detail };
}

function createThread_(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const root = getRootFolder_();
    const threadId = uuid_();
    const now = Date.now();
    const title = String(data.title || '').substring(0, 120);
    const createdBy = String(data.createdBy || 'anonymous').substring(0, 40);

    const threadFolder = root.createFolder(threadId);

    const detail = {
      id: threadId,
      title: title,
      createdBy: createdBy,
      createdAt: now,
      posts: [],
      likes: 0
    };
    writeJsonFile_(threadFolder, THREAD_META_FILENAME, detail);

    // インデックス更新
    const indexFile = findChildFile_(root, THREADS_INDEX_FILENAME);
    const idx = readJsonFile_(indexFile, { threads: [] });
    idx.threads = idx.threads || [];
    idx.threads.push({
      id: threadId,
      title: title,
      createdBy: createdBy,
      createdAt: now,
      lastPostAt: now,
      postCount: 0,
      likes: 0,
      thumbnailUrl: '',
      isDeleted: false,
      folderId: threadFolder.getId()
    });
    writeJsonFile_(root, THREADS_INDEX_FILENAME, idx);

    return { ok: true, threadId: threadId };
  } finally {
    lock.releaseLock();
  }
}

function addPost_(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const threadId = data.threadId;
    if (!threadId) return { ok: false, error: 'threadId required' };
    const root = getRootFolder_();
    const threadFolder = findChildFolder_(root, threadId);
    if (!threadFolder) return { ok: false, error: 'Thread not found' };

    const metaFile = findChildFile_(threadFolder, THREAD_META_FILENAME);
    const detail = readJsonFile_(metaFile, null);
    if (!detail) return { ok: false, error: 'Thread meta missing' };

    const postId = uuid_();
    const now = Date.now();
    const createdBy = String(data.createdBy || 'anonymous').substring(0, 40);
    const comment = String(data.comment || '').substring(0, 2000);

    // 画像アップロード（base64配列）
    const imageUrls = [];
    const images = Array.isArray(data.images) ? data.images : [];
    let firstImageUrl = '';
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img || !img.data) continue;
      const mime = img.mime || 'image/webp';
      const ext = (mime.split('/')[1] || 'webp').split('+')[0];
      const filename = postId + '_' + i + '.' + ext;
      const blob = Utilities.newBlob(Utilities.base64Decode(img.data), mime, filename);
      const file = threadFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      // <img> で直接埋め込み可能な lh3 形式で保存
      const url = 'https://lh3.googleusercontent.com/d/' + file.getId();
      imageUrls.push({ fileId: file.getId(), url: url });
      if (!firstImageUrl) firstImageUrl = url;
    }

    detail.posts = detail.posts || [];
    detail.posts.push({
      id: postId,
      createdBy: createdBy,
      createdAt: now,
      comment: comment,
      imageUrls: imageUrls
    });
    writeJsonFile_(threadFolder, THREAD_META_FILENAME, detail);

    // インデックスのlastPostAt/postCount/thumbnailUrl更新
    const indexFile = findChildFile_(root, THREADS_INDEX_FILENAME);
    const idx = readJsonFile_(indexFile, { threads: [] });
    idx.threads = idx.threads || [];
    for (let j = 0; j < idx.threads.length; j++) {
      if (idx.threads[j].id === threadId) {
        idx.threads[j].lastPostAt = now;
        idx.threads[j].postCount = detail.posts.length;
        if (firstImageUrl && !idx.threads[j].thumbnailUrl) {
          idx.threads[j].thumbnailUrl = firstImageUrl;
        }
        break;
      }
    }
    writeJsonFile_(root, THREADS_INDEX_FILENAME, idx);

    return { ok: true, postId: postId, imageUrls: imageUrls };
  } finally {
    lock.releaseLock();
  }
}

function deleteThread_(threadId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const root = getRootFolder_();
    const indexFile = findChildFile_(root, THREADS_INDEX_FILENAME);
    const idx = readJsonFile_(indexFile, { threads: [] });
    idx.threads = idx.threads || [];
    let hit = false;
    for (let i = 0; i < idx.threads.length; i++) {
      if (idx.threads[i].id === threadId) {
        idx.threads[i].isDeleted = true;
        hit = true;
        break;
      }
    }
    if (!hit) return { ok: false, error: 'Thread not found' };
    writeJsonFile_(root, THREADS_INDEX_FILENAME, idx);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function likeThread_(threadId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const root = getRootFolder_();
    const threadFolder = findChildFolder_(root, threadId);
    if (!threadFolder) return { ok: false, error: 'Thread not found' };
    const metaFile = findChildFile_(threadFolder, THREAD_META_FILENAME);
    const detail = readJsonFile_(metaFile, null);
    if (!detail) return { ok: false, error: 'Thread meta missing' };
    detail.likes = (detail.likes || 0) + 1;
    writeJsonFile_(threadFolder, THREAD_META_FILENAME, detail);

    // インデックスも同期
    const indexFile = findChildFile_(root, THREADS_INDEX_FILENAME);
    const idx = readJsonFile_(indexFile, { threads: [] });
    idx.threads = idx.threads || [];
    for (let i = 0; i < idx.threads.length; i++) {
      if (idx.threads[i].id === threadId) {
        idx.threads[i].likes = detail.likes;
        break;
      }
    }
    writeJsonFile_(root, THREADS_INDEX_FILENAME, idx);
    return { ok: true, likes: detail.likes };
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  const action = e.parameter.action;
  
  // 音楽データを保存
  if (action === 'saveMusic') {
    return saveMusic(e);
  }
  
  // マップ設定を更新
  if (action === 'updateMapConfig') {
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
    const configSheet = ss.getSheetByName('map_config');
    
    if (!configSheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        ok: false, 
        error: 'Config sheet not found' 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const configData = configSheet.getDataRange().getValues();
    
    // 該当するマップを見つけて更新
    for (let i = 1; i < configData.length; i++) {
      if (configData[i][0] === data.mapId) {
        if (data.name !== undefined) {
          configSheet.getRange(i + 1, 2).setValue(data.name);
        }
        if (data.isVisible !== undefined && !configData[i][4]) {  // ベースマップでない場合のみ
          configSheet.getRange(i + 1, 4).setValue(data.isVisible);
        }
        
        return ContentService.createTextOutput(JSON.stringify({ 
          ok: true
        }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      ok: false, 
      error: 'Map not found' 
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // マップをコピー
  if (action === 'copyMap') {
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
    const sourceSheet = ss.getSheetByName('objects');  // ベースマップ
    const configs = getMapConfigs();
    const targetConfig = configs.find(m => m.id === data.targetMapId);
    
    if (!targetConfig || targetConfig.isBase) {
      return ContentService.createTextOutput(JSON.stringify({ 
        ok: false, 
        error: 'Invalid target map' 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    let targetSheet = ss.getSheetByName(targetConfig.sheetName);
    
    // ターゲットシートが存在しない場合は作成
    if (!targetSheet) {
      targetSheet = ss.insertSheet(targetConfig.sheetName);
      targetSheet.appendRow(['id', 'type', 'label', 'x', 'y', 'w', 'h']);
    }
    
    // データをコピー（基本フィールドのみ）
    const sourceData = sourceSheet.getDataRange().getValues();
    const lastRow = targetSheet.getLastRow();
    if (lastRow >= 2) {
      targetSheet.getRange(2, 1, lastRow - 1, 7).clearContent();
    }
    
    const rows = [];
    for (let i = 1; i < sourceData.length; i++) {
      if (sourceData[i][0]) {
        rows.push([
          sourceData[i][0],  // id
          sourceData[i][1],  // type
          sourceData[i][2],  // label
          sourceData[i][3],  // x
          sourceData[i][4],  // y
          sourceData[i][5],  // w
          sourceData[i][6]   // h
        ]);
      }
    }
    
    if (rows.length > 0) {
      targetSheet.getRange(2, 1, rows.length, 7).setValues(rows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      ok: true,
      copied: rows.length
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
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
    
    const mapId = data.mapId || 'object';
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const metaSheet = ss.getSheetByName('meta');
    
    // マップ設定を取得
    const configs = getMapConfigs();
    const mapConfig = configs.find(m => m.id === mapId);
    
    if (!mapConfig) {
      return ContentService.createTextOutput(JSON.stringify({ 
        ok: false, 
        error: 'Map not found' 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    let objectsSheet = ss.getSheetByName(mapConfig.sheetName);
    
    // シートが存在しない場合は作成
    if (!objectsSheet) {
      objectsSheet = ss.insertSheet(mapConfig.sheetName);
      if (mapConfig.isBase) {
        objectsSheet.appendRow(['id', 'type', 'label', 'x', 'y', 'w', 'h', 'birthday', 'note', 'updatedAt', 'updatedBy', 'isFavorite', 'Animation', 'Fire', 'musicId']);
      } else {
        objectsSheet.appendRow(['id', 'type', 'label', 'x', 'y', 'w', 'h']);
      }
    }
    
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
    const columnCount = mapConfig.isBase ? 15 : 7;  // musicIdを追加したので15列
    if (lastRow >= 2) {
      objectsSheet.getRange(2, 1, lastRow - 1, columnCount).clearContent();
    }
    
    // 新しいデータを書き込み
    if (data.objects && data.objects.length > 0) {
      const timestamp = new Date().toISOString();
      const actor = data.actor || 'anonymous';
      
      let rows;
      if (mapConfig.isBase) {
        rows = data.objects.map(obj => [
          obj.id, 
          obj.type, 
          obj.label, 
          obj.x, 
          obj.y, 
          obj.w, 
          obj.h, 
          obj.birthday || '',
          obj.note || '',
          timestamp,
          actor,
          obj.isFavorite || false,
          obj.Animation || '',
          obj.Fire || '',
          Array.isArray(obj.musicIds) ? obj.musicIds.join(',') : ''  // 音楽ID（カンマ区切り）
        ]);
      } else {
        rows = data.objects.map(obj => [
          obj.id, 
          obj.type, 
          obj.label, 
          obj.x, 
          obj.y, 
          obj.w, 
          obj.h
        ]);
      }
      
      objectsSheet.getRange(2, 1, rows.length, columnCount).setValues(rows);
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

  // 掲示板: スレッド作成
  if (action === 'createThread') {
    try {
      const data = JSON.parse(e.postData.contents);
      if (data.password !== EDIT_PASSWORD) {
        return jsonOutput({ ok: false, error: 'Invalid password' });
      }
      return jsonOutput(createThread_(data));
    } catch (err) {
      return jsonOutput({ ok: false, error: 'createThread failed: ' + (err && err.message ? err.message : String(err)) });
    }
  }

  // 掲示板: 投稿追加
  if (action === 'addPost') {
    try {
      const data = JSON.parse(e.postData.contents);
      if (data.password !== EDIT_PASSWORD) {
        return jsonOutput({ ok: false, error: 'Invalid password' });
      }
      return jsonOutput(addPost_(data));
    } catch (err) {
      return jsonOutput({ ok: false, error: 'addPost failed: ' + (err && err.message ? err.message : String(err)) });
    }
  }

  // 掲示板: スレッド論理削除
  if (action === 'deleteThread') {
    try {
      const data = JSON.parse(e.postData.contents);
      if (data.password !== EDIT_PASSWORD) {
        return jsonOutput({ ok: false, error: 'Invalid password' });
      }
      return jsonOutput(deleteThread_(data.threadId));
    } catch (err) {
      return jsonOutput({ ok: false, error: 'deleteThread failed: ' + (err && err.message ? err.message : String(err)) });
    }
  }

  // 掲示板: いいね（認証不要）
  if (action === 'likeThread') {
    try {
      const data = JSON.parse(e.postData.contents);
      return jsonOutput(likeThread_(data.threadId));
    } catch (err) {
      return jsonOutput({ ok: false, error: 'likeThread failed: ' + (err && err.message ? err.message : String(err)) });
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}
