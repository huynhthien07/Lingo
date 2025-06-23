import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const technologyWords = [
    // Basic Technology Terms
    { word: "algorithm", vietnameseMeaning: "thuật toán" },
    { word: "artificial intelligence", vietnameseMeaning: "trí tuệ nhân tạo" },
    { word: "automation", vietnameseMeaning: "tự động hóa" },
    { word: "bandwidth", vietnameseMeaning: "băng thông" },
    { word: "blockchain", vietnameseMeaning: "chuỗi khối" },
    { word: "browser", vietnameseMeaning: "trình duyệt" },
    { word: "cache", vietnameseMeaning: "bộ nhớ đệm" },
    { word: "cloud computing", vietnameseMeaning: "điện toán đám mây" },
    { word: "cryptocurrency", vietnameseMeaning: "tiền điện tử" },
    { word: "cybersecurity", vietnameseMeaning: "an ninh mạng" },
    
    // Programming & Development
    { word: "debugging", vietnameseMeaning: "gỡ lỗi" },
    { word: "deployment", vietnameseMeaning: "triển khai" },
    { word: "framework", vietnameseMeaning: "khung làm việc" },
    { word: "frontend", vietnameseMeaning: "giao diện người dùng" },
    { word: "backend", vietnameseMeaning: "phần hậu trường" },
    { word: "database", vietnameseMeaning: "cơ sở dữ liệu" },
    { word: "API", vietnameseMeaning: "giao diện lập trình ứng dụng" },
    { word: "repository", vietnameseMeaning: "kho lưu trữ" },
    { word: "version control", vietnameseMeaning: "kiểm soát phiên bản" },
    { word: "machine learning", vietnameseMeaning: "học máy" },
    
    // Hardware & Devices
    { word: "processor", vietnameseMeaning: "bộ xử lý" },
    { word: "motherboard", vietnameseMeaning: "bo mạch chủ" },
    { word: "graphics card", vietnameseMeaning: "card đồ họa" },
    { word: "solid state drive", vietnameseMeaning: "ổ cứng thể rắn" },
    { word: "router", vietnameseMeaning: "bộ định tuyến" },
    { word: "firewall", vietnameseMeaning: "tường lửa" },
    { word: "server", vietnameseMeaning: "máy chủ" },
    { word: "smartphone", vietnameseMeaning: "điện thoại thông minh" },
    { word: "tablet", vietnameseMeaning: "máy tính bảng" },
    { word: "wearable technology", vietnameseMeaning: "công nghệ đeo được" },
    
    // Internet & Web
    { word: "domain name", vietnameseMeaning: "tên miền" },
    { word: "hosting", vietnameseMeaning: "lưu trữ web" },
    { word: "SSL certificate", vietnameseMeaning: "chứng chỉ SSL" },
    { word: "responsive design", vietnameseMeaning: "thiết kế đáp ứng" },
    { word: "user interface", vietnameseMeaning: "giao diện người dùng" },
    { word: "user experience", vietnameseMeaning: "trải nghiệm người dùng" },
    { word: "search engine", vietnameseMeaning: "công cụ tìm kiếm" },
    { word: "social media", vietnameseMeaning: "mạng xã hội" },
    { word: "e-commerce", vietnameseMeaning: "thương mại điện tử" },
    { word: "digital marketing", vietnameseMeaning: "tiếp thị số" },
    
    // Data & Analytics
    { word: "big data", vietnameseMeaning: "dữ liệu lớn" },
    { word: "data mining", vietnameseMeaning: "khai thác dữ liệu" },
    { word: "analytics", vietnameseMeaning: "phân tích dữ liệu" },
    { word: "visualization", vietnameseMeaning: "trực quan hóa" },
    { word: "metadata", vietnameseMeaning: "siêu dữ liệu" },
    { word: "encryption", vietnameseMeaning: "mã hóa" },
    { word: "backup", vietnameseMeaning: "sao lưu" },
    { word: "synchronization", vietnameseMeaning: "đồng bộ hóa" },
    { word: "compression", vietnameseMeaning: "nén dữ liệu" },
    { word: "streaming", vietnameseMeaning: "phát trực tuyến" },
    
    // Emerging Technologies
    { word: "virtual reality", vietnameseMeaning: "thực tế ảo" },
    { word: "augmented reality", vietnameseMeaning: "thực tế tăng cường" },
    { word: "internet of things", vietnameseMeaning: "internet vạn vật" },
    { word: "5G network", vietnameseMeaning: "mạng 5G" },
    { word: "quantum computing", vietnameseMeaning: "điện toán lượng tử" },
    { word: "biometrics", vietnameseMeaning: "sinh trắc học" },
    { word: "nanotechnology", vietnameseMeaning: "công nghệ nano" },
    { word: "robotics", vietnameseMeaning: "robot học" },
    { word: "drone", vietnameseMeaning: "máy bay không người lái" },
    { word: "3D printing", vietnameseMeaning: "in 3D" },
    
    // Software & Applications
    { word: "operating system", vietnameseMeaning: "hệ điều hành" },
    { word: "application", vietnameseMeaning: "ứng dụng" },
    { word: "software", vietnameseMeaning: "phần mềm" },
    { word: "firmware", vietnameseMeaning: "phần sụn" },
    { word: "plugin", vietnameseMeaning: "plugin" },
    { word: "extension", vietnameseMeaning: "tiện ích mở rộng" },
    { word: "update", vietnameseMeaning: "cập nhật" },
    { word: "upgrade", vietnameseMeaning: "nâng cấp" },
    { word: "installation", vietnameseMeaning: "cài đặt" },
    { word: "configuration", vietnameseMeaning: "cấu hình" },
    
    // Security & Privacy
    { word: "password", vietnameseMeaning: "mật khẩu" },
    { word: "two-factor authentication", vietnameseMeaning: "xác thực hai yếu tố" },
    { word: "malware", vietnameseMeaning: "phần mềm độc hại" },
    { word: "virus", vietnameseMeaning: "vi-rút" },
    { word: "phishing", vietnameseMeaning: "lừa đảo trực tuyến" },
    { word: "spam", vietnameseMeaning: "thư rác" },
    { word: "privacy", vietnameseMeaning: "quyền riêng tư" },
    { word: "data breach", vietnameseMeaning: "rò rỉ dữ liệu" },
    { word: "identity theft", vietnameseMeaning: "đánh cắp danh tính" },
    { word: "digital footprint", vietnameseMeaning: "dấu vết số" },
    
    // Communication & Networking
    { word: "protocol", vietnameseMeaning: "giao thức" },
    { word: "IP address", vietnameseMeaning: "địa chỉ IP" },
    { word: "WiFi", vietnameseMeaning: "WiFi" },
    { word: "bluetooth", vietnameseMeaning: "bluetooth" },
    { word: "ethernet", vietnameseMeaning: "ethernet" },
    { word: "broadband", vietnameseMeaning: "băng rộng" },
    { word: "latency", vietnameseMeaning: "độ trễ" },
    { word: "throughput", vietnameseMeaning: "thông lượng" },
    { word: "network topology", vietnameseMeaning: "cấu trúc mạng" },
    { word: "load balancing", vietnameseMeaning: "cân bằng tải" },
    
    // Business Technology
    { word: "digital transformation", vietnameseMeaning: "chuyển đổi số" },
    { word: "automation", vietnameseMeaning: "tự động hóa" },
    { word: "workflow", vietnameseMeaning: "quy trình làm việc" },
    { word: "productivity software", vietnameseMeaning: "phần mềm năng suất" },
    { word: "collaboration tools", vietnameseMeaning: "công cụ cộng tác" },
    { word: "video conferencing", vietnameseMeaning: "hội nghị truyền hình" },
    { word: "remote work", vietnameseMeaning: "làm việc từ xa" },
    { word: "digital workspace", vietnameseMeaning: "không gian làm việc số" },
    { word: "enterprise software", vietnameseMeaning: "phần mềm doanh nghiệp" },
    { word: "customer relationship management", vietnameseMeaning: "quản lý quan hệ khách hàng" },
    
    // Mobile Technology
    { word: "mobile app", vietnameseMeaning: "ứng dụng di động" },
    { word: "responsive web design", vietnameseMeaning: "thiết kế web đáp ứng" },
    { word: "push notification", vietnameseMeaning: "thông báo đẩy" },
    { word: "geolocation", vietnameseMeaning: "định vị địa lý" },
    { word: "mobile payment", vietnameseMeaning: "thanh toán di động" },
    { word: "QR code", vietnameseMeaning: "mã QR" },
    { word: "near field communication", vietnameseMeaning: "giao tiếp trường gần" },
    { word: "mobile operating system", vietnameseMeaning: "hệ điều hành di động" },
    { word: "app store", vietnameseMeaning: "cửa hàng ứng dụng" },
    { word: "cross-platform", vietnameseMeaning: "đa nền tảng" }
];

const addTechnologyVocabulary = async () => {
    try {
        console.log("Adding technology vocabulary...");
        
        // Get the technology topic ID
        const techTopic = await sql`SELECT id FROM vocabulary_topics WHERE title = 'Technology'`;
        
        if (techTopic.length === 0) {
            console.log("Technology topic not found. Creating it...");
            await db.insert(schema.vocabularyTopics).values({
                title: "Technology",
                description: "Essential technology vocabulary for the digital age",
                imageSrc: "/technology.svg"
            });
            
            const newTopic = await sql`SELECT id FROM vocabulary_topics WHERE title = 'Technology'`;
            var topicId = newTopic[0].id;
        } else {
            var topicId = techTopic[0].id;
        }
        
        console.log(`Using topic ID: ${topicId}`);
        
        // Clear existing words for this topic
        await sql`DELETE FROM vocabulary_words WHERE topic_id = ${topicId}`;
        console.log("Cleared existing technology words");
        
        // Add all technology words
        const wordsToInsert = technologyWords.map(word => ({
            word: word.word,
            topicId: topicId,
            vietnameseMeaning: word.vietnameseMeaning
        }));
        
        await db.insert(schema.vocabularyWords).values(wordsToInsert);
        
        console.log(`✅ Successfully added ${technologyWords.length} technology vocabulary words!`);
        
        // Verify the count
        const count = await sql`SELECT COUNT(*) as count FROM vocabulary_words WHERE topic_id = ${topicId}`;
        console.log(`Total words in Technology topic: ${count[0].count}`);
        
    } catch (error) {
        console.error("❌ Error adding technology vocabulary:", error);
        process.exit(1);
    }
};

addTechnologyVocabulary();
