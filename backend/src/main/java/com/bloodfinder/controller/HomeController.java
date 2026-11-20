package com.bloodfinder.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HomeController {

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    @GetMapping(value = "/", produces = "text/html;charset=UTF-8")
    @ResponseBody
    public String index() {
        int userCount = 0;
        int donorCount = 0;
        int hospitalCount = 0;
        int requestCount = 0;
        int logCount = 0;

        if (jdbcTemplate != null) {
            try {
                userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
                donorCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM donors", Integer.class);
                hospitalCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM hospitals", Integer.class);
                requestCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM blood_requests", Integer.class);
                logCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM access_logs", Integer.class);
            } catch (Exception e) {
                // fallback if DB still seeding
            }
        }

        return "<!DOCTYPE html>\n" +
            "<html lang=\"en\">\n" +
            "<head>\n" +
            "  <meta charset=\"UTF-8\">\n" +
            "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
            "  <title>VitalPulse – Backend Gateway & Database Console</title>\n" +
            "  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n" +
            "  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n" +
            "  <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap\" rel=\"stylesheet\">\n" +
            "  <style>\n" +
            "    :root {\n" +
            "      --bg: #090d16;\n" +
            "      --card-bg: rgba(18, 24, 38, 0.75);\n" +
            "      --border: rgba(255, 255, 255, 0.08);\n" +
            "      --primary: #ef4444;\n" +
            "      --primary-glow: rgba(239, 68, 68, 0.25);\n" +
            "      --emerald: #10b981;\n" +
            "      --cyan: #06b6d4;\n" +
            "      --text: #f1f5f9;\n" +
            "      --text-muted: #94a3b8;\n" +
            "    }\n" +
            "    * { box-sizing: border-box; margin: 0; padding: 0; }\n" +
            "    body {\n" +
            "      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;\n" +
            "      background: radial-gradient(circle at 50% 0%, #1e1b2e 0%, #090d16 65%);\n" +
            "      color: var(--text);\n" +
            "      min-height: 100vh;\n" +
            "      display: flex;\n" +
            "      flex-direction: column;\n" +
            "      align-items: center;\n" +
            "      justify-content: center;\n" +
            "      padding: 24px;\n" +
            "    }\n" +
            "    .container {\n" +
            "      max-width: 860px;\n" +
            "      width: 100%;\n" +
            "      background: var(--card-bg);\n" +
            "      border: 1px solid var(--border);\n" +
            "      border-radius: 20px;\n" +
            "      padding: 36px;\n" +
            "      backdrop-filter: blur(16px);\n" +
            "      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px var(--primary-glow);\n" +
            "    }\n" +
            "    .header {\n" +
            "      display: flex;\n" +
            "      align-items: center;\n" +
            "      justify-content: space-between;\n" +
            "      border-bottom: 1px solid var(--border);\n" +
            "      padding-bottom: 24px;\n" +
            "      margin-bottom: 28px;\n" +
            "    }\n" +
            "    .brand {\n" +
            "      display: flex;\n" +
            "      align-items: center;\n" +
            "      gap: 14px;\n" +
            "    }\n" +
            "    .logo {\n" +
            "      width: 44px;\n" +
            "      height: 44px;\n" +
            "      background: linear-gradient(135deg, #ef4444, #dc2626);\n" +
            "      border-radius: 12px;\n" +
            "      display: flex;\n" +
            "      align-items: center;\n" +
            "      justify-content: center;\n" +
            "      font-size: 22px;\n" +
            "      box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);\n" +
            "    }\n" +
            "    h1 {\n" +
            "      font-size: 24px;\n" +
            "      font-weight: 800;\n" +
            "      letter-spacing: -0.5px;\n" +
            "      background: linear-gradient(135deg, #ffffff 40%, #94a3b8);\n" +
            "      -webkit-background-clip: text;\n" +
            "      -webkit-text-fill-color: transparent;\n" +
            "    }\n" +
            "    .status-badge {\n" +
            "      display: inline-flex;\n" +
            "      align-items: center;\n" +
            "      gap: 8px;\n" +
            "      padding: 6px 14px;\n" +
            "      background: rgba(16, 185, 129, 0.12);\n" +
            "      border: 1px solid rgba(16, 185, 129, 0.3);\n" +
            "      border-radius: 999px;\n" +
            "      color: #34d399;\n" +
            "      font-size: 13px;\n" +
            "      font-weight: 600;\n" +
            "    }\n" +
            "    .pulse {\n" +
            "      width: 8px;\n" +
            "      height: 8px;\n" +
            "      background: #10b981;\n" +
            "      border-radius: 50%;\n" +
            "      box-shadow: 0 0 10px #10b981;\n" +
            "      animation: pulse 1.8s infinite;\n" +
            "    }\n" +
            "    @keyframes pulse {\n" +
            "      0%, 100% { opacity: 1; transform: scale(1); }\n" +
            "      50% { opacity: 0.4; transform: scale(0.85); }\n" +
            "    }\n" +
            "    .grid-2 {\n" +
            "      display: grid;\n" +
            "      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n" +
            "      gap: 16px;\n" +
            "      margin-bottom: 24px;\n" +
            "    }\n" +
            "    .action-card {\n" +
            "      background: rgba(255, 255, 255, 0.03);\n" +
            "      border: 1px solid var(--border);\n" +
            "      border-radius: 14px;\n" +
            "      padding: 20px;\n" +
            "      transition: all 0.2s ease;\n" +
            "      text-decoration: none;\n" +
            "      color: inherit;\n" +
            "      display: flex;\n" +
            "      flex-direction: column;\n" +
            "      justify-content: space-between;\n" +
            "    }\n" +
            "    .action-card:hover {\n" +
            "      border-color: rgba(239, 68, 68, 0.5);\n" +
            "      background: rgba(239, 68, 68, 0.05);\n" +
            "      transform: translateY(-2px);\n" +
            "    }\n" +
            "    .action-title {\n" +
            "      font-size: 16px;\n" +
            "      font-weight: 700;\n" +
            "      margin-bottom: 6px;\n" +
            "      display: flex;\n" +
            "      align-items: center;\n" +
            "      gap: 8px;\n" +
            "    }\n" +
            "    .action-desc {\n" +
            "      font-size: 13px;\n" +
            "      color: var(--text-muted);\n" +
            "      line-height: 1.5;\n" +
            "      margin-bottom: 16px;\n" +
            "    }\n" +
            "    .btn {\n" +
            "      display: inline-flex;\n" +
            "      align-items: center;\n" +
            "      justify-content: center;\n" +
            "      gap: 8px;\n" +
            "      padding: 10px 18px;\n" +
            "      border-radius: 10px;\n" +
            "      font-size: 14px;\n" +
            "      font-weight: 600;\n" +
            "      text-decoration: none;\n" +
            "      cursor: pointer;\n" +
            "      transition: all 0.2s;\n" +
            "      border: none;\n" +
            "    }\n" +
            "    .btn-primary {\n" +
            "      background: linear-gradient(135deg, #ef4444, #dc2626);\n" +
            "      color: #fff;\n" +
            "      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);\n" +
            "    }\n" +
            "    .btn-primary:hover {\n" +
            "      background: #dc2626;\n" +
            "      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);\n" +
            "    }\n" +
            "    .btn-secondary {\n" +
            "      background: rgba(255, 255, 255, 0.08);\n" +
            "      color: #f1f5f9;\n" +
            "      border: 1px solid var(--border);\n" +
            "    }\n" +
            "    .btn-secondary:hover {\n" +
            "      background: rgba(255, 255, 255, 0.14);\n" +
            "    }\n" +
            "    .db-guide {\n" +
            "      background: rgba(15, 23, 42, 0.8);\n" +
            "      border: 1px solid rgba(14, 165, 233, 0.2);\n" +
            "      border-radius: 14px;\n" +
            "      padding: 20px;\n" +
            "      margin-bottom: 24px;\n" +
            "    }\n" +
            "    .db-guide h3 {\n" +
            "      font-size: 15px;\n" +
            "      color: #38bdf8;\n" +
            "      margin-bottom: 12px;\n" +
            "      display: flex;\n" +
            "      align-items: center;\n" +
            "      gap: 8px;\n" +
            "    }\n" +
            "    .param-row {\n" +
            "      display: flex;\n" +
            "      align-items: center;\n" +
            "      justify-content: space-between;\n" +
            "      padding: 8px 12px;\n" +
            "      background: rgba(0, 0, 0, 0.25);\n" +
            "      border-radius: 8px;\n" +
            "      margin-bottom: 6px;\n" +
            "      font-family: 'JetBrains Mono', monospace;\n" +
            "      font-size: 13px;\n" +
            "    }\n" +
            "    .param-key { color: var(--text-muted); }\n" +
            "    .param-val {\n" +
            "      color: #f8fafc;\n" +
            "      font-weight: 600;\n" +
            "      display: flex;\n" +
            "      align-items: center;\n" +
            "      gap: 10px;\n" +
            "    }\n" +
            "    .copy-btn {\n" +
            "      background: rgba(255, 255, 255, 0.1);\n" +
            "      border: 1px solid var(--border);\n" +
            "      color: #94a3b8;\n" +
            "      border-radius: 6px;\n" +
            "      padding: 3px 8px;\n" +
            "      font-size: 11px;\n" +
            "      cursor: pointer;\n" +
            "    }\n" +
            "    .copy-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.2); }\n" +
            "    .stats-bar {\n" +
            "      display: grid;\n" +
            "      grid-template-columns: repeat(5, 1fr);\n" +
            "      gap: 10px;\n" +
            "      background: rgba(0, 0, 0, 0.2);\n" +
            "      border-radius: 12px;\n" +
            "      padding: 14px;\n" +
            "      text-align: center;\n" +
            "    }\n" +
            "    .stat-item .num {\n" +
            "      font-size: 20px;\n" +
            "      font-weight: 800;\n" +
            "      color: #f1f5f9;\n" +
            "    }\n" +
            "    .stat-item .label {\n" +
            "      font-size: 11px;\n" +
            "      color: var(--text-muted);\n" +
            "      text-transform: uppercase;\n" +
            "      letter-spacing: 0.5px;\n" +
            "      margin-top: 2px;\n" +
            "    }\n" +
            "    @media (max-width: 640px) {\n" +
            "      .stats-bar { grid-template-columns: repeat(2, 1fr); }\n" +
            "    }\n" +
            "  </style>\n" +
            "</head>\n" +
            "<body>\n" +
            "  <div class=\"container\">\n" +
            "    <div class=\"header\">\n" +
            "      <div class=\"brand\">\n" +
            "        <div class=\"logo\">🩸</div>\n" +
            "        <div>\n" +
            "          <h1>VitalPulse Backend Gateway</h1>\n" +
            "          <p style=\"font-size: 13px; color: var(--text-muted); margin-top: 2px;\">Spring Boot 3.2.3 · H2 In-Memory Clinical Engine</p>\n" +
            "        </div>\n" +
            "      </div>\n" +
            "      <div class=\"status-badge\">\n" +
            "        <span class=\"pulse\"></span> Active on Port 8080\n" +
            "      </div>\n" +
            "    </div>\n" +
            "\n" +
            "    <div class=\"grid-2\">\n" +
            "      <div class=\"action-card\">\n" +
            "        <div>\n" +
            "          <div class=\"action-title\"><span>🗄️</span> H2 Database Console</div>\n" +
            "          <div class=\"action-desc\">Manage relational SQL tables, execute queries on donors, hospitals, and access logs.</div>\n" +
            "        </div>\n" +
            "        <a href=\"/h2-console\" class=\"btn btn-primary\" target=\"_blank\">Open H2 Web Console &rarr;</a>\n" +
            "      </div>\n" +
            "\n" +
            "      <div class=\"action-card\">\n" +
            "        <div>\n" +
            "          <div class=\"action-title\"><span>🌐</span> React Frontend Grid</div>\n" +
            "          <div class=\"action-desc\">Live emergency matching map, donor dashboard, notification toasts, and admin center.</div>\n" +
            "        </div>\n" +
            "        <a href=\"http://localhost:3000\" class=\"btn btn-secondary\" target=\"_blank\">Open Frontend UI (Port 3000) &rarr;</a>\n" +
            "      </div>\n" +
            "    </div>\n" +
            "\n" +
            "    <div class=\"db-guide\">\n" +
            "      <h3><span>⚡</span> H2 Database Connection Credentials</h3>\n" +
            "      <p style=\"font-size: 13px; color: var(--text-muted); margin-bottom: 12px;\">When the H2 Console login form opens, verify or paste the JDBC URL below and click <strong>Connect</strong>:</p>\n" +
            "      <div class=\"param-row\">\n" +
            "        <span class=\"param-key\">Saved Settings</span>\n" +
            "        <span class=\"param-val\">Generic H2 (Embedded)</span>\n" +
            "      </div>\n" +
            "      <div class=\"param-row\">\n" +
            "        <span class=\"param-key\">Driver Class</span>\n" +
            "        <span class=\"param-val\">org.h2.Driver</span>\n" +
            "      </div>\n" +
            "      <div class=\"param-row\">\n" +
            "        <span class=\"param-key\">JDBC URL</span>\n" +
            "        <span class=\"param-val\" style=\"color: #38bdf8;\">\n" +
            "          jdbc:h2:mem:vitalpulse_db\n" +
            "          <button class=\"copy-btn\" onclick=\"navigator.clipboard.writeText('jdbc:h2:mem:vitalpulse_db'); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy', 1500);\">Copy</button>\n" +
            "        </span>\n" +
            "      </div>\n" +
            "      <div class=\"param-row\">\n" +
            "        <span class=\"param-key\">User Name</span>\n" +
            "        <span class=\"param-val\">sa</span>\n" +
            "      </div>\n" +
            "      <div class=\"param-row\">\n" +
            "        <span class=\"param-key\">Password</span>\n" +
            "        <span class=\"param-val\" style=\"color: #64748b;\">(leave blank)</span>\n" +
            "      </div>\n" +
            "    </div>\n" +
            "\n" +
            "    <div class=\"stats-bar\">\n" +
            "      <div class=\"stat-item\">\n" +
            "        <div class=\"num\" style=\"color: #38bdf8;\">" + userCount + "</div>\n" +
            "        <div class=\"label\">Users</div>\n" +
            "      </div>\n" +
            "      <div class=\"stat-item\">\n" +
            "        <div class=\"num\" style=\"color: #ef4444;\">" + donorCount + "</div>\n" +
            "        <div class=\"label\">Donors</div>\n" +
            "      </div>\n" +
            "      <div class=\"stat-item\">\n" +
            "        <div class=\"num\" style=\"color: #10b981;\">" + hospitalCount + "</div>\n" +
            "        <div class=\"label\">Hospitals</div>\n" +
            "      </div>\n" +
            "      <div class=\"stat-item\">\n" +
            "        <div class=\"num\" style=\"color: #f59e0b;\">" + requestCount + "</div>\n" +
            "        <div class=\"label\">Requests</div>\n" +
            "      </div>\n" +
            "      <div class=\"stat-item\">\n" +
            "        <div class=\"num\" style=\"color: #a855f7;\">" + logCount + "</div>\n" +
            "        <div class=\"label\">Audit Logs</div>\n" +
            "      </div>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "</body>\n" +
            "</html>";
    }
}
