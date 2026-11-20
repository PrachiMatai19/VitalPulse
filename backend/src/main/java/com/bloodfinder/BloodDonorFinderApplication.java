package com.bloodfinder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BloodDonorFinderApplication {

    public static void main(String[] args) {
        SpringApplication.run(BloodDonorFinderApplication.class, args);
        System.out.println("=================================================================");
        System.out.println("  VitalPulse Emergency Blood Network Backend Running on Port 8080");
        System.out.println("  H2 Web Console: http://localhost:8080/h2-console");
        System.out.println("  JDBC URL: jdbc:h2:mem:vitalpulse_db | User: sa | Password: (none)");
        System.out.println("=================================================================");
    }
}
