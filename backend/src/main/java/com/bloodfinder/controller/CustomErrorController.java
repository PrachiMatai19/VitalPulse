package com.bloodfinder.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping(value = "/error", produces = "text/html;charset=UTF-8")
    @ResponseBody
    public String handleError(HttpServletRequest request) {
        return "<!DOCTYPE html>\n" +
            "<html lang=\"en\">\n" +
            "<head>\n" +
            "  <meta charset=\"UTF-8\">\n" +
            "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
            "  <title>VitalPulse Gateway - Resource Navigation</title>\n" +
            "  <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap\" rel=\"stylesheet\">\n" +
            "  <style>\n" +
            "    body {\n" +
            "      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;\n" +
            "      background: #090d16;\n" +
            "      color: #f1f5f9;\n" +
            "      display: flex;\n" +
            "      flex-direction: column;\n" +
            "      align-items: center;\n" +
            "      justify-content: center;\n" +
            "      min-height: 100vh;\n" +
            "      margin: 0;\n" +
            "      padding: 24px;\n" +
            "      text-align: center;\n" +
            "    }\n" +
            "    .card {\n" +
            "      background: rgba(18, 24, 38, 0.8);\n" +
            "      border: 1px solid rgba(255, 255, 255, 0.1);\n" +
            "      border-radius: 16px;\n" +
            "      padding: 32px;\n" +
            "      max-width: 500px;\n" +
            "      width: 100%;\n" +
            "    }\n" +
            "    h1 { font-size: 22px; margin-bottom: 8px; }\n" +
            "    p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }\n" +
            "    .btn-group { display: flex; gap: 12px; justify-content: center; }\n" +
            "    .btn {\n" +
            "      padding: 10px 20px;\n" +
            "      border-radius: 8px;\n" +
            "      font-weight: 600;\n" +
            "      text-decoration: none;\n" +
            "      font-size: 14px;\n" +
            "    }\n" +
            "    .btn-primary { background: #ef4444; color: #fff; }\n" +
            "    .btn-secondary { background: rgba(255, 255, 255, 0.1); color: #fff; }\n" +
            "  </style>\n" +
            "</head>\n" +
            "<body>\n" +
            "  <div class=\"card\">\n" +
            "    <h1>VitalPulse Navigation</h1>\n" +
            "    <p>The requested endpoint was not found on the backend. Please select a destination below:</p>\n" +
            "    <div class=\"btn-group\">\n" +
            "      <a href=\"/\" class=\"btn btn-primary\">Backend Dashboard</a>\n" +
            "      <a href=\"/h2-console\" class=\"btn btn-secondary\">H2 SQL Console</a>\n" +
            "      <a href=\"http://localhost:3000\" class=\"btn btn-secondary\">Frontend UI</a>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "</body>\n" +
            "</html>";
    }
}
