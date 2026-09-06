package com.smartcanteen.controller;

import com.smartcanteen.dto.ApiResponse;
import com.smartcanteen.dto.DashboardResponse;
import com.smartcanteen.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDailyReport() {
        return ResponseEntity.ok(ApiResponse.ok("Daily report generated", reportService.getDashboardMetrics()));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardResponse>> getSummaryReport() {
        return ResponseEntity.ok(ApiResponse.ok("Canteen summary report", reportService.getDashboardMetrics()));
    }
}
