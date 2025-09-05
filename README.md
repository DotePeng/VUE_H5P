# VUE_H5P
你是一名資深前端工程師。目標是在 {VueVersion} + {Bundler} 專案中整合 H5P 播放功能，來源為：
1) 本地 .h5p 解包後的內容（使用 h5p-standalone）
2) 以 iframe 嵌入的 H5P.com / LMS（Moodle/WordPress）連結

請產出：
- 安裝與設定步驟（npm 套件、Vite/webpack 設定、資源目錄結構）
- <H5PPlayer.vue>（支援 props：sourceType='local'|'iframe'、src、width、height、locale、frameCssUrls、disableFullscreen）
- h5p 載入器（lazy-load）、Resize 處理與錯誤處理
- xAPI 事件攔截與回傳（POST 至 {BackendXapiEndpoint}，攜帶 {tokenHeaderName}: {tokenValue}）
- 手機/平板 RWD 與全螢幕切換
- TypeScript 型別定義（若 {UseTS}=true）
- 安全性：CSP 建議、CORS 設定清單
- 驗收腳本（Play 成功、完成度分數、xAPI 送出）

限制/要求：
- 不使用 jQuery
- 需支援 SSR 關閉（Nuxt/SSR 時於 client-only 掛載）
- 專案目錄：/public/h5p/{contentId}/
- 代碼註解以繁體中文說明

驗收標準：
- 路由 /demo-h5p 可播放內容
- devtools 無報錯；網路面板可看見 xAPI POST
- 視窗縮放仍能自動重算尺寸
常見情境提示詞
1) 本地內容（h5p-standalone）播放器元件
bash
複製程式碼
請在 {VueVersion}+{Bundler} 建立 <H5PStandalonePlayer.vue>，使用 "h5p-standalone" 套件播放已解包的 .h5p 內容。
需求：
- props：contentUrl（例：/h5p/{contentId}/content/）、frameCssUrls（可選，用於覆蓋樣式）
- 自動載入 requiredAssets（js/css），並在 mounted 後初始化
- 提供 play()/destroy() 方法
- 監聽並轉拋 window.H5P.externalDispatcher 的 xAPI 事件（'xAPI'）
- 內建 ResizeObserver，容器等比自適應
- 於錯誤時顯示可讀錯誤訊息與重試按鈕
2) iframe 嵌入（H5P.com / Moodle / WordPress）
diff
複製程式碼
建立 <H5PIframePlayer.vue>，以 <iframe> 播放 H5P 內容：
- props：src、allowFullscreen（預設 true）
- 使用 postMessage 與內嵌內容協調高度（監聽 'resize' 類訊息）
- 暴露事件：onLoaded、onResized、onError
- 加入 IntersectionObserver，滾入可視區才載入（lazy）
- 加上 sandbox、referrerpolicy、allow 屬性最佳實務
3) xAPI 事件收集與後端回傳
pgsql
複製程式碼
製作 xAPI 事件服務（/services/xapi.ts）：
- 監聽 H5P.externalDispatcher.on('xAPI', handler)
- 解析 statement（actor/verb/object/result/context），補上 userId={CurrentUserId}、contentId、sessionId
- 以 fetch POST 到 {BackendXapiEndpoint}，headers: {'Content-Type':'application/json','{tokenHeaderName}':'{tokenValue}'}
- 提供重試與退避策略（3 次，500ms/1s/2s）
- 寫單元測試：成功/失敗/網路中斷
4) H5P Editor（前端可編輯）
diff
複製程式碼
在 {VueVersion} 專案加入 H5P Editor（h5p-editor-standalone 或對接後端）：
- <H5PEditor.vue>：可載入既有 content.json，允許編輯後匯出
- 產出保存流程：將變更後的 JSON/資產以 multipart/form-data 上傳 {BackendSaveEndpoint}
- 權限控制：僅 {AllowedRoles} 可見
- 加入 i18n（中文介面）
5) Nuxt 3 / SSR 相容
lua
複製程式碼
將 H5P 播放器封裝為 Nuxt 3 元件：
- 僅在 client-side 掛載（<client-only> 或 process.client 判斷）
- 動態 import('h5p-standalone')
- nuxt.config.ts：加入 CSP 與 asset 前綴設定
- 範例頁 /h5p/[[id]].vue
6) 手機/平板最佳化與全螢幕
diff
複製程式碼
為 H5P 播放容器添加 RWD 與全螢幕功能：
- 提供全螢幕按鈕（Fullscreen API），並在退出時恢復原尺寸
- touch 事件優化：避免滾動衝突
- 針對 iOS Safari 100vh 問題加入修正（動態計算可視高）
7) 多內容切換與快取
diff
複製程式碼
建立 <H5PContentSwitcher.vue>：
- props：contents: Array<{id, title, src|contentUrl}>
- 切換時保留上一個內容的播放進度（本地 IndexedDB）
- 使用 Service Worker 預快取主要資產（JS/CSS/圖）
- 提供搜尋/篩選（標籤、主題）
8) 自訂皮膚/樣式覆蓋
diff
複製程式碼
新增 h5p-theme.css，覆蓋 H5P 預設樣式（字體、按鈕、配色）：
- 不直接修改套件檔，使用更高優先度選擇器或 CSS vars
- 手機字體與觸控目標至少 44x44px
- 在 H5PStandalonePlayer 中支援 frameCssUrls 注入
9) 錯誤處理與回報
diff
複製程式碼
統一封裝 H5P 錯誤處理：
- 分類：資源載入失敗、初始化例外、跨網域/安全性限制
- UI 顯示錯誤碼與建議
- 自動上報 {ErrorReportEndpoint}（含 UA、路由、內容 ID、堆疊）
10) 與你的平台帳號/課程關聯
diff
複製程式碼
當播放器初始化時：
- 從 {AuthStore} 取得 userId、token
- 讀取當前課程/單元 ID（route params）
- xAPI context.extensions 帶上 {courseId, unitId, outlineId}
- 完成度 result.completion=true 時，呼叫 {BackendMarkCompleteEndpoint}
11) 內容匯入（.h5p → 解包）
diff
複製程式碼
新增管理頁：上傳 .h5p 檔，後端解包至 /public/h5p/{contentId}/
前端驗證：
- 檢查檔案大小與 mime
- 上傳進度條
- 完成後自動導向播放頁、寫入索引
12) 權限與授權防護
diff
複製程式碼
若使用 iframe 嵌入外部 H5P：
- 以簽名 URL 或短期 token 生成 src
- 設定 referrerPolicy='no-referrer'、sandbox 屬性
- 後端檢查來源 domain 白名單
除錯／最佳化專用提示詞
A) iframe 高度不自適應 / 捲軸
diff
複製程式碼
檢查並修正 H5P iframe 高度同步問題：
- 實作 postMessage 協定：子頁傳遞內容高度，父頁接收並設定 style.height
- 防抖 100ms，避免抖動
- 監聽視窗 resize 與字體變更
B) CSP/CORS 堵住載入
css
複製程式碼
列出 H5P 播放必要的 CSP 與 CORS 設定清單，並給出 Nginx/Vite devServer 範例，以允許：
- script/style/img/font/media 來源
- frame-src/child-src
- crossOrigin 資產載入策略
C) 大型內容載入過慢
diff
複製程式碼
對 H5P 資源做性能優化：
- lazy-load 第三方庫
- CDN 或 chunk 分離
- 預快取封面與首屏資源
- 壓縮圖像與移除未用資產
驗收清單 Prompt
diff
複製程式碼
為此整合撰寫 E2E 驗收清單（Playwright）：
- 能正確載入播放器頁面
- 互動 3 次後產生 xAPI statement 並成功 POST
- 視窗寬度 375/768/1280 測試均不跑版
- 斷網 5s 後恢復可自動補送 xAPI
- 退出/再次進入可恢復進度 >= 90%
後續擴充 Prompt（選用）
匯出成績單 / 進度報表
diff
複製程式碼
建立成績頁：
- 從 {BackendXapiQueryEndpoint} 取回學習者對應內容的得分、完成度、耗時
- 以表格與圖表（ECharts 或 Chart.js）呈現
- 可 CSV 匯出
與 LMS（xAPI/LRS）對接
複製程式碼
把 xAPI 事件同步到 {LRSURL}（Basic Auth 或 OAuth），加入重試與批次送出；提供環境變數設定。

## 使用說明

### 安裝與啟動
1. `npm install`
2. `npm run dev`
3. 瀏覽 `http://localhost:5173` 並進入 `/demo-h5p` 測試播放。

程式碼重點：
- `<H5PPlayer>` 支援本地與 iframe 兩種來源。
- `services/xapi.ts` 會監聽並送出 xAPI 事件。
