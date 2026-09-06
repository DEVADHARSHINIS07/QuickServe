package com.smartcanteen.service;

import com.smartcanteen.dto.DashboardResponse;
import com.smartcanteen.model.FoodItem;
import com.smartcanteen.repository.FoodRepository;
import com.smartcanteen.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private FoodRepository foodRepository;

    public DashboardResponse getDashboardMetrics() {
        DashboardResponse resp = new DashboardResponse();
        resp.setTodayOrders(orderRepository.getTodayOrdersCount());
        resp.setPendingOrders(orderRepository.getStatusCount("Order Placed"));
        resp.setAcceptedOrders(orderRepository.getStatusCount("Order Accepted"));
        resp.setPreparingOrders(orderRepository.getStatusCount("Preparing"));
        resp.setReadyOrders(orderRepository.getStatusCount("Ready for Pickup"));
        resp.setCompletedOrders(orderRepository.getStatusCount("Completed"));
        resp.setRejectedOrders(orderRepository.getStatusCount("Rejected"));

        BigDecimal rev = orderRepository.getTodayTotalRevenue();
        resp.setTodayRevenue(rev != null ? rev : BigDecimal.ZERO);

        BigDecimal upi = orderRepository.getTodayUpiRevenue();
        resp.setUpiRevenue(upi != null ? upi : BigDecimal.ZERO);

        BigDecimal cash = orderRepository.getTodayCashRevenue();
        resp.setCashRevenue(cash != null ? cash : BigDecimal.ZERO);

        List<FoodItem> allFoods = foodRepository.findAll();
        resp.setPopularFoods(allFoods.stream().limit(5).toList());
        resp.setLowStockFoods(foodRepository.findLowStockFoods());

        return resp;
    }
}
