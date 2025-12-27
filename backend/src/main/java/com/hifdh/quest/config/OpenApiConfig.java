package com.hifdh.quest.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger configuration for API documentation.
 * Accessible at: http://localhost:8080/swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${app.server-url:}")
    private String productionServerUrl;

    @Bean
    public OpenAPI hifdhQuestOpenAPI() {
        // Log the production server URL for debugging
        System.out.println(" DEBUG: productionServerUrl = '" + productionServerUrl + "'");
        System.out.println(" DEBUG: isEmpty? " + productionServerUrl.isEmpty());

        Server localServer = new Server();
        localServer.setUrl("http://localhost:" + serverPort);
        localServer.setDescription("Local Development Server");

        // Production server (if configured)
        Server productionServer = new Server();
        productionServer.setUrl(productionServerUrl.isEmpty()
            ? "http://localhost:" + serverPort
            : productionServerUrl);
        productionServer.setDescription("Production Server");

        Contact contact = new Contact();
        contact.setName("Hifdh Quest Team");
        contact.setEmail("support@hifdhquest.com");

        License license = new License();
        license.setName("MIT License");
        license.setUrl("https://opensource.org/licenses/MIT");

        Info info = new Info()
            .title("Hifdh Quest API")
            .version("1.0.0")
            .description("""
                **Hifdh Quest** - Gamified Quran Memorization Platform

                This API provides endpoints for managing real-time multiplayer Quran memorization games.

                ## Features
                - 🎮 Real-time multiplayer game sessions
                - 🔊 Audio integration with EveryAyah.com
                - ⚡ WebSocket support for live updates
                - 🏆 Scoreboard and leaderboards
                - 🎯 5 question types with varying difficulty
                - 🚫 Anti-spam buzzer system (3-press rule)

                ## Question Types
                - **Guess Surah** (10 pts) - Identify which Surah the ayat is from
                - **Guess Meaning** (15 pts) - Translate or explain the ayat
                - **Guess Next Ayat** (20 pts) - Recite the next ayat in sequence
                - **Guess Previous Ayat** (25 pts) - Recite the previous ayat in sequence
                - **Guess Reciter** (15 pts) - Identify the reciter from audio

                ## WebSocket Endpoints
                - **Connect**: `ws://localhost:8080/ws`
                - **Topics**: `/topic/game/{sessionId}/*`
                - **Send**: `/app/game/{sessionId}/*`

                ## Getting Started
                1. Create a game session using POST `/api/game/create`
                2. Start the game using POST `/api/game/{sessionId}/start`
                3. Create rounds using POST `/api/game/{sessionId}/rounds`
                4. Participants press buzzer via WebSocket or REST API
                5. Admin validates answers and awards points

                For complete documentation, see [API_REFERENCE.md](https://github.com/your-repo/hifdh-quest)
                """)
            .contact(contact)
            .license(license);

        var servers = productionServerUrl.isEmpty()
            ? List.of(localServer)
            : List.of(productionServer, localServer);

        System.out.println(" DEBUG: Registered servers:");
        servers.forEach(s -> System.out.println("  - " + s.getDescription() + ": " + s.getUrl()));

        return new OpenAPI()
            .info(info)
            .servers(servers);
    }
}
