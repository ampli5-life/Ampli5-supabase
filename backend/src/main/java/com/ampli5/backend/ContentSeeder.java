package com.ampli5.backend;

import com.ampli5.backend.auth.User;
import com.ampli5.backend.auth.UserRepository;
import com.ampli5.backend.blog.BlogPost;
import com.ampli5.backend.blog.BlogPostRepository;
import com.ampli5.backend.team.TeamMember;
import com.ampli5.backend.team.TeamMemberRepository;
import com.ampli5.backend.testimonial.Testimonial;
import com.ampli5.backend.testimonial.TestimonialRepository;
import com.ampli5.backend.video.Video;
import com.ampli5.backend.video.VideoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class ContentSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VideoRepository videoRepository;
    private final BlogPostRepository blogPostRepository;
    private final TestimonialRepository testimonialRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final PasswordEncoder passwordEncoder;

    public ContentSeeder(UserRepository userRepository,
                         VideoRepository videoRepository,
                         BlogPostRepository blogPostRepository,
                         TestimonialRepository testimonialRepository,
                         TeamMemberRepository teamMemberRepository,
                         PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.videoRepository = videoRepository;
        this.blogPostRepository = blogPostRepository;
        this.testimonialRepository = testimonialRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        seedVideos();
        seedBlog();
        seedTestimonials();
        seedTeam();
    }

    private void seedAdmin() {
        if (userRepository.findByEmail("admin@ampli5.app").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@ampli5.app");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Admin User");
            admin.setAdmin(true);
            userRepository.save(admin);
        }
    }

    private void seedVideos() {
        if (videoRepository.count() > 0) return;

        OffsetDateTime now = OffsetDateTime.now();
        List<Video> samples = List.of(
                video("Morning Stretch", "A gentle 10-minute stretch to start your day.", "https://www.youtube.com/watch?v=4Bkaa1lEhnk", "Beginner", 10, "Ampli5", false, now),
                video("Breathing Basics", "Learn foundational breathing for meditation.", "https://www.youtube.com/watch?v=4Bkaa1lEhnk", "Beginner", 5, "Ampli5", false, now),
                video("The Journey", "An immersive flow for mind and body.", "https://www.youtube.com/watch?v=rEuGIWFfj2E", "Beginner", 15, "Ampli5", true, now),
                video("Advanced Flow", "Full premium yoga flow for subscribers.", "https://www.youtube.com/watch?v=4Bkaa1lEhnk", "Intermediate", 25, "Ampli5", true, now),
                video("Evening Wind-Down", "Calming sequence to end your day.", "https://www.youtube.com/watch?v=rEuGIWFfj2E", "Beginner", 12, "Ampli5", true, now)
        );
        videoRepository.saveAll(samples);
    }

    private void seedBlog() {
        if (blogPostRepository.count() > 0) return;

        OffsetDateTime now = OffsetDateTime.now();

        BlogPost p1 = new BlogPost();
        p1.setTitle("5 Morning Stretches to Start Your Day");
        p1.setExcerpt("A gentle sequence to wake up your body, open your joints, and set a calm tone for the day ahead.");
        p1.setTag("Beginners");
        p1.setPublishedAt(now.minusDays(10));

        BlogPost p2 = new BlogPost();
        p2.setTitle("Breathwork Basics: How to Use Pranayama");
        p2.setExcerpt("Learn simple breathing techniques you can use on or off the mat to reduce stress and improve focus.");
        p2.setTag("Mindfulness");
        p2.setPublishedAt(now.minusDays(7));

        BlogPost p3 = new BlogPost();
        p3.setTitle("Creating a Consistent Home Practice");
        p3.setExcerpt("Practical tips for building a sustainable yoga habit that fits your real life—not the perfect schedule.");
        p3.setTag("Lifestyle");
        p3.setPublishedAt(now.minusDays(3));

        BlogPost p4 = new BlogPost();
        p4.setTitle("How Yoga Supports Better Sleep");
        p4.setExcerpt("Discover poses and short evening rituals that help your nervous system unwind before bed.");
        p4.setTag("Sleep");
        p4.setPublishedAt(now.minusDays(1));

        blogPostRepository.saveAll(List.of(p1, p2, p3, p4));
    }

    private void seedTestimonials() {
        if (testimonialRepository.count() > 0) return;

        Testimonial t1 = new Testimonial();
        t1.setText("Ampli5 has completely changed my relationship with yoga. I finally have a routine I can stick to.");
        t1.setAuthor("Sarah M.");

        Testimonial t2 = new Testimonial();
        t2.setText("The classes feel like practicing in a studio, but I can join from my living room between meetings.");
        t2.setAuthor("James L.");

        Testimonial t3 = new Testimonial();
        t3.setText("As a beginner I never felt lost—the instructors explain everything in such a friendly, clear way.");
        t3.setAuthor("Priya K.");

        testimonialRepository.saveAll(List.of(t1, t2, t3));
    }

    private void seedTeam() {
        if (teamMemberRepository.count() > 0) return;

        TeamMember m1 = new TeamMember();
        m1.setName("Ananya Rao");
        m1.setRole("Founder & Lead Instructor");
        m1.setBio("Certified yoga teacher with over 10 years of experience helping students build sustainable, joyful practices.");
        m1.setAvatarUrl("https://images.unsplash.com/photo-1594744803329-2fe81b333c67?w=600&h=600&fit=crop");

        TeamMember m2 = new TeamMember();
        m2.setName("Michael Chen");
        m2.setRole("Breathwork & Meditation Coach");
        m2.setBio("Specializes in simple, science-backed breathwork techniques for busy professionals.");
        m2.setAvatarUrl("https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=600&h=600&fit=crop");

        TeamMember m3 = new TeamMember();
        m3.setName("Leah Thompson");
        m3.setRole("Mobility & Recovery Specialist");
        m3.setBio("Focuses on gentle mobility, recovery, and nervous system regulation for all bodies and ages.");
        m3.setAvatarUrl("https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=600&fit=crop");

        teamMemberRepository.saveAll(List.of(m1, m2, m3));
    }

    private static Video video(String title, String description, String youtubeUrl, String category, int duration, String instructor, boolean paid, OffsetDateTime now) {
        Video v = new Video();
        v.setTitle(title);
        v.setDescription(description);
        v.setYoutubeUrl(youtubeUrl);
        v.setThumbnailUrl(thumbnailFromYoutubeUrl(youtubeUrl));
        v.setCategory(category);
        v.setDuration(duration);
        v.setInstructor(instructor);
        v.setPaid(paid);
        v.setCreatedAt(now);
        v.setUpdatedAt(now);
        return v;
    }

    private static String thumbnailFromYoutubeUrl(String url) {
        if (url == null || url.isBlank()) return "";
        String id = null;
        if (url.contains("youtu.be/")) {
            int i = url.indexOf("youtu.be/") + 9;
            int end = url.indexOf('?', i) > 0 ? url.indexOf('?', i) : url.length();
            id = url.substring(i, end).trim();
        } else if (url.contains("v=")) {
            int i = url.indexOf("v=") + 2;
            int end = url.indexOf('&', i) > 0 ? url.indexOf('&', i) : url.length();
            id = url.substring(i, Math.min(i + 11, end)).trim();
        }
        return id != null && !id.isEmpty() ? "https://img.youtube.com/vi/" + id + "/mqdefault.jpg" : "";
    }
}
