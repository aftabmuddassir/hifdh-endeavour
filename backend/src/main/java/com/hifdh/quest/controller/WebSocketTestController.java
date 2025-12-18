package com.hifdh.quest.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Controller
public class WebSocketTestController {

    @MessageMapping("/test")
    @SendTo("/topic/test")
    public Map<String, Object> test(Map<String, String> message) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Echo: " + message.get("text"));
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }
}
