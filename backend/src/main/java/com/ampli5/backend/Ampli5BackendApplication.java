package com.ampli5.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class Ampli5BackendApplication {

    static {
        loadEnvFile();
    }

    /** Load .env from project root or current dir into system properties so PAYPAL_* etc. are available when running locally. */
    private static void loadEnvFile() {
        String dir = System.getProperty("user.dir");
        if (dir == null) return;
        List<Path> toTry = new ArrayList<>();
        toTry.add(Paths.get(dir));
        Path parent = Paths.get(dir).getParent();
        if (parent != null) toTry.add(parent);
        for (Path base : toTry) {
            Path envPath = base.resolve(".env");
            if (!Files.isRegularFile(envPath)) continue;
            try {
                for (String line : Files.readAllLines(envPath)) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) continue;
                    int eq = line.indexOf('=');
                    if (eq > 0) {
                        String key = line.substring(0, eq).trim();
                        String value = line.substring(eq + 1).trim();
                        if (value.startsWith("\"") && value.endsWith("\"")) value = value.substring(1, value.length() - 1);
                        if (value.startsWith("'") && value.endsWith("'")) value = value.substring(1, value.length() - 1);
                        if (!key.isEmpty() && System.getProperty(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                }
                break;
            } catch (Exception ignored) {
                // try next path
            }
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(Ampli5BackendApplication.class, args);
    }
}

