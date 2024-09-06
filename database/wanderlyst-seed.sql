-- test admin/user password = "password"
INSERT INTO users (username, password, first_name, last_name, email, is_admin)
VALUES ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'Admin',
        'testadmin@test.com'
        TRUE),
        ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'user',
        'testuser@test.com',
        FALSE);

INSERT INTO tags (name, description)
VALUES 
("Foodie", "Savor the world one bite at a time. Dive into a journey packed with delicious local cuisines, hidden culinary gems, and must-try dishes that will leave your taste buds tingling."),
("Explorer", "Step off the beaten path and uncover the unknown. From ancient ruins to vibrant cityscapes, let your curiosity guide you through unforgettable experiences."),
("Shopaholic", "Get ready to shop 'til you drop! Whether it's bustling markets, unique boutiques, or luxurious malls, find the best spots to satisfy your shopping spree."),
("Naturalist", "Breath in the fresh air and reconnect with the wild. From majestic mountains to serene beaches, discover the beauty of nature with adventures that inspire awe."),
("Daredevil", "For the thrill-seekers. Climb higher, dive deeper, and push your limits with action-packed itineraries filled with extreme sports and adrenaline-pumping activities."),
("Flâneur", "Embrace the art of wandering. Stroll through charming streets, soak in the local atmosphere, and watch the world go by with an itinerary designed for the curious wanderer."),
("Reveller", "Party like there's no tomorrow. Whether it's nighlife, music festivals, or the hottest events, join the celebration and dance the night away."),
("Aesthete", "Step into the heart of culture. Explore museums, historical landmarks, and art galleries. Immerse yourself in the stories, art, and traditions of every destination."),
("Relaxationist", "Find your bliss. From peaceful spas to serene beaches, recharge your soul with itineraries designed for the ultimate relaxation and tranquility."),
("Photographer", "Capture the world's beauty through your lens. Discover the most scenic spots, from breathtaking landscapes to vibrant city views, perfect for your next snapshot.")