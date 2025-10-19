# 202510_lab1

## 專案簡介

這是一個展示完整安全 CI/CD Pipeline 的專案，包含多層次的安全掃描和程式碼品質檢測工具。

## 功能特色

### 🔒 安全掃描工具

本專案整合了以下安全掃描工具：

1. **SAST (靜態應用程式安全測試)** - Semgrep
   - 原始碼安全漏洞掃描
   - OWASP Top 10 檢測
   - Secrets 洩漏檢測

2. **SCA (軟體組成分析)** - OWASP Dependency-Check
   - 依賴套件漏洞檢測
   - CVE 漏洞資料庫比對

3. **容器映像掃描** - Trivy
   - Docker 映像安全掃描
   - 作業系統漏洞檢測

4. **IaC 安全檢查** - Checkov
   - 基礎設施即程式碼安全檢查
   - Terraform、Kubernetes 設定檢查

5. **Secret 掃描** - Gitleaks
   - Git 歷史記錄 secret 掃描
   - API 金鑰、密碼洩漏檢測

6. **程式碼品質掃描** - SonarCloud
   - 程式碼品質分析
   - 技術債務追蹤
   - 安全漏洞檢測
   - 程式碼覆蓋率分析

## 🚀 快速開始

### 前置需求

- Docker 和 Docker Compose
- GitHub 帳號
- SonarCloud 帳號（用於程式碼品質掃描）

### 本地開發

1. 克隆專案
```bash
git clone https://github.com/your-username/202510_lab1.git
cd 202510_lab1
```

2. 使用 Docker Compose 啟動
```bash
docker-compose up -d
```

3. 開啟瀏覽器訪問
```
http://localhost:8080
```

### 本地測試 Docker 映像

```bash
# 建置映像
docker build -t lab1:local .

# 執行容器
docker run -d -p 8080:80 lab1:local

# 檢視日誌
docker logs <container-id>
```

## ☁️ SonarCloud 設定步驟

### 1. 建立 SonarCloud 組織和專案

1. 前往 [SonarCloud](https://sonarcloud.io/)
2. 使用 GitHub 帳號登入
3. 點擊右上角的 "+" → "Analyze new project"
4. 選擇你的 GitHub 組織
5. 選擇此專案 (202510_lab1)
6. 點擊 "Set Up"

### 2. 關閉自動分析（重要）

**必須關閉自動分析，否則會與 CI 分析衝突！**

1. 在 SonarCloud 專案頁面，點擊 "Administration" → "Analysis Method"
2. 找到 "Automatic Analysis" 區塊
3. 關閉 "Automatic Analysis" 開關
4. 儲存設定

### 3. 取得 SonarCloud Token

1. 在 SonarCloud 中，點擊右上角的頭像
2. 選擇 "My Account" → "Security"
3. 在 "Generate Tokens" 區域輸入 Token 名稱（例如：`lab1-github-actions`）
4. 點擊 "Generate"
5. **立即複製並保存此 Token**（之後將無法再次查看）

### 4. 設定 GitHub Secrets

1. 前往你的 GitHub 專案頁面
2. 點擊 "Settings" → "Secrets and variables" → "Actions"
3. 點擊 "New repository secret"
4. 新增以下 secret：
   - Name: `SONAR_TOKEN`
   - Secret: 貼上剛才複製的 SonarCloud Token
5. 點擊 "Add secret"

### 5. 設定專案金鑰

SonarCloud 專案金鑰格式為：`組織名稱_專案名稱`

例如：
- 組織：`my-organization`
- 專案：`202510_lab1`
- 專案金鑰：`my-organization_202510_lab1`

專案金鑰會在 CI/CD Pipeline 中自動設定為：
```yaml
-Dsonar.projectKey=${{ github.repository_owner }}_${{ github.event.repository.name }}
```

### 6. 驗證設定

推送程式碼到 GitHub 後：

1. 前往 "Actions" 標籤查看 Pipeline 執行狀態
2. 確認 "SonarCloud 程式碼品質掃描" job 成功執行
3. 前往 SonarCloud 查看分析報告：
   ```
   https://sonarcloud.io/dashboard?id=你的組織名稱_202510_lab1
   ```

### SonarCloud 品質門檻

預設的品質門檻包括：
- ✅ 新程式碼覆蓋率 ≥ 80%
- ✅ 新程式碼重複度 ≤ 3%
- ✅ 可維護性評級 ≥ A
- ✅ 可靠性評級 ≥ A
- ✅ 安全性評級 ≥ A

你可以在 SonarCloud 專案設定中自訂這些門檻。

## 📋 CI/CD Pipeline 流程

GitHub Actions Workflow 會在以下情況觸發：

- 推送到 `main` 或 `develop` 分支
- 對 `main` 分支發起 Pull Request
- 手動觸發（workflow_dispatch）

### Pipeline 階段

1. **SAST 掃描** - Semgrep 原始碼安全檢測
2. **SCA 掃描** - 依賴套件漏洞檢測
3. **容器掃描** - Docker 映像安全檢測
4. **IaC 掃描** - 基礎設施程式碼安全檢查
5. **Secret 掃描** - 敏感資訊洩漏檢測
6. **程式碼品質掃描** - SonarCloud 分析
7. **安全總結** - 彙整所有掃描結果
8. **建置映像** - 建置並推送 Docker 映像到 GHCR
9. **建置網站** - 準備靜態網站內容
10. **部署** - 部署到 GitHub Pages

## 📊 查看掃描結果

### GitHub Security 標籤

前往專案的 "Security" 標籤 → "Code scanning alerts" 查看：
- SAST 掃描結果
- SCA 漏洞報告
- 容器安全問題
- IaC 設定問題

### SonarCloud 儀表板

前往 SonarCloud 查看詳細的程式碼品質報告：
```
https://sonarcloud.io/dashboard?id=你的組織名稱_202510_lab1
```

包含：
- 程式碼異味（Code Smells）
- 技術債務
- 安全漏洞
- 測試覆蓋率
- 重複程式碼分析

### GitHub Actions 日誌

前往 "Actions" 標籤查看每個 job 的詳細執行日誌。

## 🔧 設定檔說明

- **[`.github/workflows/secure-pipeline.yml`](.github/workflows/secure-pipeline.yml)** - CI/CD Pipeline 設定
- **[`sonar-project.properties`](sonar-project.properties)** - SonarCloud 掃描設定
- **[`Dockerfile`](Dockerfile)** - Docker 映像建置設定
- **[`docker-compose.yml`](docker-compose.yml)** - 本地開發環境設定
- **[`nginx.conf`](nginx.conf)** - Nginx 網頁伺服器設定

## 📝 專案架構

```
202510_lab1/
├── .github/
│   └── workflows/
│       └── secure-pipeline.yml    # CI/CD Pipeline 設定
├── app/
│   ├── index.html                 # 主要網頁
│   ├── script.js                  # JavaScript 邏輯
│   └── style.css                  # 樣式表
├── Dockerfile                     # Docker 映像定義
├── docker-compose.yml             # Docker Compose 設定
├── nginx.conf                     # Nginx 設定
├── sonar-project.properties       # SonarCloud 設定
└── README.md                      # 專案說明文件
```

## 🛡️ 安全最佳實踐

本專案展示了以下安全最佳實踐：

1. **多層次安全掃描**：從原始碼到容器映像的全方位檢測
2. **持續整合**：每次 commit 都會觸發安全檢查
3. **自動化部署**：只有通過所有檢查的程式碼才會部署
4. **程式碼品質管理**：使用 SonarCloud 持續追蹤程式碼品質
5. **容器化部署**：使用 Docker 確保環境一致性
6. **Secret 管理**：使用 GitHub Secrets 安全儲存敏感資訊

## 🤝 貢獻指南

歡迎提交 Issue 或 Pull Request！

Pull Request 流程：
1. Fork 本專案
2. 建立你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request
6. 等待 CI/CD Pipeline 執行完成
7. 確保所有安全掃描和品質檢查通過

## 📄 授權

本專案採用 MIT 授權條款。

## 📞 聯絡資訊

如有任何問題，歡迎開 Issue 討論。

## 🔗 相關連結

- [GitHub Actions 文件](https://docs.github.com/en/actions)
- [SonarCloud 文件](https://docs.sonarcloud.io/)
- [Semgrep 文件](https://semgrep.dev/docs/)
- [Trivy 文件](https://aquasecurity.github.io/trivy/)
- [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/)
- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [Checkov](https://www.checkov.io/)