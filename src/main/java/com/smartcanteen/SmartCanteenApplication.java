package com.smartcanteen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SmartCanteenApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartCanteenApplication.class, args);
        System.out.println("=================================================");
        System.out.println("  SMART CANTEEN BACKEND STARTED SUCCESSFULLY    ");
        System.out.println("  AAACET Domain Enforced (@aaacet.ac.in)         ");
        System.out.println("=================================================");
    }
}
