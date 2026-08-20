package com.smarttravel.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;


@Configuration
public class RestClientConfig {
    @Value("${recommendation.service.url}")
    private String recommendationServiceUrl;

    @Bean
    public RestClient restClient() {
        // Use SimpleClientHttpRequestFactory to force HTTP/1.1
        // JdkClientHttpRequestFactory (default in Java 21) uses HTTP/2 upgrade
        // which is not supported by Python uvicorn
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(30000);
        return RestClient.builder()
                .requestFactory(factory)
                .baseUrl(recommendationServiceUrl)
                .build();
    }
}
